import { createI18n } from 'vue-i18n';
import zh from './locales/zh_cn.json';

const i18n = createI18n({
    legacy: false, // 启用 Composition API
    locale: 'zh', // 默认语言
    fallbackLocale: 'zh', // 回退到中文
    messages: { zh }, // 初始仅加载中文
});

// 动态加载其他语言
async function loadLocaleMessages(locale) {
    const messages = await import(`./locales/${locale}.json`);
    const defaultMessages = await import('./locales/zh_cn.json');

    return new Proxy(messages.default, {
        get(target, prop) {
            return prop in target ? target[prop] : defaultMessages.default[prop];
        },
    });
}

// 切换语言的函数
async function setLocale(locale) {
    const messages = await loadLocaleMessages(locale);
    i18n.global.setLocaleMessage(locale, messages);
    i18n.global.locale = locale;
}

export { i18n, setLocale };