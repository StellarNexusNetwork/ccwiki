import {defineStore} from 'pinia';
import {markRaw, reactive, ref, shallowReactive, toRaw, watch} from 'vue';

import get from 'lodash/get';
import {z} from "zod"
import axios from "axios";

import {useNoticeStore} from '@/stores/notice';
import {printErrorTree} from "@/utils/error.ts";

const baseUrl = import.meta.env.BASE_URL;
type RepoType = 'local' | 'httpServer';
type FsHandle = FileSystemDirectoryHandle | FileSystemFileHandle;
type FsHandleMap = Record<string, FsHandle>;
type RepoConfigCache = Config | Record<string, unknown>;
type RepoInstance = LocalWikiRepo | HttpWikiRepo;

interface PersistentStorage {
  [id: string]:
    | {  //id不是ulid应该是xxx或xxx：xxx.xx
    type: 'local';
    config: RepoConfigCache;   // 缓存 保证在文件损坏时可以尽可能显示信息
    handle: {
      root: FileSystemDirectoryHandle;
    };
    url?: string;
  }
    | {  //id不是ulid应该是xxx或xxx：xxx.xx
    type: 'httpServer';
    config: RepoConfigCache;   // 缓存 保证在文件损坏时可以尽可能显示信息
    address: string;
    url?: string;
  };
}

interface BaseConfig {
  version: string;
  id: string;       //id不是ulid应该是xxx或xxx：xxx.xx
  name?: Record<string, string>;
}

interface Config extends BaseConfig {
  extra?: Record<string, unknown>
}

interface ImageInfo {
  src: string;
  width: number;
  height: number;
}

interface LocalImageCacheEntry {
  // 最终可用于渲染的图片信息
  info?: ImageInfo;
  // 仅本地仓库会生成 blob URL，需要手动 revoke
  objectUrl?: string;
  // 被页面引用中的计数，用于判断何时可回收
  refCount: number;
  // 并发加载去重：同一地址只加载一次
  pending?: Promise<void>;
}

const FALLBACK_IMAGE_SRC = `${baseUrl}static/icons/not-found.svg`;
const DEFAULT_IMAGE_SIDE = 256;
const MIN_IMAGE_SIDE = 256;
const LOCAL_IMAGE_CACHE_LIMIT = 256;
const REMOTE_IMAGE_CACHE_LIMIT = 512;
const PERSISTENT_DB_NAME = 'dataSourcesDB';
const PERSISTENT_DB_VERSION = 1;
const PERSISTENT_STORE_NAME = 'dataSources';
let dbPromise: Promise<IDBDatabase> | null = null;

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function logDataSourceError(scope: string, error: unknown, meta?: Record<string, unknown>) {
  console.error(`[DataSources/${scope}] ${toErrorMessage(error)}`, {
    error,
    meta
  });
}

function createFallbackImageInfo(src: string = FALLBACK_IMAGE_SRC): ImageInfo {
  return {
    src,
    width: DEFAULT_IMAGE_SIDE,
    height: DEFAULT_IMAGE_SIDE
  };
}

function normalizeImageSize(width: number, height: number): Pick<ImageInfo, 'width' | 'height'> {
  let safeWidth = width;
  let safeHeight = height;
  const maxSide = Math.max(safeWidth, safeHeight);

  if (maxSide > 0 && maxSide < MIN_IMAGE_SIDE) {
    // 小图统一放大到最短边阈值，避免展示过小
    const scale = MIN_IMAGE_SIDE / maxSide;
    safeWidth = Math.round(safeWidth * scale);
    safeHeight = Math.round(safeHeight * scale);
  }

  return {
    width: safeWidth > 0 ? safeWidth : DEFAULT_IMAGE_SIDE,
    height: safeHeight > 0 ? safeHeight : DEFAULT_IMAGE_SIDE
  };
}

async function probeImageInfo(imgAddress: string): Promise<ImageInfo> {
  const fallback = createFallbackImageInfo();

  return await new Promise((resolve) => {
    const img = new Image();

    const cleanup = () => {
      img.onload = null;
      img.onerror = null;
    };

    img.onload = () => {
      const normalized = normalizeImageSize(img.naturalWidth, img.naturalHeight);
      cleanup();
      resolve({
        src: imgAddress,
        ...normalized
      });
    };

    img.onerror = () => {
      cleanup();
      logDataSourceError('probeImageInfo', new Error('图片加载失败'), {imgAddress});
      resolve(fallback);
    };

    img.decoding = 'async';
    img.src = imgAddress;
  });
}

function hasUrlProtocol(path: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\//.test(path);
}

function isExternalImageSource(path: string): boolean {
  return hasUrlProtocol(path) || path.startsWith('data:') || path.startsWith('blob:');
}

// 配置文件检查项目(必须)
const ConfigSchema = z.looseObject({
  id: z.string(),
  version: z.string(),
  name: z.record(z.string(), z.string()).optional()
})

// 仓库基类：仅描述公共展示属性，不负责实际读写
class WikiRepo {
  // display
  version: string;
  icon: string = FALLBACK_IMAGE_SRC;
  name: Record<string, string>;
  type: RepoType;

  // todo:标记仓库是否损坏

  constructor(config: Config, type: RepoType) {
    this.version = config.version;
    this.name = config.name as Record<string, string> ?? {};
    this.type = type;
  }
}

class LocalWikiRepo extends WikiRepo {
  // data
  rootHandle: FileSystemDirectoryHandle;
  private imageCache: Map<string, LocalImageCacheEntry> = new Map();
  private iconObjectUrl?: string;

  // langHandles: Record<string, FileSystemFileHandle> = {};

  constructor(config: Config, rootHandle: FileSystemDirectoryHandle) {
    super(config, "local");
    this.rootHandle = rootHandle;
  }

  // 初始化本地仓库：仅依赖 rootHandle 做最小化初始化
  async init() {
    await this.initIcon();
  }

  // 从根目录中探测并设置仓库图标（优先 svg/avif/png/jpg）
  private async initIcon() {
    if (this.iconObjectUrl) {
      URL.revokeObjectURL(this.iconObjectUrl);
      this.iconObjectUrl = undefined;
    }

    const iconExts = ['.svg', '.avif', '.png', '.jpg'];
    for (const ext of iconExts) {
      try {
        const iconHandle = await this.rootHandle.getFileHandle(`icon${ext}`);
        const icon = await iconHandle.getFile();
        this.iconObjectUrl = URL.createObjectURL(icon);
        this.icon = this.iconObjectUrl;
        return;
      } catch {
        // continue
      }
    }

    this.icon = FALLBACK_IMAGE_SRC;
  }

  // 仓库卸载时释放所有本地图片 blob URL，防止内存泄漏
  dispose() {
    for (const [address, entry] of this.imageCache) {
      this.revokeCacheEntry(address, entry);
    }
    this.imageCache.clear();

    if (this.iconObjectUrl) {
      URL.revokeObjectURL(this.iconObjectUrl);
      this.iconObjectUrl = undefined;
    }
  }

  private touchCacheEntry(address: string, entry: LocalImageCacheEntry) {
    this.imageCache.delete(address);
    this.imageCache.set(address, entry);
  }

  private revokeCacheEntry(address: string, entry: LocalImageCacheEntry) {
    if (entry.objectUrl) {
      URL.revokeObjectURL(entry.objectUrl);
      entry.objectUrl = undefined;
    }
    this.imageCache.delete(address);
  }

  private trimImageCache() {
    if (this.imageCache.size <= LOCAL_IMAGE_CACHE_LIMIT) {
      return;
    }

    // 只清理“未被引用且不在加载中”的条目，避免误回收正在使用的图片
    for (const [address, entry] of this.imageCache) {
      if (this.imageCache.size <= LOCAL_IMAGE_CACHE_LIMIT) {
        break;
      }
      if (entry.refCount > 0 || entry.pending) {
        continue;
      }

      this.revokeCacheEntry(address, entry);
    }
  }

  // 通过目录路径解析到目标目录句柄；不存在时返回 null
  private async resolveDirectoryHandle(path: string[]): Promise<FileSystemDirectoryHandle | null> {
    let currentHandle: FileSystemDirectoryHandle = this.rootHandle;
    for (const segmentRaw of path) {
      const segment = segmentRaw.trim();
      if (!segment || segment === '.') {
        continue;
      }
      try {
        currentHandle = await currentHandle.getDirectoryHandle(segment);
      } catch (err) {
        logDataSourceError('LocalWikiRepo.resolveDirectoryHandle', err, {segment, path});
        return null;
      }
    }
    return currentHandle;
  }

  // 目录枚举：仅在页面需要展示目录内容时调用
  async listDir(path: string[]): Promise<FsHandleMap> {
    const target = path.length === 0 ? this.rootHandle : await this.resolveDirectoryHandle(path);
    if (!target) {
      throw new Error(`路径无效：无法找到目录 "${path.join('/') || 'root'}"`);
    }

    const handles: FsHandleMap = {};
    const entryReader = target as unknown as { entries: () => AsyncIterable<[string, FsHandle]> };
    for await (const [, entry] of entryReader.entries()) {
      handles[entry.name] = entry;
    }
    return handles;
  }

  async getFile(path: string[]): Promise<FileSystemFileHandle | null> {
    if (path.length === 0) {
      logDataSourceError('LocalWikiRepo.getFile', new Error('路径为空'), {path});
      return null;
    }

    const fileName = path[path.length - 1]?.trim();
    if (!fileName || fileName === '.') {
      logDataSourceError('LocalWikiRepo.getFile', new Error('路径错误'), {path});
      return null;
    }

    const parentPath = path.slice(0, path.length - 1);
    const parentDir = parentPath.length === 0 ? this.rootHandle : await this.resolveDirectoryHandle(parentPath);
    if (!parentDir) {
      return null;
    }

    try {
      return await parentDir.getFileHandle(fileName);
    } catch (err) {
      console.warn(`文件未找到或类型错误: ${fileName}`);
      logDataSourceError('LocalWikiRepo.getFile', err, {path, fileName});
      return null;
    }
  }

  // 处理本地图片
  makeAddress(url: string[], src: string): string {
    const normalized = src.trim();
    if (!normalized) {
      return '';
    }

    if (isExternalImageSource(normalized)) {
      return normalized;
    }

    if (normalized.startsWith('./')) {
      return [...url, normalized.substring(2)].filter(Boolean).join('/');
    } else if (normalized.startsWith('/')) {
      return normalized.replace(/^\/+/, '');
    } else {
      return normalized
    }
  }

  // 将本地文件地址加载为可渲染图片并写入缓存
  private async loadImageIntoCache(address: string, entry: LocalImageCacheEntry): Promise<void> {
    let objectUrl: string | undefined;
    let info = createFallbackImageInfo();

    try {
      const pathArray = address.split('/').filter(Boolean);
      const handle = await this.getFile(pathArray);

      if (handle) {
        objectUrl = URL.createObjectURL(await handle.getFile());
        info = await probeImageInfo(objectUrl);
        if (info.src !== objectUrl) {
          URL.revokeObjectURL(objectUrl);
          objectUrl = undefined;
        }
      } else {
        console.log('cacheImage失败！', address);
      }
    } catch (err) {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = undefined;
      }
      logDataSourceError('LocalWikiRepo.loadImageIntoCache', err, {address});
    }

    const current = this.imageCache.get(address);
    if (!current || current !== entry) {
      // 条目已被替换/删除：当前临时 URL 直接释放，防止泄漏
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      return;
    }

    current.info = info;
    current.objectUrl = objectUrl;
    current.pending = undefined;
    this.touchCacheEntry(address, current);
    this.trimImageCache();
  }

  // 获取图片信息（带缓存、并发去重、引用计数）
  async getImage(url: string[], src: string): Promise<ImageInfo> {
    const address: string = this.makeAddress(url, src);
    if (!address) {
      return createFallbackImageInfo();
    }

    let entry = this.imageCache.get(address);
    if (!entry) {
      entry = {
        refCount: 0
      };
      this.imageCache.set(address, entry);
      entry.pending = this.loadImageIntoCache(address, entry);
    }

    if (entry.pending) {
      await entry.pending;
      entry = this.imageCache.get(address);
    }

    if (!entry?.info) {
      return createFallbackImageInfo();
    }

    entry.refCount += 1;
    this.touchCacheEntry(address, entry);
    return entry.info;
  }

  // 释放一次图片引用，供组件卸载时调用
  releaseImage(url: string[], src: string) {
    const address = this.makeAddress(url, src);
    if (!address) {
      return;
    }

    const entry = this.imageCache.get(address);
    if (!entry) {
      return;
    }

    entry.refCount = Math.max(0, entry.refCount - 1);
    // 释放引用后尝试裁剪缓存，控制内存占用
    this.trimImageCache();
  }

  //todo:现在没有原来那样的目录了 只有一个rootHandle 加载时逐层加载 每次加载时重新从根遍历路径到当前访问的文件/文件夹（这一步就和资源管理器里打开文件夹差不多）（当前访问的目录的n-1层都可以获取文件夹 不获取文件 节约加载时间）
}


class HttpWikiRepo extends WikiRepo {
  // data
  address: string;

  constructor(config: Config, address: string) {
    super(config, "httpServer");
    this.address = address;
  }

  private resolveAddress(path: string): string {
    const normalizedPath = path.replace(/^\/+/, '');
    const base = this.address.endsWith('/') ? this.address : `${this.address}/`;
    return new URL(normalizedPath, base).toString();
  }

  // todo:尝试探测更多类型的文件
  // 初始化远程仓库：探测 icon 是否可访问
  async init() {
    try {
      this.icon = this.resolveAddress('icon.png');
      await axios.get(this.icon);
    } catch (err) {
      this.icon = FALLBACK_IMAGE_SRC;
      logDataSourceError('HttpWikiRepo.init', err, {address: this.address, icon: this.icon});
    }
  }

  // Promise name:type
  // 读取远程目录索引（_dir.json）
  // 目录枚举：读取远端 _dir.json
  async listDir(path: string[]): Promise<Record<string, string>> {
    let jsonPath = '_dir.json';
    if (path.length === 0) {
      jsonPath = '_dir.json';
    } else {
      jsonPath = `${path.join('/')}/_dir.json`;
    }

    try {
      return (await axios.get(this.resolveAddress(jsonPath))).data;
    } catch (err) {
      logDataSourceError('HttpWikiRepo.listDir', err, {path, jsonPath});
      throw new Error(`路径无效：无法找到目录 "${path.join('/') || 'root'}"`);
    }
  }

  // 读取远程文件内容
  async getFile(path: string[]): Promise<unknown | null> {
    if (path.length === 0) {
      logDataSourceError('HttpWikiRepo.getFile', new Error('路径为空'), {path});
      return null;
    }

    // 尝试获取文件
    try {
      return (await axios.get(this.resolveAddress(path.join('/')))).data;
    } catch (err) {
      logDataSourceError('HttpWikiRepo.getFile', err, {path});
      return null;
    }
  }

  // 处理本地图片
  makeAddress(url: string[], src: string): string {
    const normalized = src.trim();
    if (!normalized) {
      return '';
    }

    if (isExternalImageSource(normalized)) {
      return normalized;
    }

    if (normalized.startsWith('./')) {
      return this.resolveAddress([...url, normalized.substring(2)].filter(Boolean).join('/'));
    }

    return this.resolveAddress(normalized);
  }

  // 获取远程图片信息（交由 store 统一缓存与去重）
  async getImage(url: string[], src: string): Promise<ImageInfo> {
    const imgAddress = this.makeAddress(url, src);
    return await useDataSourcesStore().getImageInfo(imgAddress);
  }

  //todo:现在没有原来那样的目录了 只有一个rootHandle 加载时逐层加载 每次加载时重新从根遍历路径到当前访问的文件/文件夹（这一步就和资源管理器里打开文件夹差不多）（当前访问的目录的n-1层都可以获取文件夹 不获取文件 节约加载时间）
}

export const useDataSourcesStore = defineStore(
  'DataSources', () => {
    const notice = useNoticeStore();
    const initState = ref(false);

    const persistentStorage: PersistentStorage = reactive({});
    const wikiRepos: Record<string, RepoInstance> = shallowReactive({});
    const remoteImageCache = new Map<string, ImageInfo>();
    const remoteImagePending = new Map<string, Promise<ImageInfo>>();

    function setWikiRepo(id: string, repo: RepoInstance) {
      const oldRepo = wikiRepos[id];
      if (oldRepo instanceof LocalWikiRepo) {
        oldRepo.dispose();
      }
      wikiRepos[id] = markRaw(repo) as RepoInstance;
    }

    function disposeWikiRepo(id: string) {
      const repo = wikiRepos[id];
      if (repo instanceof LocalWikiRepo) {
        repo.dispose();
      }
      delete wikiRepos[id];
    }

    function clearWikiRepos() {
      for (const id of Object.keys(wikiRepos)) {
        disposeWikiRepo(id);
      }
    }

    function trimRemoteImageCache() {
      while (remoteImageCache.size > REMOTE_IMAGE_CACHE_LIMIT) {
        const oldestKey = remoteImageCache.keys().next().value;
        if (!oldestKey) {
          break;
        }
        remoteImageCache.delete(oldestKey);
      }
    }

    // 统一图片信息获取入口：用于远程图、http 仓库图与 markdown 图
    async function getImageInfo(imgAddress: string): Promise<ImageInfo> {
      if (!imgAddress) {
        return createFallbackImageInfo();
      }

      const cacheHit = remoteImageCache.get(imgAddress);
      if (cacheHit) {
        return cacheHit;
      }

      const pending = remoteImagePending.get(imgAddress);
      if (pending) {
        // 复用正在进行中的请求，避免同图被重复探测
        return await pending;
      }

      const loader = (async () => {
        try {
          const info = await probeImageInfo(imgAddress);
          remoteImageCache.set(imgAddress, info);
          trimRemoteImageCache();
          return info;
        } catch (err) {
          logDataSourceError('Store.getImageInfo', err, {imgAddress});
          return createFallbackImageInfo();
        } finally {
          remoteImagePending.delete(imgAddress);
        }
      })();

      remoteImagePending.set(imgAddress, loader);
      return await loader;
    }

    // 让用户选择本地目录并注册为仓库
    async function addLocalRepo() {
      let handle: FileSystemDirectoryHandle;
      let config: Config;

      // 尝试获取文件路径
      try {
        handle = await window.showDirectoryPicker();
      } catch (err) {
        notice.addNotice('warn', '请授权浏览器进行操作！', err);
        return
      }

      // 尝试读取配置文件
      try {
        config = await loadConfigFromRoot(handle);
      } catch (err) {
        logDataSourceError('Store.addLocalRepo.loadConfigFromRoot', err);
        notice.addNotice('error', '读取或解析配置文件失败', `[addLocalRepo] ${toErrorMessage(err)}`);
        return;
      }

      // 检查是否已存在
      if (get(persistentStorage, config.id)) {
        notice.addNotice('warn', '该仓库已加载！', '请勿重复添加！');
        return;
      }

      persistentStorage[config.id] = {
        type: 'local',
        config: config,
        handle: {
          root: handle,
        }
      };

      // 这里不能简化!!!
      const wikiRepo = new LocalWikiRepo(config, handle);
      await wikiRepo.init();
      setWikiRepo(config.id, wikiRepo);

      notice.addNotice('success', '仓库添加成功！', '已加载所选仓库！');
    }

    // 添加远程 HTTP 仓库；init=true 时表示启动恢复流程
    async function addHttpWikiRepo(address: string, init: boolean) {
      let config: Config;

      address = normalizeUrl(address);

      // 尝试读取配置文件
      try {
        const configAddress = new URL('config.json', address.endsWith('/') ? address : `${address}/`).toString();
        const res = await axios.get(configAddress);
        config = res.data;
      } catch (err) {
        logDataSourceError('Store.addHttpWikiRepo.fetchConfig', err, {address});
        notice.addNotice('error', '读取或解析配置文件失败', `[addHttpWikiRepo] ${toErrorMessage(err)}`);
        return;
      }

      if (!init) {
        // 检查是否已存在
        if (get(persistentStorage, config.id)) {
          notice.addNotice('warn', '该仓库已加载！', '请勿重复添加！');
          return;
        }

        persistentStorage[config.id] = {
          type: 'httpServer',
          config: config,
          address: address
        }
      }

      // 这里不能简化!!!
      const wikiRepo = new HttpWikiRepo(config, address);
      await wikiRepo.init();
      setWikiRepo(config.id, wikiRepo);

      if (!init) {
        notice.addNotice('success', '仓库添加成功！', '已加载所选仓库！');
      }
    }

    // 删除仓库并释放其资源
    function deleteRepos(id: string) {
      delete persistentStorage[id];
      disposeWikiRepo(id);
      notice.addNotice('success', '仓库删除成功！', '已移除所选仓库！');
    }

    // 启动时从 indexedDB 恢复持久化仓库并重新初始化
    async function initFetchData() {
      console.log('开始读取仓库数据...')
      const loaded = await loadData<PersistentStorage>('persistentStorage', {});

      for (const key of Object.keys(persistentStorage)) {
        delete persistentStorage[key];
      }
      Object.assign(persistentStorage, loaded);
      clearWikiRepos();

      for (const [, item] of Object.entries(toRaw(persistentStorage) ?? {}) as [string, PersistentStorage[string]][]) {
        if (item.type === 'local') {
          const root: FileSystemDirectoryHandle = item.handle.root;
          let config: Config;

          // 尝试读取配置文件
          try {
            config = await loadConfigFromRoot(root);
          } catch (err) {
            logDataSourceError('Store.initFetchData.loadConfigFromRoot', err, {root: item.handle.root.name});
            notice.addNotice('error', '读取或解析配置文件失败', `[initFetchData] ${toErrorMessage(err)}`);
            printErrorTree(err);
            continue;
          }

          // todo:检查id是否改变 改变则修改存储的id
          // todo:缓存正确的配置信息
          // todo:仓库损坏时显示缓存信息

          // 这里不能简化!!!
          const wikiRepo = new LocalWikiRepo(config, item.handle.root);
          await wikiRepo.init();
          setWikiRepo(config.id, wikiRepo);
        } else if (item.type === 'httpServer') {
          const address = item.address
          await addHttpWikiRepo(address, true)
        }
      }

      initState.value = true;
      console.log('读取仓库数据完成！')
    }

    watch(persistentStorage, (newVal) => {
      if (initState.value) {
        newVal = toRaw(newVal);
        console.log(newVal)
        void saveData('persistentStorage', newVal);
      }
    }, {deep: true});

    // ------------------- 未启用的功能🤔 -------------------

    // let db = ref<any>(null)
    // let opfsRoot = null
    // let fileHandle = null

    // const dbPromise = (async () => {
    //     try {
    //       const SQL = await initSqlJs({
    //             locateFile: (file) => `../../node_modules/sql.js/dist/sql-wasm.wasm`
    //         })
    //         opfsRoot = await navigator.storage.getDirectory();
    //         try {
    //             // 存在：可以打开
    //             const fileHandle = await opfsRoot.getFileHandle("db.sqlite");
    //             const file = await fileHandle.getFile();
    //             const buffer = await file.arrayBuffer();
    //             db.value = new SQL.Database(new Uint8Array(buffer));
    //         } catch (err: any) {
    //             // 不存在：创建
    //             if (err.name === 'NotFoundError') {
    //                 fileHandle = await opfsRoot.getFileHandle("db.sqlite", {create: true});
    //                 db.value = new SQL.Database()
    //                 console.log('未发现数据库，已创建！')
    //             } else {
    //                 console.error(err)
    //             }
    //         }
    //
    //         return {db, opfsRoot, fileHandle}
    //     } catch (err) {
    //         console.error('SQL.js 初始化失败:', err)
    //         throw err
    //     }
    // })()
    //
    // dbPromise.then((event) => {
    //     console.log("Outside async:", event.db) // ✅ 正确打印
    //
    //
    //     watch(() => event.db.value, () => {
    //         opfsWrite(event.db, event.fileHandle)
    //     })
    // })

    // ------------------- 未启用的功能🤔 -------------------


    // 调试/维护工具：删除指定 indexedDB
    function deleteDatabase(dbName: string): Promise<boolean> {
      return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(dbName);

        request.onsuccess = () => {
          notice.addNotice('success', '操作成功！', '数据库 "${dbName}" 删除成功～喵');
          resolve(true);
        };

        request.onerror = (event) => {
          logDataSourceError('Store.deleteDatabase', event, {dbName});
          notice.addNotice('error', '数据库删除失败！', `[deleteDatabase] ${toErrorMessage(event)}`);
          reject(event);
        };

        request.onblocked = () => {
          notice.addNotice('warn', '操作被阻止', '数据库 "${dbName}" 删除被阻止');
        };
      });
    }


    //
    // function deepSet(obj: any, keys: string[], value: any) {
    //   let current = obj;
    //   for (let i = 0; i < keys.length - 1; i++) {
    //     const key = keys[i];
    //     current[key] = current[key] || {};
    //     current = current[key];
    //   }
    //   current[keys[keys.length - 1]] = value;
    // }
    //

    async function fetchRemoteImageInfo(imgAddress: string): Promise<ImageInfo> {
      return await getImageInfo(imgAddress);
    }

    return {
      initState,
      persistentStorage,
      wikiRepos,
      addLocalRepo,
      addHttpWikiRepo,
      deleteRepos,
      initFetchData,
      deleteDatabase,
      getImageInfo,
      fetchRemoteImageInfo
    };
  }
);

// async function opfsWrite(db: any, fileHandle: any) {
//     const writable = await fileHandle.createWritable();
//     const binaryArray = db.value.export();
//     await writable.write(binaryArray);
//     await writable.close();
// }

// 通过本地rootHandle读取config
async function loadConfigFromRoot(root: FileSystemDirectoryHandle) {
  let configHandle: FileSystemFileHandle;
  try {
    configHandle = await root.getFileHandle("config.json");
  } catch (err) {
    throw new Error('无法找到配置文件 "config.json"', {cause: err})
  }

  const file = await configHandle.getFile();
  const json = await file.text();
  const config: Config = JSON.parse(json);

  // todo:仅检查必要配置 其余仅报warn并改为默认值
  const result = ConfigSchema.safeParse(config);
  if (!result.success) throw new Error(`配置缺失必要属性：${result.error}`);

  return result.data;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionToPromise(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) {
    // 复用单例连接，避免重复 open
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(PERSISTENT_DB_NAME, PERSISTENT_DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(PERSISTENT_STORE_NAME)) {
        db.createObjectStore(PERSISTENT_STORE_NAME, {keyPath: 'key'});
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };

    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };

    request.onblocked = () => {
      dbPromise = null;
      reject(new Error('indexedDB open blocked'));
    };
  });

  return dbPromise;
}

async function saveData<T>(key: string, data: T) {
  const db = await openDB();
  const tx = db.transaction(PERSISTENT_STORE_NAME, 'readwrite');
  const store = tx.objectStore(PERSISTENT_STORE_NAME);
  store.put({key, data});
  await transactionToPromise(tx);
  return true;
}

async function loadData<T>(key: string, fallback: T): Promise<T> {
  try {
    const db = await openDB();
    const tx = db.transaction(PERSISTENT_STORE_NAME, 'readonly');
    const store = tx.objectStore(PERSISTENT_STORE_NAME);
    const request = store.get(key) as IDBRequest<{ key: string; data: T } | undefined>;
    const result = await requestToPromise(request);
    await transactionToPromise(tx);
    return result?.data ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * 规范化URL字符串，确保URL以协议开头
 * @param input 需要规范化的URL字符串
 * @return 规范化后的URL字符串
 */
function normalizeUrl(input: string): string {
  // 去除输入字符串两端的空白字符
  const trimmed = input.trim();

  if (hasUrlProtocol(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}


// function readFileAsText(file: Blob): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = () => resolve(reader.result as string);
//     reader.onerror = reject;
//     reader.readAsText(file, 'utf-8');
//   });
// }

// function processRouteData(route: any) {
//
//   const processedData: Record<string, any> = {};
//   for (const lang in route) {
//     if (!processedData[lang]) {
//       processedData[lang] = {};
//     }
//     for (const i of route[lang]) {
//       const items = get(i, 'items');
//
//       if (!items) {
//         processedData[lang][i.path] = {...i};
//       } else {
//         processedData[lang][i.path] = {...i};
//         processedData[lang][i.path].items = {};
//         for (const i2 of items) {
//           processedData[lang][i.path].items[i2.path] = i2;
//         }
//       }
//     }
//   }
//   return processedData;
// }

// function mergeRouteGroups(routeGroups: any[]): any[] {
//   const mergedRoutes: any[] = [];
//
//   for (const group of routeGroups) {
//     for (const route of group) {
//       const existingRoute = mergedRoutes.find((r) => r.path === route.path);
//
//       if (existingRoute) {
//         // 合并子路由
//         if (Array.isArray(route.items)) {
//           if (!Array.isArray(existingRoute.items)) {
//             existingRoute.items = [];
//           }
//           for (const item of route.items) {
//             if (!existingRoute.items.some((i: { 'path': string }) => i.path === item.path)) {
//               existingRoute.items.push(item);
//             }
//           }
//         }
//       } else {
//         mergedRoutes.push({...route});
//       }
//     }
//   }
//   return mergedRoutes;
// }


// function deepMergeOnlyNew(oldObj: any, newObj: any) {
//   for (const key in newObj) {
//     if (Object.prototype.hasOwnProperty.call(newObj, key)) {
//       if (typeof newObj[key] === 'object' && newObj[key] !== null) {
//         if (typeof oldObj[key] !== 'object' || oldObj[key] === null) {
//           oldObj[key] = Array.isArray(newObj[key]) ? [] : {};
//         }
//         deepMergeOnlyNew(oldObj[key], newObj[key]);
//       } else {
//         if (!(key in oldObj)) {
//           oldObj[key] = newObj[key];
//         }
//       }
//     }
//   }
//   return oldObj;
// }

// async function mergeLangDataI(lang: string, getLocaleMessage: any) {
//   const oldMessages = toRaw(getLocaleMessage(lang));
//   let updataLangData = {};
//   for (const i of toRaw(useDataSourcesStore().langHandles)) {
//     if (i?.[lang] !== undefined) {
//       const langData = await i[lang].getFile();
//       const fileText = await readFileAsText(langData);
//       const jsonDataRaw = JSON.parse(fileText);
//       updataLangData = deepMergeOnlyNew({...updataLangData}, jsonDataRaw);
//     }
//   }
//   return {
//     ...oldMessages,
//     ...updataLangData
//   };
// }
