<template>
  <button class="item" @click="routePush('/docs/'+address.join('/')+'/'+id)">
    <Image v-if="iconPath" class="icon" :path="iconPath" :repo="wikiRepo" alt="SVG Image" draggable="false"/>
    <div class="textBox" :style='{width:textBoxWidth}'>
      <Vue3Marquee v-if="useWindowStore().isMarqueeEnabled" :duration="5" :pauseOnHover="true" :animateOnOverflowOnly="true" :clone="true" @onOverflowDetected="onOverflowDetected" @onOverflowCleared="onOverflowCleared">
        <div class="title" :style="{ 'viewTransitionName': 'item-name-' + dirPath.replaceAll('/','-') + '-' + id }">
          {{ metaChild?.title ?? t("page.docsView.wikiRepos.name.unknow") }}
          <span v-if="shouldAddGap" style="display:inline-block;width:40px;"></span>
        </div>
      </Vue3Marquee>
      <div v-if="!useWindowStore().isMarqueeEnabled" class="title" :style="{ 'viewTransitionName': 'item-name-' + dirPath.replaceAll('/','-') + '-' + id }">
        {{ metaChild?.title ?? t("page.docsView.wikiRepos.name.unknow") }}
      </div>
      <div class="introduction" v-if="introduction">{{
          introduction
        }}
      </div>
      <div class="iconList" v-if="childrenIcon">
        <Image class="iconMini" :path="path as string" :repo="wikiRepo" alt="SVG Image" shape="circle" draggable="false" v-for="[icon_key, path] in Object.entries(childrenIcon)" :key="icon_key"/>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import type {WikiRepoInstance} from "@/adapters/adapter/types.ts";
import type {MetaChild} from "@/adapters/adapter/types/meta-file.ts";

import Image from "@/components/common/image.vue";
import {useWindowStore} from "@/stores/window.ts";
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";
import {useDataSourcesStore} from "@/stores/dataSources.ts";
import {onMounted} from "vue";
import {useTextOverflow} from "@/composables/useTextOverflow.ts";
import {useSettingStore} from "@/stores/setting.ts";
import get from "lodash/get";

const {id, metaChild, wikiRepo, dirPath} = defineProps<{
  id: String,
  metaChild: MetaChild,
  wikiRepo: WikiRepoInstance
  dirPath: string
}>();

const {t} = useI18n();
const route = useRoute();
const router = useRouter();
const {shouldAddGap, onOverflowDetected, onOverflowCleared} = useTextOverflow();

function routePush(url: string) {
  router.push(url);
}

const data = useDataSourcesStore();

type ImageInfoLike = { src: string; width: number; height: number };

const address = [...route.params.pathMatch as string[]];
const lang = useSettingStore().setting.lang

const introduction = get(metaChild, 'introduction');
const childrenIcon = get(metaChild, 'childrenIcon') as Record<string, unknown> | undefined;

const iconPath = get(metaChild, 'icon');

let textBoxWidth = "100%";
// 有主图标时给文本区域预留宽度
if (iconPath) {
  textBoxWidth = 'calc(100% - 60px)';
}

onMounted(() => {
  setTimeout(() => {
    useWindowStore().isMarqueeEnabled = true;
  }, 1000);
});
</script>


<style scoped>
@media (max-width: 670px) {
  .item {
    width: 165px;
  }
}

@media (min-width: 670px) {
  .item {
    width: 200px;
  }
}

.item {
  height: 100px;
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 10px;
  background: var(--color-background-2);
  border: 1px solid rgba(0, 0, 0, 0);
  transition-duration: 0.3s;
}

.item:hover {
  border: 1px solid var(--color-border-3);
  transition-duration: 0.3s;
}

.icon {
  width: 45px;
  height: 45px;
  object-fit: contain;
  image-rendering: pixelated;
  margin-right: 15px;
  user-select: none;
}

.item .textBox {
  display: block;
}

.item .textBox .title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: MiSans-M;
  font-size: 16px;
  margin-bottom: 0;
  color: var(--color-text-title);
  display: flex;
  transition-duration: 0.3s;
}

.item .textBox .introduction {
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

.iconList {
  display: flex;
  height: 20px;
  justify-content: flex-end;
  padding-top: 5px;
}

.iconMini {
  width: 15px;
  height: 15px;
  margin-left: 5px;
  user-select: none;
}
</style>
