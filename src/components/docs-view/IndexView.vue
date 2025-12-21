<template>
  <WikiRepos v-if="Object.keys(data.wikiRepos).length> 0 && path.length<1"/>
  <ItemList :meta="meta" v-else-if="Object.keys(data.wikiRepos).length> 0 && path.length>1 && wikiRepo && meta"/>
  <DocsPage :config="config" v-else-if="Object.keys(data.wikiRepos).length> 0 && path.length>1 && wikiRepo && config"/>
  <div class="notFoundUrl" v-else-if="(Object.keys(data.wikiRepos).length> 0 && path.length>0) && (!wikiRepo || !meta || !config)">
    <NotFoundView/>
  </div>
  <div class="notFoundR" v-else>
    <div class="imgAndTitle">
      <img src="/views/DocsView/avif/not_found_p.avif" alt="SVG Image" draggable="false">
      <p>{{ t("page.classification.NotFound") }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import WikiRepos from '@/components/docs-view/WikiRepos.vue'
import {useDataSourcesStore} from "@/stores/dataSources";
import {useI18n} from 'vue-i18n';
import {useRoute} from "vue-router";
import get from 'lodash/get';
import {useSettingStore} from "@/stores/setting";
import {watch} from 'vue'
import ItemList from './ItemList.vue'
import DocsPage from './DocsPage.vue'
import NotFoundView from "@/views/ErrorViews/NotFoundView.vue";

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

const path = [...route.params.pathMatch as string[]]

await waitUntilTrue(() => data.initState)

let wikiRepo: any;
let meta: Record<string, any>;
let config: Record<string, any>;
let dir: Record<string, FileSystemDirectoryHandle | FileSystemFileHandle>;

if (path.length > 0) {

  wikiRepo = get(data.wikiRepos, path[0])

  path.shift();
  path.unshift('docs', lang);
  if (wikiRepo) {
    if (wikiRepo.type == "local") {
      try {
        dir = await wikiRepo.readCategories(path);
      } catch (err) {
        console.error(err);
        dir = {};
      }
      const metaFile = get(dir, '_meta.json') as FileSystemFileHandle | undefined;
      const configFile = get(dir, 'config.json') as FileSystemFileHandle | undefined;
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
    } else if (wikiRepo.type == "httpServer") {
      async function getJsonFile(repo: any, basePath: string[], filename: string) {
        try {
          const fullPath = [...basePath, filename];
          return await repo.getFile(fullPath);
        } catch {
          return null;
        }
      }

      meta = await getJsonFile(wikiRepo, path, '_meta.json');
      config = await getJsonFile(wikiRepo, path, 'config.json');

      // if (meta) {
      //   console.log(meta)
      //   meta.children = Object.fromEntries(
      //     Object.entries(meta.children).filter(([k]) => k in dir)
      //   );
      // }
    }
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
