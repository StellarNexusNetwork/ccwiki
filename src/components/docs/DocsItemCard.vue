<template>
  <button class="item" @click="routePush('/docs/'+address.join('/')+'/'+id)">
    <img v-if="icon && wikiRepo.type =='local'" class="icon" :src="imgInfo.src" alt="SVG Image" draggable="false" :style="{ 'viewTransitionName': 'class-item-img-' + address!.join('-') + '-' + id }">
    <AsyncImage v-if="icon && wikiRepo.type =='httpServer'" class="icon" :src="wikiRepo.makeAddress(imgAddress, icon)" width="45px" height="45px" alt="SVG Image" draggable="false"/>
    <div class="textBox" :style='{width:textBoxWidth}'>
      <Vue3Marquee v-if="useWindowStore().isMarqueeEnabled" :duration="5" :pauseOnHover="true" :animateOnOverflowOnly="true" :clone="true" @onOverflowDetected="onOverflowDetected" @onOverflowCleared="onOverflowCleared">
        <div class="title" :style="{ 'viewTransitionName': 'class-item-name-' + address!.join('-') + '-' + id }">
          {{ meta?.title ?? t("page.docsView.wikiRepos.name.unknow") }}
          <span v-if="shouldAddGap" style="display:inline-block;width:40px;"></span>
        </div>
      </Vue3Marquee>
      <div v-if="!useWindowStore().isMarqueeEnabled" class="title" :style="{ 'viewTransitionName': 'class-item-name-' + address!.join('-') + '-' + id }">
        {{ meta?.title ?? t("page.docsView.wikiRepos.name.unknow") }}
      </div>
      <div class="introduction" v-if="introduction">{{
          introduction
        }}
      </div>
      <div class="iconList" v-if="resolvedChildrenIcon && wikiRepo.type =='local'">
        <img class="iconMini" :src="icon_value as string" alt="SVG Image" draggable="false" v-for="([icon_key, icon_value]) in Object.entries(resolvedChildrenIcon)" :style="{ viewTransitionName: 'class-item-img-' + address!.join('-') + '-' + id + '-' + icon_key }" :key="icon_key"/>
      </div>
      <div class="iconList" v-if="resolvedChildrenIcon && wikiRepo.type =='httpServer'">
        <AsyncImage class="iconMini" :src="icon_value as string" alt="SVG Image" width="15px" height="15px" shape="circle" draggable="false" v-for="[icon_key, icon_value] in Object.entries(resolvedChildrenIcon)" :key="icon_key"/>
      </div>
    </div>
  </button>
</template>
<script setup lang="ts">
import {onMounted, onUnmounted} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useTextOverflow} from '@/composables/useTextOverflow';
import {useWindowStore} from '@/stores/window';
import {useI18n} from "vue-i18n";
import get from "lodash/get";
import {useDataSourcesStore} from "@/stores/dataSources.ts";
import {useSettingStore} from "@/stores/setting.ts";
import AsyncImage from "@/components/common/AsyncImage.vue";

const {t} = useI18n();
const route = useRoute();

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

const lang = useSettingStore().setting.lang
type ImageInfoLike = { src: string; width: number; height: number };
type WikiRepoLike = {
  type: 'local' | 'httpServer';
  getImage: (_url: string[], _src: string) => Promise<ImageInfoLike>;
  makeAddress: (_url: string[], _src: string) => string;
  releaseImage?: (_url: string[], _src: string) => void;
};
const wikiRepo = get(data.wikiRepos, address[0]) as WikiRepoLike;

const imgAddress = [...address];
imgAddress.shift();
imgAddress.unshift('docs', lang);

const localImageRefs: Array<{ url: string[]; src: string }> = [];
// 本地仓库图片加载入口：加载成功后登记引用，供卸载回收
async function loadLocalImage(src: string): Promise<ImageInfoLike> {
  const info = await wikiRepo.getImage(imgAddress, src);
  if (src) {
    // 记录本组件占用的本地图片，卸载时成对释放
    localImageRefs.push({
      url: [...imgAddress],
      src
    });
  }
  return info;
}

onUnmounted(() => {
  if (wikiRepo?.type !== 'local' || !wikiRepo.releaseImage) {
    return;
  }

  // 组件销毁时归还引用，触发仓库级缓存回收
  for (const ref of localImageRefs) {
    wikiRepo.releaseImage(ref.url, ref.src);
  }
});

const icon = get(meta, 'icon');
let imgInfo: ImageInfoLike = {
  src: '/static/icons/not-found.svg',
  width: 256,
  height: 256
};
if (icon && wikiRepo.type == 'local') {
  imgInfo = await loadLocalImage(icon);
}

const introduction = get(meta, 'introduction');
const childrenIcon = get(meta, 'childrenIcon') as Record<string, unknown> | undefined;
let resolvedChildrenIcon: Record<string, string> | undefined;

function routePush(url: string) {
  router.push(url);
}

if (childrenIcon) {
  resolvedChildrenIcon = {};
  if (wikiRepo.type == 'local') {
    for (const [key, value] of Object.entries(childrenIcon)) {
      const iconInfo = await loadLocalImage(String(value));
      resolvedChildrenIcon[key] = iconInfo.src;
    }
  } else if (wikiRepo.type == 'httpServer') {
    for (const [key, value] of Object.entries(childrenIcon)) {
      resolvedChildrenIcon[key] = wikiRepo.makeAddress(imgAddress, String(value));
    }
  }
}

let textBoxWidth = "100%";
// 有主图标时给文本区域预留宽度
if (icon) {
  textBoxWidth = 'calc(100% - 60px)';
}
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
  margin-left: 5px;
  user-select: none;
}

</style>
