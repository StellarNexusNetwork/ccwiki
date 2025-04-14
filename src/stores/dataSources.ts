import {defineStore} from "pinia";
import {ref, toRaw, watch} from "vue";
import defaultSetting from "@/json/defaultSetting.json";


export const useDataSourcesStore = defineStore('DataSources', () => {
        let localRepositories = ref()
        let localRepositoriesDisplay = ref()
        let initState = false

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

        async function initFetchData() {
            localRepositories.value = await loadData('localRepositories')
            localRepositoriesDisplay.value = await loadData('localRepositoriesDisplay');
            localRepositoriesDisplay.value = await getIconURL(localRepositoriesDisplay.value)
            initState = true;
        }

        async function refreshData() {
            let lrd: any = [];

            for (const i of toRaw(localRepositoriesDisplay.value)) {
                const configData = await i.configHandle.getFile();
                const fileText = await readFileAsText(configData);
                const jsonDataRaw = JSON.parse(fileText);

                const jsonData = Object.assign({
                    name: "Unknown",
                    version: "Unknown"
                }, defaultSetting, jsonDataRaw);

                i.name = jsonData.name;
                i.version = jsonData.version;
                lrd.push(i);
            }
            localRepositoriesDisplay.value = lrd;
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
                saveData('localRepositoriesDisplay', toRaw(newVal))
            }
        }, {deep: true})

        return {localRepositories, localRepositoriesDisplay, initState, initFetchData, refreshData}
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


    // 存储对象结构：{ key: ..., handles: [...] }
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