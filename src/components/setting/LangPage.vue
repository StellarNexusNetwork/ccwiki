<template>
  <div>
    <div class="box">
      <div class="name">{{ $t("public.setting.language.lang.title") }}</div>
      <Select v-model="selectedLang" :options="langs" optionLabel="name" placeholder="Select a language" class="selectDiv w-full md:w-56" appendTo="#setting_dialog"/>
    </div>
    <!--    <button @click="setLocale('zh_cn')">中文</button>-->
    <!--    <button @click="setLocale('en_us')">English</button>-->
  </div>
</template>

<script setup lang="ts">
import {ref, watchEffect} from 'vue';
import {useI18n} from 'vue-i18n';
import {useSettingStore} from '@/stores/setting';

const {locale} = useI18n();
const settingStore = useSettingStore();

// 切换语言的函数
const setLocale = (langCode: string) => {
  locale.value = langCode;
  settingStore.setting.lang = langCode;
};

const getNameByCode = (code: string) => {
  const item = langs.value.find(c => c.code === code);
  return item ? item.name : null;
};

const defaultLang: string = settingStore.setting.lang;

const selectedLang = ref();
const langs = ref([
  {name: '简体中文', code: 'zh_cn'},
  {name: 'English', code: 'en_us'}
]);


selectedLang.value = {name: getNameByCode(defaultLang), code: defaultLang};

watchEffect(() => {
  if (selectedLang.value?.code) {
    setLocale(selectedLang.value.code);
  }
});
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