<template>
  <div class="Div">
    <div class="mainDiv">
      <div class="subContent">
        <div class="introduction">
          <Image v-if="iconPath" class="img" :path="iconPath" :repo="wikiRepo" alt="" :isLightbox="true" draggable="false"/>
        </div>
      </div>
      <div class="mainContent">
        <div class="markdown-body">
          <h1 :style="{ 'viewTransitionName': titleVTName(dirPath.replaceAll('/','-'), config?.name) ,'borderBottom':'none'}">
            {{ config?.name ?? t("page.classification.NotFound") }}
          </h1>
        </div>
        <br/>
        <div class="markdown-body">
          <MarkdownContent/>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type {PageConfig} from "@/adapters/adapter/types/page-config.ts";
import type {WikiRepoInstance} from "@/adapters/adapter/types.ts";

import {useI18n} from "vue-i18n";
import get from "lodash/get";
import Image from "@/components/common/image.vue";
import {computed, onMounted, onUnmounted, ref} from "vue";
import MarkdownIt from "markdown-it";
import {tokensToVNode} from "@/utils/tokenToVNode";
import {titleVTName} from "@/utils/viewTransition.ts";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import 'photoswipe/style.css';

const {wikiRepo, config, dirPath} = defineProps<{
  wikiRepo: WikiRepoInstance,
  config: PageConfig,
  dirPath: string,
}>()

const {t} = useI18n();
let lightbox: PhotoSwipeLightbox | null = null;

const iconPath = get(config, "icon");

// MarkdownIt 实例
const md = new MarkdownIt({html: true});
const source = ref('');

// 只缓存解析结果，VNode 每次渲染时重新构建，避免缓存 VNode
const tokens = computed(() => md.parse(source.value, {}));

const MarkdownContent = () =>
  tokensToVNode(tokens.value, {repo: wikiRepo, currentPath: dirPath});

function isPhonePortrait() {
  return window.matchMedia('(max-width: 670px) and (orientation: portrait)').matches;
}

let isUnmounted = false;

// 初始化图片灯箱：使用事件委托，不依赖正文是否渲染完成
function initLightbox() {
  lightbox = new PhotoSwipeLightbox({
    gallery: '.mainDiv',
    children: 'a.isImg',

    initialZoomLevel: (zoomLevelObject) => {
      if (isPhonePortrait()) {
        return zoomLevelObject.vFill;
      } else {
        return zoomLevelObject.fit;
      }
    },

    secondaryZoomLevel: (zoomLevelObject) => {
      if (isPhonePortrait()) {
        return zoomLevelObject.fit * 0.25;
      } else {
        return 0.25;
      }
    },

    maxZoomLevel: 15,

    imageClickAction: 'close',
    tapAction: 'close',
    // tap delay is removed if set to false
    doubleTapAction: false,
    wheelToZoom: true,

    pswpModule: () => import('photoswipe')
  });

  // 缺少尺寸标注时，尝试读取图片的实际宽高
  lightbox.addFilter('domItemData', (itemData, element, linkEl) => {
    const anchor =
      linkEl ??
      (element instanceof HTMLAnchorElement ? element : null);

    const img = anchor?.querySelector('img');

    const originalWidth =
      Number(anchor?.dataset.pswpWidth) ||
      img?.naturalWidth ||
      itemData.width;

    const originalHeight =
      Number(anchor?.dataset.pswpHeight) ||
      img?.naturalHeight ||
      itemData.height;

    if (
      !originalWidth ||
      !originalHeight ||
      originalWidth <= 0 ||
      originalHeight <= 0
    ) {
      return itemData;
    }

    // 目标尺寸：原图最大边长至少为 256px
    const minScale = Math.max(
      1,
      256 / Math.max(originalWidth, originalHeight)
    );

    // 预览尺寸不得超过窗口宽度的 90%、高度的 95%
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.95;

    // 按统一比例缩放，避免图片变形
    const scale = Math.min(
      minScale,
      maxWidth / originalWidth,
      maxHeight / originalHeight
    );

    return {
      ...itemData,
      width: Math.max(1, Math.round(originalWidth * scale)),
      height: Math.max(1, Math.round(originalHeight * scale))
    };
  });

  lightbox.init();
}

onMounted(async () => {
  // 先初始化灯箱，再加载正文，互不阻塞
  initLightbox();

  let text: string;
  try {
    const mdFile = await wikiRepo.getFileByPath(dirPath, "./index.md");
    text = mdFile instanceof File
      ? await mdFile.text()
      : mdFile;
  } catch (err) {
    console.error(err);
    return;
  }

  // 加载期间 组件可能已被卸载，避免继续写入
  if (isUnmounted) return;

  // todo 屏蔽<script>等标签
  // md.use(sanitizer);

  // 处理格式 替换所有 [[path]] 为 ![path](path)，只赋值一次
  source.value = text.replace(/!\[\[([^\]]+)]]/g, '![$1](<$1>)');
});

onUnmounted(() => {
  isUnmounted = true;
  if (lightbox) {
    // 销毁实例，避免路由切换后残留事件监听
    lightbox.destroy();
    lightbox = null;
  }
});
</script>

<style scoped>
.Div {
  display: flex;
}

@media (min-width: 670px) {
  .Div .mainDiv {
    padding: 35px;
    flex-direction: row-reverse;
    justify-content: flex-end;
  }

  .subContent {
    padding-left: 30px;
    margin-left: auto;
  }
}

@media (max-width: 670px) {
  .Div .mainDiv {
    padding: 20px;
    flex-direction: column;
    align-items: center;
  }

  .markdown-body {
    display: block;
    max-width: calc(100vw - 45px);
  }

  .subContent {
    padding-top: 30px;
    padding-bottom: 30px;
  }
}

.mainDiv {
  display: flex;
  width: 100%;
  padding-top: 10px;
}

.subContent {
  margin-top: 10px;
}

.subContent .introduction {
  width: 100%;
  padding: 15px;
  border-radius: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 0.8px solid var(--color-border-2);
}

.subContent .introduction .img {
  width: 225px;
  height: 225px;
  object-fit: contain;
  image-rendering: pixelated;
  user-select: none;
}
</style>
