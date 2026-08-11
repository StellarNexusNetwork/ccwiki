import {defineStore} from 'pinia';
import {markRaw, shallowReactive, toRaw, watch} from 'vue';


type FsHandle = FileSystemDirectoryHandle | FileSystemFileHandle;
type FsHandleMap = Record<string, FsHandle>;
type RepoInstance = LocalWikiRepo | HttpWikiRepo;


interface ImageInfo {
  src: string;
  width: number;
  height: number;
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


export const useDataSourcesStore = defineStore(
  'DataSources', () => {


    const wikiRepos: Record<string, RepoInstance> = shallowReactive({});
    const remoteImageCache = new Map<string, ImageInfo>();

    function setWikiRepo(id: string, repo: RepoInstance) {
      const oldRepo = wikiRepos[id];
      if (oldRepo instanceof LocalWikiRepo) {
        oldRepo.dispose();
      }
      wikiRepos[id] = markRaw(repo) as RepoInstance;
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







      initState.value = true;
      console.log('读取仓库数据完成！')
    }


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
