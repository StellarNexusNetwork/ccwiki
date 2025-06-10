<template>
  <div v-for="([key,value], index) in entries">
    <div class="line" :id="index === 0 ? 'firstItem' : undefined"></div>
    <div class="boxDiv">
      <div class="title">{{ $t("docs." + value.path + ".title") }}</div>
      <div class="itemList">
        <button class="item" :id="index === 0 ? 'firstItem' : undefined" @click="routePush('/classification/'+value.path+'/'+item.path)" v-for="(item, index) in value.items">
          <div class="title" :style="{ 'viewTransitionName': 'class-itemList-title-' + value.path + '-' + item.path}">
            {{ $t("docs." + value.path + ".items." + item.path + ".title") }}
          </div>
          <div class="introduction">{{ $t("docs." + value.path + ".items." + item.path + ".content") }}</div>
          <div class="iconList">
            <img class="icon" :src="icon_value.iconSrc" alt="SVG Image" draggable="false" v-for="([icon_key,icon_value], index) in Object.entries(iconList[value.path][item.path]) as [string, any][]" :style="{ 'viewTransitionName': 'class-item-img-' + value.path + '-' + item.path + '-' + icon_value.id }">
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {useDataSourcesStore} from "../../stores/dataSources";
import {useSettingStore} from "../../stores/setting";
import {useI18n} from 'vue-i18n';
import {computed, toRaw} from "vue";
import {useRouter} from 'vue-router';
import get from 'lodash/get';

const router = useRouter();

const lang = computed(() => useSettingStore().setting.lang)
const routes = computed(() => useDataSourcesStore().routeGroups)

// 刷新数据
if (Object.keys(useDataSourcesStore().localRepositoriesData).length === 0) {
  await useDataSourcesStore().refreshData()

  // 合并语言数据
  const {getLocaleMessage} = useI18n();

  const updateLang = await useDataSourcesStore().mergeLangData(getLocaleMessage)
  for (const lang in updateLang) {
    useI18n().setLocaleMessage(lang, updateLang[lang])
  }
}

const entries = computed(() => {
  const obj = routes.value[Object.keys(routes.value)[0]]?.[lang.value] || {};
  return Object.entries(obj) as [string, any][];
});

const iconList: Record<string, any> = await getAllIconList(entries.value)

async function getAllIconList(entries: any) {
  let iconList = {}
  for (const [key, value] of entries) {
    for (const item in toRaw(value).items) {
      useDataSourcesStore().deepSet(iconList, [value.path, item], await getIconList(value.path, item))
    }
  }
  return iconList
}

async function getIconList(category: string, subcategory: string) {
  let iconList = []
  const group = get(useDataSourcesStore().localRepositoriesData, [Object.keys(routes.value)[0], 'docs', useSettingStore().setting.lang, category, subcategory])
  if (group) {
    const first3 = Object.fromEntries(Object.entries(group).slice(0, 3));
    for (const [key, value] of Object.entries(first3)) {
      const item = await useDataSourcesStore().getOrCacheItem([Object.keys(routes.value)[0], 'docs', useSettingStore().setting.lang, category, subcategory, key])
      item['id'] = key
      iconList.push(item)
    }
    return iconList
  } else {
    return [
      {'iconSrc': '/static/public/svg/Test.svg'},
      {'iconSrc': '/static/public/svg/Test.svg'},
      {'iconSrc': '/static/public/svg/Test.svg'}
    ]
  }
}

function routePush(url: string) {
  router.push(url)
}
</script>
<style scoped>
.line {
  width: 100%;
  border-top: 0.5px solid var(--color-border-3);
  margin-top: 30px;
  margin-bottom: 30px;
  transition-duration: 0.3s;
}

.line#firstItem {
  display: none;
}

.boxDiv {
  display: flex;
  flex-direction: column;
}

.boxDiv .title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: MiSans-B;
  font-size: 25px;
  margin-bottom: 5px;
  color: var(--color-text-title);
  transition-duration: 0.3s;
}

.boxDiv .itemList {
  display: flex;
  overflow-x: auto;
}

.boxDiv .itemList #firstItem {
  margin-left: 0;
}

.boxDiv .itemList .item {
  width: 210px;
  min-width: 180px;
  height: 108px;
  padding: 10px;
  border-radius: 10px;
  margin-left: 20px;
  background: var(--color-background-2);
  border: 1px solid rgba(0, 0, 0, 0);
  transition-duration: 0.3s;
}

.boxDiv .itemList .item:hover {
  border: 1px solid var(--color-border-3);
  transition-duration: 0.3s;
}

.boxDiv .itemList .item .title {
  font-family: MiSans-M;
  font-size: 20px;
  margin-bottom: 0;
  color: var(--color-text-title);
  display: flex;
  transition-duration: 0.3s;
}

.boxDiv .itemList .introduction {
  height: 36px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: var(--color-text-body);
  transition-duration: 0.3s;
  text-align: left;
}

.boxDiv .itemList .iconList {
  display: flex;
  height: 20px;
  justify-content: flex-end;
  padding-top: 5px;
}

.boxDiv .itemList .icon {
  margin-left: 5px;
  user-select: none;
}
</style>