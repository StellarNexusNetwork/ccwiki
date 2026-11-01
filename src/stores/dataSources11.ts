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
