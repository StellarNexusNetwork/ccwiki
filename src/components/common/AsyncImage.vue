<template>
  <div class="body">
    <Skeleton
      v-show="isLoading"
      id="skeleton"
      :width="props.width"
      :height="props.height"
      :shape="props.shape"
      class="skeleton"
    />
    <img
      :alt="props.alt"
      :src="currentSrc"
      :class="{ loaded: !isLoading }"
      @load="onLoad"
      @error="onError"
    />
    <!--todo：懒加载-->
  </div>
</template>
<script setup lang="ts">
import {ref, watch} from 'vue';

const props = withDefaults(
  defineProps<{
    src: string;
    alt?: string;
    width: string;
    height: string;
    shape?: string;
  }>(),
  {
    alt: 'img',
    shape: 'rectangle'
  }
);

const isLoading = ref(true);
const currentSrc = ref(props.src);
const hasFallbackTried = ref(false);

function resetLoading(nextSrc: string) {
  currentSrc.value = nextSrc;
  hasFallbackTried.value = false;
  isLoading.value = true;
}

watch(
  () => props.src,
  (nextSrc) => {
    resetLoading(nextSrc);
  },
  {immediate: true}
);

function onLoad() {
  isLoading.value = false;
}

function onError() {
  if (!hasFallbackTried.value) {
    hasFallbackTried.value = true;
    isLoading.value = true;
    currentSrc.value = '/static/icons/not-found.svg';
    return;
  }
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
