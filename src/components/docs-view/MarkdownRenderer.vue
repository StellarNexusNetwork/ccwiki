<template>
  <div class="mainDiv">
    <div class="subContent">
      <div class="introduction">
        <a class="isImg" :href="iconInfo.src" :data-pswp-width="iconInfo.width" :data-pswp-height="iconInfo.height" target="_blank">
          <img class="img" :src="iconInfo.src" alt="" width="auto" height="30" draggable="false" :style="{ 'viewTransitionName': 'class-item-img-' + address.join('-') }">
        </a>
      </div>
    </div>
    <div class="mainContent">
      <div class="markdown-body">
        <h1 :style="{ 'viewTransitionName': 'class-item-name-' + address.join('-') ,'borderBottom':'none'}">
          {{ config?.name ?? t("page.classification.NotFound") }}
        </h1>
      </div>
      <br/>
      <div class="markdown-body" v-html="renderedMarkdown"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, ref} from 'vue';
import {useRoute} from 'vue-router';
import {useI18n} from 'vue-i18n';
import get from 'lodash/get';
import MarkdownIt from 'markdown-it';
import {useSettingStore} from '@/stores/setting';
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';
import {useDataSourcesStore} from "@/stores/dataSources";

const {config} = defineProps({
  config: Object,
})

const {t} = useI18n();
const route = useRoute()

const data = useDataSourcesStore();

const address = [...route.params.pathMatch as string[]]

const lang = useSettingStore().setting.lang
type ImageInfoLike = { src: string; width: number; height: number };
type WikiRepoLike = {
  type: 'local' | 'httpServer';
  getImage: (_url: string[], _src: string) => Promise<ImageInfoLike>;
  makeAddress: (_url: string[], _src: string) => string;
  getFile: (_path: string[]) => Promise<FileSystemFileHandle | string | null>;
  releaseImage?: (_url: string[], _src: string) => void;
};
const wikiRepo = get(data.wikiRepos, address[0]) as WikiRepoLike;

const imgAddress = [...address];
imgAddress.shift();
imgAddress.unshift('docs', lang);

const localImageRefs: Array<{ url: string[]; src: string }> = [];
// 本地图片统一加载器：负责登记引用，便于页面卸载时释放
async function loadLocalImage(src: string): Promise<ImageInfoLike> {
  const info = await wikiRepo.getImage(imgAddress, src);
  if (src) {
    // 记录本页面持有的本地图片，离开页面时统一释放
    localImageRefs.push({
      url: [...imgAddress],
      src
    });
  }
  return info;
}

const iconPath = typeof config?.icon === 'string' ? config.icon : '';
const iconInfo = wikiRepo.type == 'local'
  ? await loadLocalImage(iconPath)
  : await wikiRepo.getImage(imgAddress, iconPath);

let text: string | undefined;
if (wikiRepo.type == 'local') {
  const localFileHandle = await wikiRepo.getFile(wikiRepo.makeAddress(imgAddress, './index.md').split('/'));
  if (localFileHandle && typeof localFileHandle !== 'string') {
    const file = await localFileHandle.getFile();
    text = await file.text();
  }
} else if (wikiRepo.type == 'httpServer') {
  const indexAddress = [...imgAddress];
  indexAddress.push('./index.md');
  const remoteText = await wikiRepo.getFile(indexAddress);
  if (typeof remoteText === 'string') {
    text = remoteText;
  }
}
// MarkdownIt 实例
const md = new MarkdownIt({html: true});
const source = ref('')

// todo 屏蔽<script>等标签
// md.use(sanitizer);

if (text) {
  source.value = text;

  // 处理格式 替换所有 [[path]] 为 ![path](path)
  source.value = source.value.replace(/!\[\[([^\]]+)\]\]/g, '![$1]($1)');

  // 匹配所有 markdown 图片语法
  const regex = /!\[(.*?)\]\((.*?)\)/g;
  const matches = [...source.value.matchAll(regex)];
  // 单篇 markdown 内图片结果缓存，避免重复解析同一路径
  const markdownImageCache = new Map<string, Promise<ImageInfoLike>>();

  // 解析 markdown 图片路径并返回可展示图片信息（支持远程/本地）
  const resolveMarkdownImage = async (rawPath: string) => {
    const cached = markdownImageCache.get(rawPath);
    if (cached) {
      // 同一 markdown 内重复图片直接复用结果
      return await cached;
    }

    const task = (async () => {
      if (rawPath.startsWith('http://') || rawPath.startsWith('https://') || rawPath.startsWith('data:') || rawPath.startsWith('blob:')) {
        return await data.getImageInfo(rawPath);
      }

      let normalizedPath = rawPath;
      if (!normalizedPath.startsWith('/') && !normalizedPath.startsWith('./')) {
        normalizedPath = './' + normalizedPath;
      }

      if (wikiRepo.type == 'local') {
        return await loadLocalImage(normalizedPath);
      }
      return await wikiRepo.getImage(imgAddress, normalizedPath);
    })();

    markdownImageCache.set(rawPath, task);
    return await task;
  };

  const replacements = await Promise.all(matches.map(async match => {
    const fullMatch = match[0]; // 整个 ![alt](path)
    const alt = match[1];       // alt 文本
    const path = match[2];   // 括号内路径
    const img = await resolveMarkdownImage(path);

    // const newMarkdown = `![${alt}](${imgURL})`;
    const newMarkdown = '<a class="isImg" href="' + img.src + '" data-pswp-width="' + img.width + '" data-pswp-height="' + img.height + '" target="_blank">\n' +
      '<img src="' + img.src + '" alt="' + alt + '" draggable="false">\n' +
      '</a>';

    return {
      old: fullMatch,
      new: newMarkdown
    };
  }));

  // 替换所有 old -> new
  for (const {old, new: newVal} of replacements) {
    source.value = source.value.replace(old, newVal);
  }
}


// 渲染后的 HTML
const renderedMarkdown = computed(() => {
  return md.render(typeof source.value === 'string' ? source.value : '');
});

function isPhonePortrait() {
  return window.matchMedia('(max-width: 670px) and (orientation: portrait)').matches;
}

let lightbox: PhotoSwipeLightbox | null = null;
onMounted(async () => {
  await nextTick();        // 等 v‑dom 真插入
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
        return zoomLevelObject.fit;
      } else {
        return 1;
      }
    },

    maxZoomLevel: 5,

    imageClickAction: 'close',
    tapAction: 'close',
    // tap delay is removed if set to false
    doubleTapAction: false,

    pswpModule: () => import('photoswipe')
  });
  lightbox.init();
});

onUnmounted(() => {
  if (wikiRepo?.type === 'local' && wikiRepo.releaseImage) {
    // 归还本页面引用，避免 blob URL 长时间堆积
    for (const ref of localImageRefs) {
      wikiRepo.releaseImage(ref.url, ref.src);
    }
  }

  if (lightbox) {
    // 销毁实例，避免路由切换后残留事件监听
    lightbox.destroy();
    lightbox = null;
  }
});
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
