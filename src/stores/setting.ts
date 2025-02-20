import { defineStore } from "pinia";
import { reactive, watchEffect } from "vue";
import defaultSetting from '../json/defaultSetting.json';


export const useSettingStore = defineStore('setting', () => {
    const setting = reactive(
        JSON.parse(localStorage.getItem('setting') as string) || {}
    )
    if (Object.keys(setting).length === 0) {
        Object.assign(setting, defaultSetting);
    }
    watchEffect(() => {
        localStorage.setItem("setting", JSON.stringify(setting));
    })
    return { setting }
}
)