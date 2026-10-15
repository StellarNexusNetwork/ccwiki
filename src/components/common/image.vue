<template>
  <div class="body">
    <!--  <a class="isImg" :href="iconInfo.src" :data-pswp-width="iconInfo.width" :data-pswp-height="iconInfo.height" target="_blank">-->
    <!--    <img :src="src" :alt="props.alt" :style="{ 'viewTransitionName':uid }"/>-->
    <!--  </a>-->
    <Skeleton
      v-show="isLoading"
      id="skeleton"
      shape="rectangle"
      class="skeleton"
    />
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      :class="{ loaded: !isLoading }"
      :style="{ 'viewTransitionName':uid }"
      @load="onLoad"
      @error="onError"
    />
  </div>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref} from "vue";
import {useImageManager} from "@/stores/image-manager.ts";
import type {WikiRepoInstance} from "@/adapters/adapter/types.ts";
import {useRoute} from "vue-router";
import {useSettingStore} from "@/stores/setting.ts";

const route = useRoute();
const imageManager = useImageManager();

const props = withDefaults(defineProps<{
  path: string,
  repo: WikiRepoInstance,
  cache?: boolean,
  alt?: string,
}>(), {
  cache: true,
  alt: ""
})

const {path, repo, cache, alt} = props;

const lang = useSettingStore().setting.lang;
const currentPathList = [...route.params.pathMatch as string[]];
currentPathList.shift();
currentPathList.unshift('docs', lang);
const currentPath = currentPathList.join("/");


const repoContext = {
  repo,
  currentPath
}

const src = ref<string>();
const uid = ref<string>();
const isLoading = ref(false);

let cachePath: string, image;

onMounted(async () => {
  try {
    [cachePath, image] = await imageManager.requestImage(path, repoContext, cache);
    src.value = image.src;
    uid.value = image.uid;
    const type = image.type;
  } catch (e) {
    onError();
    console.error(`图片 ${path} 加载失败`, e);
  }
})

onUnmounted(() => {
  imageManager.removeImageRef(cachePath)
})

function onLoad() {
  isLoading.value = false;
}

function onError() {
  src.value = '/static/icons/not-found.svg';
  isLoading.value = false;
}
</script>

<style scoped>
.body {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.skeleton {
  flex-shrink: 0;
}

.body img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
  user-select: none;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.body img.loaded {
  opacity: 1;
}
</style>
