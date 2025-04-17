import {defineStore} from "pinia";
import {reactive, watchEffect} from "vue";
import defaultSetting from '../json/defaultSetting.json';


export const useSettingStore = defineStore('setting', () => {
        let langData = {}
        const oldSetting = reactive(
            JSON.parse(localStorage.getItem('setting') as string) || {}
        )
        const setting = reactive(Object.assign({}, defaultSetting, oldSetting))
        watchEffect(() => {
            localStorage.setItem("setting", JSON.stringify(setting));
        })

        //主题
        watchEffect(() => {
            if (setting.theme.appearance === 'light') {
                document.documentElement.setAttribute("data-theme", "light");
            } else if (setting.theme.appearance === 'dark') {
                document.documentElement.setAttribute("data-theme", "dark");
            } else {
                document.documentElement.removeAttribute("data-theme");
            }
        })
        return {setting, langData}
    }
)