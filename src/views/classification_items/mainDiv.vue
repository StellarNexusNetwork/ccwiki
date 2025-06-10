<template>
  <div class="Div">
    <div class="markdown-body">
      <h2 :style="{ 'viewTransitionName': 'class-itemList-title-' + category + '-' + subcategory ,'borderBottom':'none'}">
        {{ $t("docs." + category + ".items." + subcategory + ".title") }}
      </h2>
    </div>
    <div class="AboutList">
      <suspense v-for="([id, item], index) in entries">
        <template #default>
          <ItemCard :category="category" :subcategory="subcategory" :id="id" :data="item"/>
        </template>
      </suspense>
    </div>
  </div>
</template>

<script setup lang="ts">
import ItemCard from "./ItemCard.vue";
import get from 'lodash/get';
import {computed, ref, toRaw} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useI18n} from 'vue-i18n';
import {useDataSourcesStore} from "../../stores/dataSources";
import {useSettingStore} from "../../stores/setting";

const route = useRoute()
const {category, subcategory} = route.params

const itemList = ref<any[]>([]);

const dataSources = useDataSourcesStore()

// 刷新数据
if (Object.keys(dataSources.localRepositoriesData).length === 0) {
  await dataSources.refreshData()

  // 合并语言数据
  const {getLocaleMessage} = useI18n();

  const updateLang = await useDataSourcesStore().mergeLangData(getLocaleMessage)
  for (const lang in updateLang) {
    useI18n().setLocaleMessage(lang, updateLang[lang])
  }
}

const root = toRaw(dataSources.localRepositoriesData)

const lang = computed(() => useSettingStore().setting.lang)

const routes = computed(() => useDataSourcesStore().routeGroups)

const items = get(root, [Object.keys(routes.value)[0], 'docs', lang.value, category, subcategory])


if (items === undefined) {
  useRouter().push('/404')
}
const entries = computed(() => Object.entries(items ?? {} as Record<string, any>));
// else {
//   const entries = Object.entries(items);
//   const ids = entries.map(([id]) => id);
//   const objs = entries.map(([, obj]) => obj);
//   itemList.value.push(...objs)
// }
</script>

<style scoped>
.Div {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.Div .markdown-body {
  margin-top: 20px;
  width: 95%;
}

.Div .AboutList {
  width: 95%;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 20px;
  margin-top: 10px;
}
</style>