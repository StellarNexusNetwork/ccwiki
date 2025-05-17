import {defineStore} from "pinia";
import {ref, toRaw, watch} from "vue";
import {useSettingStore} from '@/stores/setting';
import {useI18n} from 'vue-i18n';

export const useDataSourcesStore = defineStore('DataSources', () => {
        let localRepositories = ref();
        let localRepositoriesDisplay = ref();
        let localRepositoriesData = ref();
        let initState = false;
        let routeGroups: any = ref([]);
        let langHandles: any = ref([]);

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
            handle.children = []
            const iter = handle.entries();
            for await (const item of iter) {
                handle.children.push(await processHandle(item[1]));
            }
            return handle
        }

        async function processHandleDocs(handle: any) {
            if (handle.kind === 'file') {
                return handle
            }

            const iter = handle.entries();
            for await (const item of iter) {
                const returnHandle = await processHandleDocs(item[1])
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
                const lang = root.children.find((obj: { 'name': string }) => obj.name === 'lang');
                const langObject: Record<string, any> = {};
                for (const i of lang.children) {
                    langObject[i.name.slice(0, 5)] = i;
                }
                langHandles.value.push(langObject)
            }
            // 处理展示数据和存储数据

            for (const i of toRaw(localRepositoriesDisplay.value)) {
                const configData = await i.configHandle.getFile();
                const fileText = await readFileAsText(configData);
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
                localRepositoriesData.value = await processHandleDocs(toRaw(localRepositories.value)[0].root)
            }
        }

        async function mergeLangData() {
            let updataLang: Record<string, any> = {}
            updataLang['zh_cn'] = await mergeLangDataI('zh_cn')
            if (useSettingStore().setting.lang !== 'zh_cn') {
                updataLang[useSettingStore().setting.lang] = await mergeLangDataI(useSettingStore().setting.lang)
            }
            return updataLang;
        }


        // watchEffect(() => {
        //     saveHandles('localRepositories', localRepositories)
        // })
        // watchEffect(() => {
        //     console.log(toRaw(localRepositoriesDisplay.value))
        //     //
        // })
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
                    routeGroupsI.push(i.routes)
                }
                routeGroups.value = mergeRouteGroups(routeGroupsI)
            }
        }, {deep: true})

        watch(langHandles, (newVal) => {
            if (initState) {
                saveData('langHandles', toRaw(newVal));
            }
        }, {deep: true})

        return {
            localRepositories,
            localRepositoriesDisplay,
            localRepositoriesData,
            initState,
            routeGroups,
            langHandles,
            processHandle,
            processHandleDocs,
            initFetchData,
            refreshData,
            mergeLangData
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

async function mergeLangDataI(lang: string) {
    const oldMessages = toRaw(useI18n().getLocaleMessage(lang));
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