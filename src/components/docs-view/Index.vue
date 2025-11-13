<template>
  <WikiRepos v-if="Object.keys(data.wikiRepos).length> 0 && address.length<1"/>
  <ItemList :meta="meta" v-else-if="Object.keys(data.wikiRepos).length> 0 && address.length>1 && wikiRepo && meta"/>
  <Docs :config="config" v-else-if="Object.keys(data.wikiRepos).length> 0 && address.length>1 && wikiRepo && config"/>
  <div v-else-if="Object.keys(data.wikiRepos).length> 0 && address.length>1 && !wikiRepo">
    error 路径错误
  </div>
  <div class="notFoundR" v-else>
    <div class="imgAndTitle">
      <img src="/views/ClassificationView/svg/NotFound.svg" alt="SVG Image" draggable="false">
      <p>{{ t("page.classification.NotFound") }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import WikiRepos from '@/components/docs-view/WikiRepos.vue'
import {useDataSourcesStore} from "@/stores/dataSources.ts";
import {useI18n} from 'vue-i18n';
import {useRoute} from "vue-router";
import get from 'lodash/get';
import {useSettingStore} from "@/stores/setting.ts";
import {watch} from 'vue'
import ItemList from './ItemList.vue'
import Docs from './Docs.vue'

function waitUntilTrue(source: () => boolean) {
  return new Promise<void>((resolve) => {
    watch(
      source,
      (val, _, onCleanup) => {
        if (val) resolve()  // 触发后 Promise 完成
      },
      {immediate: true}
    )
  })
}

const data = useDataSourcesStore();

const {t} = useI18n();

const route = useRoute()
const lang = useSettingStore().setting.lang

const address = [...route.params.pathMatch as string[]]

await waitUntilTrue(() => data.initState)

let wikiRepo: any;
let meta: Record<string, any>;
let config: Record<string, any>;


if (address.length > 1) {

  wikiRepo = get(data.wikiRepos, address[0])

  address.shift();
  address.unshift('docs', lang);
  if (wikiRepo) {
    console.log(address)
    const dir = await wikiRepo.readCategories(address)
    const metaFile = get(dir, '_meta.json')
    const configFile = get(dir, 'config.json')
    if (metaFile) {
      try {
        const file = await metaFile.getFile();
        const json = await file.text();
        meta = JSON.parse(json) as Record<string, any>

        meta["children"] = Object.fromEntries(
          Object.entries(meta["children"]).filter(([key]) => key in dir)
        );

      } catch (e) {
        console.log(e)
      }
    } else if (configFile) {
      try {
        const file = await configFile.getFile();
        const json = await file.text();
        config = JSON.parse(json) as Record<string, any>
      } catch (e) {
        console.log(e)
      }
    }
    console.log(dir)
  }
}


</script>

<style scoped>

.notFoundR {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.notFoundR .imgAndTitle {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: RHRCN-H;
  font-size: 22.5px;
  color: var(--color-text-caption);
  transition-duration: 0.3s;
  padding-left: 10px;
  padding-right: 10px;
}

.notFoundR .imgAndTitle img {
  max-width: 250px;
  max-height: 250px;
  user-select: none;
  margin-bottom: 15px;
}
</style>
