<template>
  <div class="mainDiv">
    <div class="titleDiv">
      <div class="title" :style="{ 'viewTransitionName': 'class-itemList-title-' + category + '-' + subcategory ,'borderBottom':'none'}">
        {{ $t("docs." + category + ".items." + subcategory + ".title") }}
      </div>
    </div>
    <div class="AboutList">
      <suspense v-for="([id, item], index) in entries" :key="id">
        <template #default>
          <ItemCard :rid="rid0" :category="category" :subcategory="subcategory" :id="id" :data="item"/>
        </template>
      </suspense>
    </div>
  </div>
</template>

<script setup lang="ts">
import ItemCard from './ItemCard.vue';
import get from 'lodash/get';
import {computed, ref, toRaw} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useI18n} from 'vue-i18n';
import {useDataSourcesStore} from '@/stores/dataSources';
import {useSettingStore} from '@/stores/setting';

const route = useRoute();
const {rid, category, subcategory} = route.params as {
  rid: string;
  category: string;
  subcategory: string;
};

const rid0 = ref();
if (/^\d+$/.test(rid)) {
  rid0.value = Number(rid);
} else {
  useRouter().push('/404');
}


const itemList = ref<any[]>([]);

const dataSources = useDataSourcesStore();

// 刷新数据
if (Object.keys(dataSources.localRepositoriesData).length === 0) {
  await dataSources.refreshData();

  // 合并语言数据
  const {getLocaleMessage} = useI18n();

  const updateLang = await useDataSourcesStore().mergeLangData(getLocaleMessage);
  for (const lang in updateLang) {
    useI18n().setLocaleMessage(lang, updateLang[lang]);
  }
}

const root = toRaw(dataSources.localRepositoriesData);

const lang = computed(() => useSettingStore().setting.lang);

const routes = computed(() => useDataSourcesStore().routeGroups);

const items = get(root, [Object.keys(routes.value)[rid0.value], 'docs', lang.value, category, subcategory]);

if (items === undefined) {
  useRouter().push('/404');
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
.mainDiv {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 20px;
  width: 95%;
  margin-top: 25px;
}

.titleDiv {
  width: 100%;
}

.mainDiv .title {
  max-width: 90vw;
  overflow: hidden;
  white-space: pre-line;
  font-family: MiSans-B;
  font-size: 25px;
  margin-bottom: 5px;
  color: var(--color-text-title);
  transition-duration: 0.3s;
}


.mainDiv .AboutList {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 20px;
  margin-top: 10px;
  padding-bottom: 40px;
}
</style>