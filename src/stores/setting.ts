import {defineStore} from 'pinia';
import {reactive, watchEffect} from 'vue';
import defaultSetting from '@/assets/json/defaultSetting.json';

const SUPPORTED_LANGS = ['zh_cn', 'en_us', 'zh_ms'] as const;
const FALLBACK_LANG = 'zh_cn';

function normalizeLang(lang: unknown): string {
  if (typeof lang !== 'string') {
    return FALLBACK_LANG;
  }
  return SUPPORTED_LANGS.includes(lang as (typeof SUPPORTED_LANGS)[number]) ? lang : FALLBACK_LANG;
}

function readStoredSetting(): Record<string, unknown> {
  try {
    const raw = localStorage.getItem('setting');
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export const useSettingStore = defineStore('setting',
  () => {
    const langData = {};
    const oldSetting = reactive(readStoredSetting());
    const setting = reactive(Object.assign({}, defaultSetting, oldSetting));
    setting.lang = normalizeLang(setting.lang);

    watchEffect(() => {
      setting.lang = normalizeLang(setting.lang);
    });

    watchEffect(() => {
      localStorage.setItem('setting', JSON.stringify(setting));
    });

    //主题
    watchEffect(() => {
      if (setting.theme.appearance === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else if (setting.theme.appearance === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    });
    return {setting, langData};
  }
);
