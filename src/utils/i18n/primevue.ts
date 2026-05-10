import {all as locales} from 'primelocale'

// PrimeVue 的语言代码映射
const primeLocale = {
  zh_cn: 'zh-CN',
  zh_ms: 'zh-CN',
  en_us: 'en'
}

// 自动推导出 key 类型
type primeLocaleCode = keyof typeof primeLocale;

// 切换primevue语言
export function setPrimeLocale(langCode: string, primevue) {
  // 获取对应的 PrimeVue 语言代码
  let code = 'zh-CN';
  if (langCode in primeLocale) {
    code = primeLocale[langCode as primeLocaleCode];
  }
  // 切换
  Object.assign(
    primevue.config.locale!,
    locales[code as keyof typeof locales]
  )
  console.log(`PrimeVue 语言已切换为 ${code}`)
}
