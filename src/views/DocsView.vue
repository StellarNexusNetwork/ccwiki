<template>
  <div>
    <WikiRepos v-if="Object.keys(data.wikiRepos).length> 0 && path.length<1"/>
    <ItemList :meta="meta" :wikiRepo="wikiRepo" :dirPath="dirPath" v-else-if="Object.keys(data.wikiRepos).length> 0 && path.length>0 && wikiRepo && meta"/>
    <!--    <DocsPage :config="config" v-else-if="Object.keys(data.wikiRepos).length> 0 && path.length>1 && wikiRepo && config"/>-->
    <div class="notFoundUrl" v-else-if="(Object.keys(data.wikiRepos).length> 0 && path.length>0) && (!wikiRepo || !meta || !config)">
      <NotFoundView/>
    </div>
    <div class="notFoundR" v-else>
      <div class="imgAndTitle">
        <img src="/static/views/docs-view/avif/not-found-p.avif" alt="SVG Image" draggable="false">
        <p>{{ t("page.classification.NotFound") }}</p>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type {WikiRepoInstance} from "@/adapters/adapter/types.ts";
import {type MetaFile, MetaFileSchema} from "@/adapters/adapter/types/meta-file.ts";
import {type PageConfig, PageConfigFileSchema} from "@/adapters/adapter/types/page-config.ts";

import {onMounted, shallowRef, watch} from "vue";
import {useDataSourcesStore3} from "@/stores/dataSources3";
import {useI18n} from "vue-i18n";
import {useRoute} from "vue-router";
import {useSettingStore} from "@/stores/setting.ts";
import get from "lodash/get";
import NotFoundView from "@/views/error-views/NotFoundView.vue";
import ItemList from "@/components/docs/ItemList.vue";
import WikiRepos from "@/components/docs/WikiRepos.vue";

// 用于等待的函数
function waitUntilTrue(source: () => boolean) {
  return new Promise<void>((resolve) => {
    if (source()) {
      resolve();
      return;
    }

    const stop = watch(source, (val) => {
      if (val) {
        stop();
        resolve();
      }
    });
  });
}

const data = useDataSourcesStore3();

const {t} = useI18n();
const route = useRoute();
const lang = useSettingStore().setting.lang;

const path = [...route.params.pathMatch as string[]];

let dirPath: string;
const wikiRepo = shallowRef<WikiRepoInstance | undefined>(undefined);
const meta = shallowRef<MetaFile | undefined>(undefined);
const config = shallowRef<PageConfig | undefined>(undefined);

onMounted(async () => {
  // 加载数据
  if (path.length == 0) return;

  // 等待初始化完成
  await waitUntilTrue(() => data.initState);

  // 获取仓库
  wikiRepo.value = get(data.wikiRepos, path[0]);
  if (!wikiRepo.value) return;

  // 处理当前路径
  const dirPathList = path.slice();
  dirPathList.shift();
  dirPathList.unshift('docs', lang);
  dirPath = dirPathList.join("/");

  // 尝试获取meta
  try {
    const metaFile = await wikiRepo.value.getFileByPath(dirPath, "_meta.json");
    const json = JSON.parse(await metaFile.text());
    // 检查配置是否合法
    const result = MetaFileSchema.safeParse(json);
    if (result.success) {
      meta.value = result.data;
    } else {
      console.log("meta 格式不合法");
    }
  } catch (e) {
  }
  // 尝试获取页面配置
  try {
    const configFile = await wikiRepo.value.getFileByPath(dirPath, "config.json");
    const json = JSON.parse(await configFile.text());
    // 检查配置是否合法
    const result = PageConfigFileSchema.safeParse(json);
    if (result.success) {
      config.value = result.data;
    } else {
      console.log("页面 config 格式不合法");
    }
  } catch (e) {
  }
  console.log(config, meta)
})
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

@media (min-width: 622px) {
  .notFoundR .imgAndTitle img {
    max-width: 400px;
    max-height: 400px;
  }
}

@media (max-width: 622px) {
  .notFoundR .imgAndTitle img {
    max-width: 300px;
    max-height: 300px;
  }
}

.notFoundR .imgAndTitle img {
  user-select: none;
  margin-bottom: 15px;
}

.notFoundUrl {
  width: 100%;
  height: 100%;
  contain: content;
  align-content: center;
}
</style>
