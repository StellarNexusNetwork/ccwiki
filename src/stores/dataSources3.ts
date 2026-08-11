import {defineStore} from "pinia";
import {z} from "zod"
import axios from "axios";

import {type Config, type HttpRepoStorage, type LocalWikiRepoStorage} from "@/adapters/types"
import {PERSISTENT_DB_NAME, PERSISTENT_DB_VERSION, PERSISTENT_STORE_NAME} from "@/utils/config";
import {useNoticeStore} from '@/stores/notice';
import {reactive, ref, shallowReactive, toRaw} from "vue";
import {LocalWikiRepo} from "@/adapters/LocalWikiRepo.ts";
import {HttpWikiRepo} from "@/adapters/HttpWikiRepo.ts";

interface ImageBlobCache {
  blob: string
  refCount: number
}

interface NamespaceImageCache {
  [filePath: string]: ImageBlobCache
}

interface ImageCache {
  [namespace: string]: NamespaceImageCache
}

interface PersistentStorage {
  [id: string]: LocalWikiRepoStorage | HttpRepoStorage;
}

// 配置文件检查项目(必须)
const ConfigSchema = z.looseObject({
  id: z.string(),
  version: z.string(),
  name: z.record(z.string(), z.string()).optional()
})

export const useDataSourcesStore3 = defineStore(
  'DataSources3', () => {
    const initState = ref(false);
    let dbPromise: Promise<IDBDatabase> | null = null;

    const notice = useNoticeStore();

    const persistentStorage: PersistentStorage = reactive({});
    const wikiRepos: Record<string, object> = shallowReactive({});
    const imageCache = new Map<string, ImageBlobCache>();

    // 创建indexDB连接
    function openDB(): Promise<IDBDatabase> {
      if (dbPromise) {
        return dbPromise;
      }
      dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(
          PERSISTENT_DB_NAME,
          PERSISTENT_DB_VERSION
        );
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(PERSISTENT_STORE_NAME)) {
            db.createObjectStore(PERSISTENT_STORE_NAME, {
              keyPath: 'key',
            });
          }
        };
        request.onsuccess = () => {
          const db = request.result;
          db.onversionchange = () => {
            db.close();
            dbPromise = null;
          };
          resolve(db);
        };
        request.onerror = () => {
          dbPromise = null;
          reject(request.error);
        };
        request.onblocked = () => {
          console.warn('IndexedDB open blocked');
        };
      });
      return dbPromise;
    }

    // 存储数据
    // todo：存储失败报错
    async function saveData<T>(key: string, data: T) {
      const db = await openDB();
      const tx = db.transaction(PERSISTENT_STORE_NAME, 'readwrite');
      const store = tx.objectStore(PERSISTENT_STORE_NAME);
      store.put({key, data});
      await transactionToPromise(tx);
      return true;
    }

    // 读取数据
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

    // 启动时从 indexedDB 恢复持久化仓库并重新初始化
    async function initFetchData() {
      console.log('开始读取仓库数据...')
      const loaded = await loadData(
        "persistentStorage",
        {} as PersistentStorage
      );

      for (const item of Object.values(loaded)) {
        if (item.type === 'local') {
          await addLocalWikiRepo(item.rootHandle);
          // todo:检查id是否改变 改变则修改存储的id
          // todo:缓存正确的配置信息
          // todo:仓库损坏时显示缓存信息
        } else if (item.type === 'httpServer') {
          await addHttpWikiRepo(item.address, true);
        }
      }
      void saveData('persistentStorage', toRaw(persistentStorage));
      initState.value = true;
    }

    // todo：仓库损坏处理
    // 添加本地仓库
    async function addLocalWikiRepo(rootHandle?: FileSystemDirectoryHandle) {
      let handle: FileSystemDirectoryHandle;
      let config: Config;
      // 尝试打开文件夹
      if (!rootHandle) {
        try {
          handle = await window.showDirectoryPicker();
        } catch (err) {
          notice.addNotice('warn', '请授权浏览器进行操作！', err);
          return;
        }
      } else {
        handle = rootHandle
      }
      // 尝试读取配置文件
      try {
        config = await loadConfigFromRoot(handle);
      } catch (err) {
        notice.addNotice('error', '读取或解析配置文件失败', `[addLocalRepo] ${err}`);
        return;
      }
      // 检查配置文件是否满足最低注册要求
      // todo:仅检查必要配置 其余仅报warn并改为默认值
      const result = ConfigSchema.safeParse(config);
      if (!result.success) notice.addNotice('error', `配置缺失必要属性：`, result.error);

      // 检查是否已存在
      if (persistentStorage[config.id]) {
        notice.addNotice('warn', '该仓库已加载！', '请勿重复添加！');
        return;
      }
      // 初始化并添加
      const wikiRepo = new LocalWikiRepo(config, handle);
      await wikiRepo.init();
      wikiRepos[config.id] = wikiRepo;
      // 持久化
      persistentStorage[config.id] = {
        type: 'local',
        config: config,
        rootHandle: handle
      };
      if (!rootHandle) {
        void saveData('persistentStorage', toRaw(persistentStorage));
        notice.addNotice('success', '仓库添加成功！', '已加载所选仓库！');
      }
    }

    // 添加在线仓库
    async function addHttpWikiRepo(address: string, isInit?: boolean) {
      let config: Config;
      const normalizedAddress = normalizeUrl(address);
      // 尝试读取配置文件
      try {
        const configAddress = new URL('config.json', normalizedAddress.endsWith('/') ? normalizedAddress : `${normalizedAddress}/`).toString();
        const res = await axios.get(configAddress);
        config = res.data;
      } catch (err) {
        notice.addNotice('error', '读取或解析配置文件失败', `[addHttpWikiRepo] ${err}`);
        return;
      }

      // 检查配置文件是否满足最低注册要求
      // todo:仅检查必要配置 其余仅报warn并改为默认值
      const result = ConfigSchema.safeParse(config);
      if (!result.success) notice.addNotice('error', `配置缺失必要属性：`, result.error);

      // 检查是否已存在
      if (persistentStorage[config.id]) {
        notice.addNotice('warn', '该仓库已加载！', '请勿重复添加！');
        return;
      }
      // 初始化并添加
      const wikiRepo = new HttpWikiRepo(config, normalizedAddress);
      await wikiRepo.init();
      wikiRepos[config.id] = wikiRepo;
      // 持久化
      persistentStorage[config.id] = {
        type: 'httpServer',
        config: config,
        address: normalizedAddress
      }
      if (!isInit) {
        void saveData('persistentStorage', toRaw(persistentStorage));
        notice.addNotice('success', '仓库添加成功！', '已加载所选仓库！');
      }
    }

    // 删除仓库并释放其资源
    function deleteRepos(id: string) {
      // todo：清除本地仓库的图片缓存
      delete persistentStorage[id];
      delete wikiRepos[id];
      void saveData('persistentStorage', toRaw(persistentStorage));
      notice.addNotice('success', '仓库删除成功！', '已移除所选仓库！');
    }

    return {
      initState,
      wikiRepos,
      initFetchData,
      addLocalWikiRepo,
      addHttpWikiRepo,
      deleteRepos,
    }

  })

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

  return config;
}

// 格式化url
function normalizeUrl(input: string): string {
  const trimmed = input.trim();

  const url = /^https?:\/\//i.test(trimmed)
    ? new URL(trimmed)
    : new URL(`https://${trimmed}`);

  return url.toString();
}

function transactionToPromise(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
