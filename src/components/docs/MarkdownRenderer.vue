<template>
  <div class="mainDiv">
    <div class="subContent">
      <div class="introduction">
        <Image v-if="iconPath" class="img" :path="iconPath" :repo="repo" alt="" draggable="false"/>
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
import type {PageConfig} from "@/adapters/adapter/types/page-config.ts";
import type {WikiRepoInstance} from "@/adapters/adapter/types.ts";

import {useI18n} from "vue-i18n";
import {useRoute} from "vue-router";
import {useDataSourcesStore3} from "@/stores/dataSources3.ts";
import get from "lodash/get";
import Image from "@/components/common/image.vue";
import {onMounted, ref} from "vue";
import MarkdownIt from "markdown-it";

const {repo, config, dirPath} = defineProps<{
  repo: WikiRepoInstance,
  config: PageConfig,
  dirPath: string,
}>()

const {t} = useI18n();
const route = useRoute();
const data = useDataSourcesStore3();

const iconPath = get(config, "icon");

onMounted(async () => {
  let text: string;
  try {
    const mdFile = await repo.getFileByPath(dirPath, "./index.md");
    text = await mdFile.text();
  } catch (err) {
    console.error(err);
    return;
  }

  // MarkdownIt 实例
  const md = new MarkdownIt({html: true});
  const source = ref('')

// todo 屏蔽<script>等标签
// md.use(sanitizer);

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

    // const newMarkdown = `![${alt}](${imgURL})`;
    const newMarkdown =
      '<Image src="' + img.src + '" alt="' + alt + '" draggable="false">\n';

    return {
      old: fullMatch,
      new: newMarkdown
    };
  }));

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
