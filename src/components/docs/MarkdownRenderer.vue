<template>
  <div class="mainDiv">
    <div class="subContent">
      <div class="introduction">
        <Image v-if="iconPath" class="img" :path="iconPath" :repo="repo" alt="" :isLightbox="true" draggable="false"/>
      </div>
    </div>
    <div class="mainContent">
      <div class="markdown-body">
        <h1 :style="{ 'viewTransitionName': 'item-name-' + dirPath.replaceAll('/','-') ,'borderBottom':'none'}">
          {{ config?.name ?? t("page.classification.NotFound") }}
        </h1>
      </div>
      <br/>
      <!--      <div class="markdown-body" v-html="renderedMarkdown"></div>-->
      <div class="markdown-body">
        <component :is="vnode"></component>
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
import {computed, nextTick, onMounted, onUnmounted, ref} from "vue";
import MarkdownIt from "markdown-it";
import {tokensToVNode} from "@/utils/tokenToVNode";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import 'photoswipe/style.css';

const {repo, config, dirPath} = defineProps<{
  repo: WikiRepoInstance,
  config: PageConfig,
  dirPath: string,
}>()

const {t} = useI18n();
let lightbox: PhotoSwipeLightbox | null = null;

const iconPath = get(config, "icon");

// MarkdownIt 实例
const md = new MarkdownIt({html: true});
const source = ref('');

function isPhonePortrait() {
  return window.matchMedia('(max-width: 670px) and (orientation: portrait)').matches;
}

onMounted(async () => {
  let text: string;
  try {
    const mdFile = await repo.getFileByPath(dirPath, "./index.md");
    text = mdFile instanceof File
      ? await mdFile.text()
      : mdFile;
  } catch (err) {
    console.error(err);
    return;
  }

// todo 屏蔽<script>等标签
// md.use(sanitizer);

  source.value = text;

  // 处理格式 替换所有 [[path]] 为 ![path](path)
  source.value = source.value.replace(/!\[\[([^\]]+)\]\]/g, '![$1](<$1>)');
  console.log(md.parse(source.value, {}));

  // 等待 Markdown 对应的 Vue 组件完成渲染
  await nextTick();

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
})

onUnmounted(() => {
  if (lightbox) {
    // 销毁实例，避免路由切换后残留事件监听
    lightbox.destroy();
    lightbox = null;
  }
});

const vnode = computed(() => {
  return tokensToVNode(md.parse(source.value, {}), {
    repo: repo,
    currentPath: dirPath
  })
})
</script>

<style scoped>
@media (min-width: 670px) {
  .subContent {
    padding-left: 30px;
    margin-left: auto;
  }
}

@media (max-width: 670px) {
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
