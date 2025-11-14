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
          {{ config.name ?? t("page.classification.NotFound") }}
        </h1>
      </div>
      <br/>
      <div class="markdown-body" v-html="renderedMarkdown"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {computed, nextTick, onMounted, ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
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

const router = useRouter();
const address = [...route.params.pathMatch as string[]]

const wikiRepo = get(data.wikiRepos, address[0])
const lang = useSettingStore().setting.lang

const imgAddress = [...address];
imgAddress.shift();
imgAddress.unshift('docs', lang);

const iconInfo = await wikiRepo.getImage(imgAddress, config.icon ?? '')

const handle = await wikiRepo.getFile(wikiRepo.makeAddress(imgAddress, './index.md').split('/'));

// MarkdownIt 实例
const md = new MarkdownIt({html: true});
const source = ref('')

// todo 屏蔽<script>等标签
// md.use(sanitizer);


if (handle) {
  const file = await handle.getFile();
  const text = await file.text();

  source.value = text;

  // 处理格式 替换所有 [[path]] 为 ![path](path)
  source.value = source.value.replace(/!\[\[([^\]]+)\]\]/g, '![$1]($1)');

  // 匹配所有 markdown 图片语法
  const regex = /!\[(.*?)\]\((.*?)\)/g;
  const matches = [...source.value.matchAll(regex)];

  const replacements = await Promise.all(matches.map(async match => {
    const fullMatch = match[0]; // 整个 ![alt](path)
    const alt = match[1];       // alt 文本
    let path = match[2];   // 括号内路径
    let img;

    // 获取图片路径
    if (path.startsWith('http://') || path.startsWith('https://')) {
      img = {
        'src': path,
        'width': 'auto',
        'height': 'auto'
      }
    } else {
      if (!path.startsWith('/') && !path.startsWith('./')) {
        path = './' + path;
      }
      img = await wikiRepo.getImage(imgAddress, path);
    }

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

let lightbox;
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
