<template>
  <button class="item" @click="routePush('/docs/'+address.join('/')+'/'+id)">
    <img v-if="icon" class="icon" :src="imgInfo.src" alt="SVG Image" draggable="false" :style="{ 'viewTransitionName': 'class-item-img-' + address!.join('-') + '-' + id }">
    <div class="textBox" :style='{width:textBoxWidth}'>
      <Vue3Marquee v-if="useWindowStore().isMarqueeEnabled" :duration="5" :pauseOnHover="true" :animateOnOverflowOnly="true" :clone="true" @onOverflowDetected="onOverflowDetected" @onOverflowCleared="onOverflowCleared">
        <div class="title" :style="{ 'viewTransitionName': 'class-item-name-' + address!.join('-') + '-' + id }">
          {{ meta.title ?? t("page.docsView.wikiRepos.name.unknow") }}
          <span v-if="shouldAddGap" style="display:inline-block;width:40px;"></span>
        </div>
      </Vue3Marquee>
      <div v-if="!useWindowStore().isMarqueeEnabled" class="title" :style="{ 'viewTransitionName': 'class-item-name-' + address!.join('-') + '-' + id }">
        {{ meta.title ?? t("page.docsView.wikiRepos.name.unknow") }}
      </div>
      <div class="introduction" v-if="introduction">{{
          introduction
        }}
      </div>
      <div class="iconList" v-if="childrenIcon">
        <img
          class="iconMini" :src="icon_value" alt="SVG Image" draggable="false" v-for="([icon_key, icon_value], index) in Object.entries(childrenIcon)" :style="{ viewTransitionName: 'class-item-img-' + address!.join('-') + '-' + id + '-' + icon_key }" :key="icon_key"/>
      </div>
    </div>
  </button>
</template>
<script setup lang="ts">
import {onMounted} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useTextOverflow} from '@/composables/useTextOverflow';
import {useWindowStore} from '@/stores/window';
import {useI18n} from "vue-i18n";
import get from "lodash/get";
import {useDataSourcesStore} from "@/stores/dataSources.ts";
import {useSettingStore} from "@/stores/setting.ts";

const {t} = useI18n();
const route = useRoute()

const data = useDataSourcesStore();

onMounted(() => {
  setTimeout(() => {
    useWindowStore().isMarqueeEnabled = true;
  }, 1000);
});

const {shouldAddGap, onOverflowDetected, onOverflowCleared} = useTextOverflow();

const router = useRouter();

const {id, meta} = defineProps({
  id: String,
  meta: Object,
});
const address = [...route.params.pathMatch as string[]]

const wikiRepo = get(data.wikiRepos, address[0])
const lang = useSettingStore().setting.lang

const imgAddress = [...address];
imgAddress.shift();
imgAddress.unshift('docs', lang);

const icon = get(meta, 'icon');
let imgInfo: any;
if (icon) {
  imgInfo = await wikiRepo.getImage(imgAddress, meta.icon)
}

const introduction = get(meta, 'introduction');
const childrenIcon = get(meta, 'childrenIcon')

function routePush(url: string) {
  router.push(url);
}

if (childrenIcon) {
  for (const [key, value] of Object.entries(childrenIcon)) {
    const iconInfo = await wikiRepo.getImage(imgAddress, value);
    childrenIcon[key] = iconInfo.src;
  }
}

let textBoxWidth = "100%";
if (icon) {
  textBoxWidth = '105px';
}
</script>
<style scoped>
.item {
  width: 200px;
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
  margin-left: 5px;
  margin-right: 20px;
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
  margin-left: 5px;
  user-select: none;
}

</style>
