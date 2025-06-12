import {defineStore} from "pinia";
import {ref, toRaw, watch} from "vue";
import {useNoticeStore, useSettingStore} from '@/stores/setting';

import get from 'lodash/get';

export const useDataSourcesStore = defineStore('DataSources', () => {
        let localRepositories = ref();
        let localRepositoriesDisplay = ref();
        let localRepositoriesData: Record<string, any> = ref({});
        let initState = false;
        let routeGroups: any = ref({});
        let langHandles: any = ref([]);
        let cachedItems: any = ref({});

        const notice = useNoticeStore()

        // let db = ref<any>(null)
        // let opfsRoot = null
        // let fileHandle = null

        // const dbPromise = (async () => {
        //     try {
        //         const SQL = await initSqlJs({
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


        async function processHandle(handle: any) {
            if (handle.kind === 'file') {
                return handle
            }

            const iter = handle.entries();
            for await (const item of iter) {
                const returnHandle = await processHandle(item[1])
                if (returnHandle.name !== 'kind' && returnHandle.name !== 'name') {
                    handle[returnHandle.name.replace(/\./g, "_")] = returnHandle
                }
            }
            return handle
        }

        async function initFetchData() {
            localRepositories.value = await loadData('localRepositories')
            localRepositoriesDisplay.value = await loadData('localRepositoriesDisplay');
            langHandles.value = await loadData('langHandles');
            localRepositoriesDisplay.value = await getIconURL(localRepositoriesDisplay.value)
            initState = true;
        }

        async function refreshData() {
            let lrd: any = [];
            // 读取仓库语言文件
            langHandles.value = []
            for (const ir of toRaw(localRepositories.value)) {
                const root = await processHandle(ir.root)
                const lang = get(root, 'lang')
                const langObject: Record<string, any> = {};
                for (const key in lang ?? {}) {
                    if (Object.hasOwn(lang, key)) {
                        langObject[key.slice(0, -5)] = lang[key];
                    }
                }
                langHandles.value.push(langObject)
            }
            // 处理展示数据和存储数据

            for (const i of toRaw(localRepositoriesDisplay.value)) {
                const configData = await i.configHandle.getFile();
                const fileText = await configData.text()
                const jsonDataRaw = JSON.parse(fileText);

                const jsonData = Object.assign({}, {
                    "name": "Unknown",
                    "version": "Unknown",
                    "routes": []
                }, jsonDataRaw);

                i.name = jsonData.name;
                i.version = jsonData.version;
                i.routes = jsonData.routes;
                lrd.push(i);
            }
            localRepositoriesDisplay.value = lrd;
            if (localRepositories.value.length > 0) {
                for (const i of toRaw(localRepositories.value)) {
                    localRepositoriesData.value[i.ulid] = await processHandle(i.root)
                }
            }
        }

        async function mergeLangData(getLocaleMessage: any) {
            let updataLang: Record<string, any> = {}
            updataLang['zh_cn'] = await mergeLangDataI('zh_cn', getLocaleMessage)
            if (useSettingStore().setting.lang !== 'zh_cn') {
                updataLang[useSettingStore().setting.lang] = await mergeLangDataI(useSettingStore().setting.lang, getLocaleMessage)
            }
            return updataLang;
        }

        function deleteDatabase(dbName: string): Promise<boolean> {
            return new Promise((resolve, reject) => {
                const request = indexedDB.deleteDatabase(dbName);

                request.onsuccess = () => {
                    console.log(`数据库 "${dbName}" 删除成功～喵`);
                    notice.addNotice({'type': 'success', 'title': '操作成功！', 'content': `数据库 "${dbName}" 删除成功～喵`})
                    resolve(true);
                };

                request.onerror = (event) => {
                    console.error(`数据库删除失败:`, event);
                    notice.addNotice({'type': 'error', 'title': '操作失败！', 'content': `数据库删除失败`})
                    reject(event);
                };

                request.onblocked = () => {
                    console.warn(`数据库 "${dbName}" 删除被阻止（可能有打开的连接）`);
                    notice.addNotice({'type': 'warn', 'title': '操作被阻止', 'content': `数据库 "${dbName}" 删除被阻止`})
                };
            });
        }

        watch(localRepositories, (newVal) => {
            if (initState) {
                saveData('localRepositories', toRaw(newVal))
            }
        }, {deep: true})

        watch(localRepositoriesDisplay, (newVal) => {
            if (initState) {
                let routeGroupsI: any = []
                newVal = toRaw(newVal)
                saveData('localRepositoriesDisplay', newVal)
                for (const i of newVal) {
                    routeGroupsI[i.ulid] = processRouteData(i.routes)
                }
                routeGroups.value = routeGroupsI
            }
        }, {deep: true})

        watch(langHandles, (newVal) => {
            if (initState) {
                saveData('langHandles', toRaw(newVal));
            }
        }, {deep: true})

        function deepSet(obj: any, keys: string[], value: any) {
            let current = obj;
            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                current[key] = current[key] || {};
                current = current[key];
            }
            current[keys[keys.length - 1]] = value;
        }

        async function getOrCacheItem(route: string[]) {
            const data = get(localRepositoriesData.value, route)
            const cache = get(cachedItems, route)
            if (!cache) {
                let item = {"name": "未知", "iconSrc": "/static/public/svg/NotFound.svg"}
                const iconHandle = get(data, ['icon_png']) as any
                if (iconHandle !== undefined) {
                    item.iconSrc = URL.createObjectURL(await iconHandle.getFile())
                }
                const configHandle = get(data, 'config_json') as any
                if (configHandle !== undefined) {
                    const configData = await configHandle.getFile()
                    const jsonText = await configData.text()
                    const jsonData = JSON.parse(jsonText)
                    const itemName = get(jsonData, "name")
                    if (itemName !== undefined) {
                        item.name = itemName
                    }
                }
                // 缓存
                deepSet(cachedItems, route, {...item})
                return {...item}
            } else {
                return {...cache}
            }

        }

        return {
            localRepositories,
            localRepositoriesDisplay,
            localRepositoriesData,
            initState,
            routeGroups,
            langHandles,
            processHandle,
            initFetchData,
            refreshData,
            mergeLangData,
            deleteDatabase,
            deepSet,
            getOrCacheItem
        }
    }
)

// async function opfsWrite(db: any, fileHandle: any) {
//     const writable = await fileHandle.createWritable();
//     const binaryArray = db.value.export();
//     await writable.write(binaryArray);
//     await writable.close();
// }

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("dataSourcesDB", 1);

        request.onupgradeneeded = (event: any) => {
            const db = event.target.result;
            // 创建一个 object store，key 是字符串
            if (!db.objectStoreNames.contains("dataSources")) {
                db.createObjectStore("dataSources", {keyPath: "key"});
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveData(key: string, data: any) {
    const db: any = await openDB();
    const tx = db.transaction("dataSources", "readwrite");
    const store = tx.objectStore("dataSources");

    store.put({key, data});

    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
    });
}

async function loadData(key: string) {
    const db: any = await openDB();
    const tx = db.transaction("dataSources", "readonly");
    const store = tx.objectStore("dataSources");

    return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result?.data || []);
        request.onerror = () => reject(request.error);
    });
}

async function getIconURL(lrd: any) {
    let x = 0
    for (const i of lrd) {
        const iconHandle = i.iconHandle
        let iconURL = '/static/public/svg/NotFound.svg'
        if (iconHandle != 'notFound') {
            const content = await iconHandle.getFile()
            const icon = new Blob([content], {type: "image/svg+xml"});
            iconURL = URL.createObjectURL(icon);
        }
        lrd[x].iconURL = iconURL
        x++
    }
    return lrd
}

function readFileAsText(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsText(file, 'utf-8')
    });
}

function processRouteData(route: any) {

    let processedData: Record<string, any> = {}
    for (const lang in route) {
        if (!processedData[lang]) {
            processedData[lang] = {};
        }
        for (const i of route[lang]) {
            const items = get(i, 'items')

            if (!items) {
                processedData[lang][i.path] = {...i}
            } else {
                processedData[lang][i.path] = {...i}
                processedData[lang][i.path].items = {}
                for (const i2 of items) {
                    processedData[lang][i.path].items[i2.path] = i2
                }

            }
        }
    }
    return processedData
}

function mergeRouteGroups(routeGroups: any[]): any[] {
    const mergedRoutes: any[] = [];

    for (const group of routeGroups) {
        for (const route of group) {
            const existingRoute = mergedRoutes.find((r) => r.path === route.path);

            if (existingRoute) {
                // 合并子路由
                if (Array.isArray(route.items)) {
                    if (!Array.isArray(existingRoute.items)) {
                        existingRoute.items = [];
                    }
                    for (const item of route.items) {
                        if (!existingRoute.items.some((i: { 'path': string }) => i.path === item.path)) {
                            existingRoute.items.push(item);
                        }
                    }
                }
            } else {
                mergedRoutes.push({...route});
            }
        }
    }
    return mergedRoutes;
}


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

async function mergeLangDataI(lang: string, getLocaleMessage: any) {
    const oldMessages = toRaw(getLocaleMessage(lang));
    let updataLangData = {};
    for (const i of toRaw(useDataSourcesStore().langHandles)) {
        if (i?.[lang] !== undefined) {
            const langData = await i[lang].getFile();
            const fileText = await readFileAsText(langData);
            const jsonDataRaw = JSON.parse(fileText);
            updataLangData = deepMergeOnlyNew({...updataLangData}, jsonDataRaw)
        }
    }
    return {
        ...oldMessages,
        ...updataLangData
    }
}