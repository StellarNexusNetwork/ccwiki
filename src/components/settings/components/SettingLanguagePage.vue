<template>
  <div>
    <div class="box">
      <div class="name">{{ t("public.setting.language.lang.title") }}</div>
      <Select v-model="selectedLang" :options="langs" optionLabel="name" placeholder="Select a language" class="selectDiv w-full md:w-56" appendTo="#setting_dialog" @change="onLangChange"/>
    </div>
    <!--    <button @click="setLocale('zh_cn')">中文</button>-->
    <!--    <button @click="setLocale('en_us')">English</button>-->
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {useI18n} from 'vue-i18n';
import {useSettingStore} from '@/stores/setting';
import {usePrimeVue} from 'primevue/config'
import {setPrimeLocale} from '@/utils/i18n/primevue';

const {t} = useI18n();

const {locale} = useI18n();
const settingStore = useSettingStore();

const primevue = usePrimeVue();

const defaultLang: string = settingStore.setting.lang;

const selectedLang = ref();

// 支持的语言列表
const langs = ref([
  {name: '中文(中国)', code: 'zh_cn'},
  {name: 'English', code: 'en_us'},
  {name: '中文(巨硬)', code: 'zh_ms'}
]);


// 根据语言 code 获取显示名称
const getNameByCode = (code: string) => {
  const item = langs.value.find(c => c.code === code);
  return item ? item.name : null;
};

// 切换语言的函数
const setLocale = (langCode: string) => {
  locale.value = langCode;
  settingStore.setting.lang = langCode;
  // 设置 primevue 的语言
  setPrimeLocale(langCode, primevue);
};

// 校验语言 code 是否存在 不存在则回退到 'zh_cn'
const resolveLangCode = (code: string) => {
  const hasCode = langs.value.some(item => item.code === code);
  return hasCode ? code : 'zh_cn';
};

// 处理初始化语言
const initialLang = resolveLangCode(defaultLang);
// 设置默认选中项
selectedLang.value = {name: getNameByCode(initialLang), code: initialLang};
//
if (initialLang !== defaultLang) {
  setLocale(initialLang);
}
// 监听语言变化
const onLangChange = () => {
  const code = selectedLang.value?.code;

  if (!code) return;

  setLocale(resolveLangCode(code));
};
</script>
<style scoped>
.box {
  display: flex;
}

.box .name {
  color: var(--color-text-body);
}

.box .selectDiv {
  margin-left: auto;
}
</style>
