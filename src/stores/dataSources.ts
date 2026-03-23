import {defineStore} from 'pinia';
import {reactive, ref, toRaw, watch} from 'vue';

import get from 'lodash/get';
import {z} from "zod"
import axios from "axios";

import {useNoticeStore} from '@/stores/notice';
import {printErrorTree} from "@/utils/error.ts";

const baseUrl = import.meta.env.BASE_URL;

interface PersistentStorage {
  [id: string]:
    | {  //id不是ulid应该是xxx或xxx：xxx.xx
    type: 'local';
    config: Record<string, any>;   // 缓存 保证在文件损坏时可以尽可能显示信息
    handle: {
      root: FileSystemDirectoryHandle;
    };
    url?: string;
  }
    | {  //id不是ulid应该是xxx或xxx：xxx.xx
    type: 'httpServer';
    config: Record<string, any>;   // 缓存 保证在文件损坏时可以尽可能显示信息
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

// 配置文件检查项目(必须)
const ConfigSchema = z.looseObject({
  id: z.string(),
  version: z.string(),
  name: z.record(z.string(), z.string()).optional()
})

// 仓库类
class WikiRepo {
  // display
  version: string;
  icon: string = '/public/svg/NotFound.svg';
  name: Record<string, string>;
  type: 'local' | 'httpServer';

  // todo:标记仓库是否损坏

  constructor(config: Config, type: 'local' | 'httpServer') {
    this.version = config.version;
    this.name = config.name as Record<string, string> ?? {};
    this.type = type;
  }
}

class LocalWikiRepo extends WikiRepo {
  // data
  rootHandle: FileSystemDirectoryHandle;
  imageCache: Map<string, ImageInfo> = new Map();

  // langHandles: Record<string, FileSystemFileHandle> = {};

  constructor(config: Config, rootHandle: FileSystemDirectoryHandle) {
    super(config, "local");
    this.rootHandle = rootHandle;
  }

  async init(root: Record<string, FileSystemDirectoryHandle | FileSystemFileHandle>) {
    this.icon = await init_getIconURL(root);
  }

  async readCategories(path: string[]): Promise<Record<string, FileSystemFileHandle | FileSystemDirectoryHandle>> {
    // 当前的目录句柄，初始为根目录
    let currentHandle: FileSystemDirectoryHandle = this.rootHandle;

    if (path.length === 0) {
      return await processHandle(this.rootHandle);
    }

    // 逐层遍历路径
    for (const segmentRaw of path) {
      const segment = segmentRaw;

      // 尝试获取下一级目录句柄
      try {
        currentHandle = await currentHandle.getDirectoryHandle(segment);
      } catch (err) {
        console.error(err)
        throw new Error(`路径无效：无法找到目录 "${segment}"`);
      }
    }

    // 到达目标目录后，返回该目录下的所有条目
    return await processHandle(currentHandle);
  }

  async getFile(path: string[]): Promise<FileSystemFileHandle | null> {
    if (path.length === 0) {
      console.error('路径为空');
      return null;
    }

    // 获取最后一段文件名
    const lastKey = path[path.length - 1];

    let dir: Record<string, FileSystemFileHandle | FileSystemDirectoryHandle>;

    if (path.length == 1) {
      dir = await processHandle(this.rootHandle)
    } else if (path.length > 1) {
      try {
        dir = await this.readCategories(path.slice(0, path.length - 1));
      } catch (err: any) {
        console.error(err);
        return null;
      }
    } else {
      console.log('路径错误');
      return null;
    }

    const handle = dir[lastKey];

    // 类型保护，确保返回的是 FileSystemFileHandle
    if (handle && handle.kind === 'file') {
      return handle;
    }

    console.warn(`文件未找到或类型错误: ${lastKey}`);
    return null;
  }

  // 处理本地图片
  makeAddress(url: string[], src: string): string {
    if (src.startsWith('./')) {
      return url.join('/') + '/' + src.substring(2);
    } else {
      return src
    }
  }

  // 缓存并返回地址
  async cacheImage(address: string): Promise<ImageInfo> {
    const pathArray = address.split("/");
    // 获取文件句柄
    const handle = await this.getFile(pathArray);
    // 默认图片信息
    const imageInfo: ImageInfo = {
      src: baseUrl + 'public/svg/not_found.svg',
      width: 256,
      height: 256
    };
    if (handle) {
      // 创建 URL
      imageInfo.src = URL.createObjectURL(await handle.getFile());
      // 等待图片加载完再处理尺寸
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          imageInfo.width = img.naturalWidth;
          imageInfo.height = img.naturalHeight;

          // 如果最大边小于 256，则等比放大
          const maxSide = Math.max(imageInfo.width, imageInfo.height);
          if (maxSide < 256) {
            const scale = 256 / maxSide;
            imageInfo.width = Math.round(imageInfo.width * scale);
            imageInfo.height = Math.round(imageInfo.height * scale);
          }

          // 缓存数据
          this.imageCache.set(address, imageInfo);

          resolve(); // 通知外部图片加载完了
        };
        img.onerror = () => {
          console.error("图片加载失败", address);
          resolve();
        };
        img.src = imageInfo.src;
      });
    } else {
      console.log('cacheImage失败！', address);
    }
    return imageInfo;
  };

  async getImage(url: string[], src: string): Promise<ImageInfo> {
    const address: string = this.makeAddress(url, src);
    if (this.imageCache.has(address)) {
      return this.imageCache.get(address) as ImageInfo;
    } else {
      return await this.cacheImage(address);
    }
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

  // todo:尝试探测更多类型的文件
  async init(address: string) {
    try {
      await axios.get(address + '/icon.png');
      this.icon = address + '/icon.png';
    } catch (err) {
      console.error(err);
    }
  }

  // Promise name:type
  async readCategories(path: string[]): Promise<Record<string, string>> {

    if (path.length === 0) {
      try {
        return (await axios.get(this.address + '/_dir.json')).data;
      } catch (err) {
        console.error(err)
        throw new Error(`路径无效：无法找到目录 root"`);
      }
    }

    // 返回该目录下的所有条目
    return (await axios.get(this.address + '/' + path.join('/') + '/_dir.json')).data;
  }

  async getFile(path: string[]): Promise<any | null> {
    if (path.length === 0) {
      console.error('路径为空');
      return null;
    }

    // 尝试获取文件
    try {
      return (await axios.get(this.address + '/' + path.join('/'))).data;
    } catch (err: any) {
      console.error(err);
      return null;
    }
  }

  // 处理本地图片
  makeAddress(url: string[], src: string): string {
    if (src.startsWith('./')) {
      return this.address + '/' + url.join('/') + '/' + src.substring(2);
    } else {
      return this.address + '/' + src
    }
  }

  async getImage(url: string[], src: string): Promise<ImageInfo> {
    // 构造图片链接
    const imgAddress = this.makeAddress(url, src)

    return await useDataSourcesStore().fetchRemoteImageInfo(imgAddress);
  }

  //todo:现在没有原来那样的目录了 只有一个rootHandle 加载时逐层加载 每次加载时重新从根遍历路径到当前访问的文件/文件夹（这一步就和资源管理器里打开文件夹差不多）（当前访问的目录的n-1层都可以获取文件夹 不获取文件 节约加载时间）
}

export const useDataSourcesStore = defineStore(
  'DataSources', () => {
    const notice = useNoticeStore();
    const initState = ref(false);

    const persistentStorage: PersistentStorage = reactive({});
    const wikiRepos: Record<string, any> = reactive({});

    async function addLocalRepo() {
      let handle: FileSystemDirectoryHandle;
      let root: Record<string, FileSystemDirectoryHandle | FileSystemFileHandle>;
      let config: Config;

      // 尝试获取文件路径
      try {
        handle = await window.showDirectoryPicker();
        root = await processHandle(handle);
      } catch (err) {
        notice.addNotice('warn', '请授权浏览器进行操作！', err);
        return
      }

      // 尝试读取配置文件
      try {
        config = await loadConfigFromRoot(root);
      } catch (err) {
        notice.addNotice('error', '读取或解析配置文件失败', err);
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
      await wikiRepo.init(root)
      wikiRepos[config.id] = wikiRepo;

      notice.addNotice('success', '仓库添加成功！', '已加载所选仓库！');
    }

    async function addHttpWikiRepo(address: string, init: boolean) {
      let config: Config;

      address = normalizeUrl(address);

      // 尝试读取配置文件
      try {
        const res = await axios.get(address + '/config.json');
        config = res.data;
      } catch (err) {
        notice.addNotice('error', '读取或解析配置文件失败', err);
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
      await wikiRepo.init(address);
      wikiRepos[config.id] = wikiRepo;

      if (!init) {
        notice.addNotice('success', '仓库添加成功！', '已加载所选仓库！');
      }
    }

    function deleteRepos(id: string) {
      delete persistentStorage[id];
      delete wikiRepos[id];
      notice.addNotice('success', '仓库删除成功！', '已移除所选仓库！');
    }

    async function initFetchData() {
      console.log('开始读取仓库数据...')
      const loaded = await loadData('persistentStorage') as PersistentStorage;
      Object.assign(persistentStorage, loaded);

      for (const [_id, item] of Object.entries(toRaw(persistentStorage) ?? {})) {
        if (item.type === 'local') {
          const root: FileSystemDirectoryHandle = item.handle.root;
          let config: Config;

          // 尝试读取配置文件
          try {
            config = await loadConfigFromRoot(root);
          } catch (err) {
            notice.addNotice('error', '读取或解析配置文件失败', err);
            printErrorTree(err);
            continue;
          }

          // todo:检查id是否改变 改变则修改存储的id
          // todo:缓存正确的配置信息
          // todo:仓库损坏时显示缓存信息

          // 这里不能简化!!!
          const wikiRepo = new LocalWikiRepo(config, item.handle.root);
          await wikiRepo.init(root);
          wikiRepos[config.id] = wikiRepo;
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
        saveData('persistentStorage', newVal);
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


    function deleteDatabase(dbName: string): Promise<boolean> {
      return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(dbName);

        request.onsuccess = () => {
          notice.addNotice('success', '操作成功！', '数据库 "${dbName}" 删除成功～喵');
          resolve(true);
        };

        request.onerror = (event) => {
          notice.addNotice('error', '数据库删除失败！', event);
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
      // 构造图片链接
      const imageInfo: ImageInfo = {
        src: baseUrl + 'public/svg/not_found.svg',
        width: 256,
        height: 256
      };

      // 等待图片加载完再处理尺寸
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          imageInfo.src = imgAddress;
          imageInfo.width = img.naturalWidth;
          imageInfo.height = img.naturalHeight;

          // 如果最大边小于 256，则等比放大
          const maxSide = Math.max(imageInfo.width, imageInfo.height);
          if (maxSide < 256) {
            const scale = 256 / maxSide;
            imageInfo.width = Math.round(imageInfo.width * scale);
            imageInfo.height = Math.round(imageInfo.height * scale);
          }

          resolve(); // 通知外部图片加载完了
        };
        img.onerror = () => {
          console.error("图片加载失败", imgAddress);
          resolve();
        };
        img.src = imgAddress;
      });

      return imageInfo;
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

async function processHandle(handle: any) {

  const iter = handle.entries();
  const handles: Record<string, FileSystemFileHandle | FileSystemDirectoryHandle> = {};
  for await (const item of iter) {
    handles[item[1].name] = item[1];
  }
  return handles;
}

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
  if (!result.success) throw `配置缺失必要属性：${result.error}`;

  return result.data;
}

async function init_getIconURL(root: any) {
  let iconURL = '/public/svg/not_found.svg';
  const name = ['.svg', '.avif', '.png', '.jpg']

  for (const item of name) {
    if (get(root, 'icon' + item)) {
      const iconHandle = root['icon' + item];
      const icon = await iconHandle.getFile();
      iconURL = URL.createObjectURL(icon);
      break;
    }
  }
  return iconURL;
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('dataSourcesDB', 1);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      // 创建一个 object store，key 是字符串
      if (!db.objectStoreNames.contains('dataSources')) {
        db.createObjectStore('dataSources', {keyPath: 'key'});
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveData(key: string, data: any) {
  const db: any = await openDB();
  const tx = db.transaction('dataSources', 'readwrite');
  const store = tx.objectStore('dataSources');

  store.put({key, data});

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

async function loadData(key: string) {
  const db: any = await openDB();
  const tx = db.transaction('dataSources', 'readonly');
  const store = tx.objectStore('dataSources');

  return new Promise((resolve, reject) => {
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result?.data || []);
    request.onerror = () => reject([]);
  });
}

/**
 * 规范化URL字符串，确保URL以协议开头
 * @param input 需要规范化的URL字符串
 * @return 规范化后的URL字符串
 */
function normalizeUrl(input: string): string {
  // 去除输入字符串两端的空白字符
  const trimmed = input.trim();

  // 匹配以 协议:// 开头，不限制协议名称
  const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\//.test(trimmed);

  if (hasProtocol) {
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
