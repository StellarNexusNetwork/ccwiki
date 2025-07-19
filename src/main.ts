import './assets/main.css';

import {createApp} from 'vue';
import {createPinia} from 'pinia';
import {createI18n} from 'vue-i18n';
import Vue3Marquee from 'vue3-marquee';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';

import App from './App.vue';
import router from './router';

import zh_cn from './json/locales/zh_cn.json';
import en_us from './json/locales/en_us.json';

import {useSettingStore} from '@/stores/setting';

const app = createApp(App);

app.use(createPinia());
app.use(router);

useSettingStore().langData = {zh_cn, en_us};

const i18n = createI18n({
  locale: useSettingStore().setting.lang, // 设置当前语言，默认使用 "en"
  fallbackLocale: 'zh_cn', // 定义后备语言，当当前语言缺少翻译时使用
  // legacy: false, // 启用组合式 API 的写法
  globalInjection: true, // 全局注册 $t 方法以便在模板中使用
  allowComposition: true, // 允许组合式 API 的使用
  messages: {zh_cn, en_us}, // 初始仅加载中文
});

app.use(i18n);

app.use(i18n).use(Vue3Marquee);
app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: 'system',
      cssLayer: false
    }
  }
});

app.mount('#app');
