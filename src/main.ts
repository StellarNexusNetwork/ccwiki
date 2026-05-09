import '@/assets/css/main.css';

import {createApp} from 'vue';
import {createPinia} from 'pinia';
import {createI18n} from 'vue-i18n';
import Vue3Marquee from 'vue3-marquee';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import {definePreset} from "@primeuix/themes";

import App from '@/App.vue';
import router from '@/router';

import zh_cn from '@/assets/json/locales/zh_cn.json';
import en_us from '@/assets/json/locales/en_us.json';
import zh_ms from '@/assets/json/locales/zh_ms.json';

import {useSettingStore} from '@/stores/setting';

const app = createApp(App);

app.use(createPinia());
app.use(router);

useSettingStore().langData = {zh_cn, en_us, zh_ms};

const i18n = createI18n({
  locale: useSettingStore().setting.lang, // 设置当前语言，默认使用 "en"
  fallbackLocale: 'zh_cn', // 定义后备语言，当当前语言缺少翻译时使用
  legacy: false, // 启用组合式 API 的写法
  // globalInjection: true, // 全局注册 $t 方法以便在模板中使用
  allowComposition: true, // 允许组合式 API 的使用
  messages: {zh_cn, en_us, zh_ms}, // 初始仅加载中文
});

app.use(i18n);

app.use(Vue3Marquee);

const Preset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "{sky.50}",
      100: "{sky.100}",
      200: "{sky.200}",
      300: "{sky.300}",
      400: "{sky.400}",
      500: "{sky.500}",
      600: "{sky.600}",
      700: "{sky.700}",
      800: "{sky.800}",
      900: "{sky.900}",
      950: "{sky.950}",
    }
  }
});

app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: Preset,
    options: {
      prefix: 'p',
      darkModeSelector: '.app-dark',
      cssLayer: {
        name: 'primevue',
        order: 'app-styles, primevue, another-css-library'
      }
    }
  }
});

app.mount('#app');
