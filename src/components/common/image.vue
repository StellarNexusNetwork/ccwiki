<template>
  <div class="body">
    <Skeleton
      v-show="isLoading"
      id="skeleton"
      :shape="shape"
      style="height: 100%;"
    />
    <a class="isImg" v-if="src && isLightbox" :href="src" target="_blank">
      <img
        :src="src"
        :alt="alt"
        :class="{ loaded: !isLoading ,img:true}"
        :style="[imgStyle, { viewTransitionName: uid }]"
        @load="onLoad"
        @error="onError"
      />
    </a>
    <img
      v-if="src && !isLightbox"
      :src="src"
      :alt="alt"
      :class="{ loaded: !isLoading }"
      :style="[imgStyle, { viewTransitionName: uid }]"
      @load="onLoad"
      @error="onError"
    />
  </div>
</template>

<script setup lang="ts">
import {type CSSProperties, onMounted, onUnmounted, ref} from "vue";

import type {ResolvedImage, WikiRepoInstance,} from "@/adapters/adapter/types.ts";

import {useImageManager} from "@/stores/image-manager.ts";
import {useRoute} from "vue-router";
import {useSettingStore} from "@/stores/setting.ts";

const route = useRoute();
const imageManager = useImageManager();

const props = withDefaults(defineProps<{
  path: string,
  repo: WikiRepoInstance,
  cache?: boolean,
  alt?: string,
  shape?: string,
  isLightbox?: boolean,
  imgStyle?: CSSProperties
}>(), {
  cache: true,
  alt: "",
  shape: "rectangle",
  isLightbox: false,
  imgStyle: () => ({})
})

const {path, repo, cache, alt, imgStyle} = props;

let cachePath: string | undefined;
let image: ResolvedImage | undefined;
let active = true;

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

if (repo.type !== 'local' || !/^(?:blob:|data:image\/)/i.test(path)) {
  isLoading.value = true
}

// 释放当前请求所持有的资源
function releaseImage(
  id?: string,
  resolved?: ResolvedImage,
) {
  if (cache) {
    if (id) {
      imageManager.removeImageRef(id);
    }
    return;
  }

  // 未缓存的本地图片由当前组件独立持有
  if (resolved?.type === "local" && resolved.src.startsWith("blob:")) {
    URL.revokeObjectURL(resolved.src);
  }
}

onMounted(async () => {
  try {
    const [id, resolved] = await imageManager.requestImage(
      path,
      repoContext,
      cache,
    );

    // 组件可能已在请求完成前卸载
    if (!active) {
      releaseImage(id, resolved);
      return;
    }

    cachePath = id;
    image = resolved;

    src.value = resolved.src;
    uid.value = resolved.uid;
  } catch (e) {
    if (active) {
      onError();
    }

    console.error(`图片 ${path} 加载失败`, e);
  }
})

onUnmounted(() => {
  active = false;
  releaseImage(cachePath, image);
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
  justify-content: flex-start;
  align-items: center;
  container-type: inline-size;
}

.p-skeleton {
  flex-shrink: 0;
  max-width: 500px;
  min-height: 25cqw;
}

.body .isImg {
  width: 100%;
}

.body img {
  inset: 0;
  width: 100%;
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
