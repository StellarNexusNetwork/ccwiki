import {defineStore} from 'pinia';
import {reactive} from 'vue';

import get from 'lodash/get';
import {z} from "zod"

import {useNoticeStore} from '@/stores/setting';

const baseUrl = import.meta.env.BASE_URL;

interface PersistentStorage {
  [id: string]: {  //id不是uild应该是xxx或xxx：xxx.xx
    type: string;
    handle?: {
      root: any;
      config: any;
    };
    url?: string;
  };
}

interface Config {
  version: string;

  // 允许其他字段
  [key: string]: unknown
}

// 配置文件检查项目(必须)
const ConfigSchema = z.looseObject({
  id: z.string(),
  version: z.string(),
})

// 仓库类
class WikiRepo {
  // display
  version: string;
  icon: string = '/public/svg/NotFound.svg';
  root: any;

  constructor(config: Config) {
    this.version = config.version;
  }
}

class LocalWikiRepo extends WikiRepo {
  // data
  rootHandle: any

  constructor(config: Config, rootHandle: any) {
    super(config);
    this.rootHandle = rootHandle;
  }

  async init() {
    this.icon = await init_getIconURL(this.root);
  }

  //todo:现在没有原来那样的目录了 只有一个rootHandle 加载时逐层加载 每次加载时重新从根遍历路径到当前访问的文件/文件夹（这一步就和资源管理器里打开文件夹差不多）（当前访问的目录的n-1层都可以获取文件夹 不获取文件 节约加载时间）
}


export const useDataSourcesStore2 = defineStore(
  'DataSources2', () => {
    const notice = useNoticeStore();

    const persistentStorage: PersistentStorage = reactive({});
    const wikiRepos: Record<string, any> = reactive({});

    async function addLocalRepo() {
      let handle: any;
      let root: any;
      let config: any;

      // 尝试获取文件路径
      try {
        handle = await window.showDirectoryPicker();
        root = await processHandle(handle);
      } catch (err) {
        notice.addNotice('warn', '请授权浏览器进行操作！', err);
        return
      }

      // 尝试读取配置文件
      const configHandle = get(root, 'config.json') as FileSystemFileHandle | undefined;
      if (!configHandle) {
        notice.addNotice('error', '未找到配置文件', '请确保仓库根目录下有config.json文件');
        return;
      }
      try {
        const configFile = await configHandle.getFile() as File;
        const json = await configFile.text();
        config = JSON.parse(json);
        console.log(config);
        // 使用 jsonDataRaw 做后续操作
      } catch (err) {
        notice.addNotice('error', '读取或解析配置文件失败：', err);
      }
      const result = ConfigSchema.safeParse(config)
      // todo:仅检查必要配置 其余仅报warn并改为默认值
      if (!result.success) {
        notice.addNotice('error', '配置缺失必要属性：', result.error);
        return;
      }

      // 检查是否已存在
      if (get(persistentStorage, config.id)) {
        notice.addNotice('warn', '该仓库已加载！', '请勿重复添加！');
        return;
      }

      persistentStorage[config.id] = {
        type: 'local',
        handle: {
          root: handle,
          config: configHandle,
        }
      };

      const wikiRepo = new LocalWikiRepo(config, root);
      wikiRepo.init().then(() => {
        wikiRepos[config.id] = wikiRepo;
      });

      notice.addNotice('success', '仓库添加成功！', '已加载所选仓库！');
    }

    function deleteRepos(id: string) {
      console.log(id, persistentStorage, wikiRepos)
      delete persistentStorage[id];
      delete wikiRepos[id];
      console.log(id, persistentStorage, wikiRepos)
      notice.addNotice('success', '仓库删除成功！', '已移除所选仓库！');
    }

    // async function initFetchData() {
    //   localRepositories.value = await loadData('localRepositories') as any[];
    //   localRepositoriesDisplay.value = await loadData('localRepositoriesDisplay') as any[];
    //   langHandles.value = await loadData('langHandles');
    //   localRepositoriesDisplay.value = await getIconURL(localRepositoriesDisplay.value);
    //   initState = true;
    // }
    //
    // watch(localRepositoriesDisplay, (newVal) => {
    //   if (initState) {
    //     const routeGroupsI: any = [];
    //     newVal = toRaw(newVal);
    //     saveData('localRepositoriesDisplay', newVal);
    //     for (const i of newVal) {
    //       routeGroupsI[i.ulid] = processRouteData(i.routes);
    //     }
    //     routeGroups.value = routeGroupsI;
    //   }
    // }, {deep: true});

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


    // ------------------------------------------------


    //
    // async function refreshData() {
    //   const lrd: any = [];
    //   // 读取仓库语言文件
    //   langHandles.value = [];
    //   for (const ir of toRaw(localRepositories.value)) {
    //     const root = await processHandle(ir.root);
    //     const lang = get(root, 'lang');
    //     const langObject: Record<string, any> = {};
    //     for (const key in lang ?? {}) {
    //       if (Object.hasOwn(lang, key)) {
    //         langObject[key.slice(0, -5)] = lang[key];
    //       }
    //     }
    //     langHandles.value.push(langObject);
    //   }
    //   // 处理展示数据和存储数据
    //
    //   for (const i of toRaw(localRepositoriesDisplay.value)) {
    //     const configData = await i.configHandle.getFile();
    //     const fileText = await configData.text();
    //     const jsonDataRaw = JSON.parse(fileText);
    //
    //     const jsonData = Object.assign({}, {
    //       'name': 'Unknown',
    //       'version': 'Unknown',
    //       'routes': []
    //     }, jsonDataRaw);
    //
    //     i.name = jsonData.name;
    //     i.version = jsonData.version;
    //     i.routes = jsonData.routes;
    //     lrd.push(i);
    //   }
    //   localRepositoriesDisplay.value = lrd;
    //   if (localRepositories.value.length > 0) {
    //     for (const i of toRaw(localRepositories.value)) {
    //       localRepositoriesData.value[i.ulid] = await processHandle(i.root);
    //     }
    //   }
    // }
    //
    // async function mergeLangData(getLocaleMessage: any) {
    //   const updataLang: Record<string, any> = {};
    //   updataLang['zh_cn'] = await mergeLangDataI('zh_cn', getLocaleMessage);
    //   if (useSettingStore().setting.lang !== 'zh_cn') {
    //     updataLang[useSettingStore().setting.lang] = await mergeLangDataI(useSettingStore().setting.lang, getLocaleMessage);
    //   }
    //   return updataLang;
    // }
    //
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
    // async function getOrCacheItem(route: string[], imgAdd: string[]) {
    //   const data = get(localRepositoriesData.value, route);
    //   const cache = get(cachedItems, [...route, ...imgAdd]);
    //   if (!cache) {
    //     const item = {
    //       'name': '未知',
    //       'iconSrc': baseUrl + 'static/public/svg/NotFound.svg',
    //       'width': 256,
    //       'height': 256
    //     };
    //     const iconHandle = get(data, imgAdd) as any;
    //     if (iconHandle !== undefined) {
    //       item.iconSrc = URL.createObjectURL(await iconHandle.getFile());
    //
    //       // 等待图片加载完再处理尺寸
    //       await new Promise<void>((resolve) => {
    //         const img = new Image();
    //         img.onload = () => {
    //           item.width = img.naturalWidth;
    //           item.height = img.naturalHeight;
    //
    //           if (Math.max(item.width, item.height) < 256) {
    //             const scale = 256 / Math.max(item.width, item.height);
    //             item.width = Math.round(item.width * scale);
    //             item.height = Math.round(item.height * scale);
    //           }
    //           resolve(); // 通知外部图片加载完了
    //         };
    //         img.src = item.iconSrc;
    //       });
    //     }
    //     const configHandle = get(data, 'config_json') as any;
    //     if (configHandle !== undefined) {
    //       const configData = await configHandle.getFile();
    //       const jsonText = await configData.text();
    //       const jsonData = JSON.parse(jsonText);
    //       const itemName = get(jsonData, 'name');
    //       if (itemName !== undefined) {
    //         item.name = itemName;
    //       }
    //     }
    //     // 缓存
    //     deepSet(cachedItems, [...route, ...imgAdd], {...item});
    //     return {...item};
    //   } else {
    //     return {...cache};
    //   }
    // }

    return {
      persistentStorage,
      wikiRepos,
      addLocalRepo,
      deleteRepos,
      // initState,
      // routeGroups,
      // langHandles,
      // processHandle,
      // initFetchData,
      // refreshData,
      // mergeLangData,
      deleteDatabase,
      // deepSet,
      // getOrCacheItem
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
  for await (const item of iter) {
    handle[item[1].name] = item[1];
  }
  return handle;
}

async function init_getIconURL(root: any) {
  let iconURL = '/public/svg/NotFound.svg';
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

async function getIconURL(lrd: any) {
  let x = 0;
  for (const i of lrd) {
    const iconHandle = i.iconHandle;
    let iconURL = '/static/public/svg/NotFound.svg';
    if (iconHandle != 'notFound') {
      const content = await iconHandle.getFile();
      const icon = new Blob([content], {type: 'image/svg+xml'});
      iconURL = URL.createObjectURL(icon);
    }
    lrd[x].iconURL = iconURL;
    x++;
  }
  return lrd;
}

function readFileAsText(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file, 'utf-8');
  });
}

function processRouteData(route: any) {

  const processedData: Record<string, any> = {};
  for (const lang in route) {
    if (!processedData[lang]) {
      processedData[lang] = {};
    }
    for (const i of route[lang]) {
      const items = get(i, 'items');

      if (!items) {
        processedData[lang][i.path] = {...i};
      } else {
        processedData[lang][i.path] = {...i};
        processedData[lang][i.path].items = {};
        for (const i2 of items) {
          processedData[lang][i.path].items[i2.path] = i2;
        }
      }
    }
  }
  return processedData;
}

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


function deepMergeOnlyNew(oldObj: any, newObj: any) {
  for (const key in newObj) {
    if (Object.prototype.hasOwnProperty.call(newObj, key)) {
      if (typeof newObj[key] === 'object' && newObj[key] !== null) {
        if (typeof oldObj[key] !== 'object' || oldObj[key] === null) {
          oldObj[key] = Array.isArray(newObj[key]) ? [] : {};
        }
        deepMergeOnlyNew(oldObj[key], newObj[key]);
      } else {
        if (!(key in oldObj)) {
          oldObj[key] = newObj[key];
        }
      }
    }
  }
  return oldObj;
}

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
