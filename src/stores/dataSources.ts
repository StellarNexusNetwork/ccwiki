import {defineStore} from "pinia";
import {ref} from "vue";


export const useDataSourcesStore = defineStore('DataSources', () => {
        const localRepositories: any = []
        const localRepositoriesDisplay = ref([])
        return {localRepositories, localRepositoriesDisplay}
    }
)