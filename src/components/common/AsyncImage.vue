<template>
  <div class="body">
    <Skeleton id='skeleton' :width="width" :height="height" :shape="shape" :style="skeletonDisplay"></Skeleton>
    <img :alt="alt" :src="src" @load="onLoad" onerror="this.src='/public/svg/not_found.svg'" :style="imgStyle"/>
    <!--todo：懒加载-->
  </div>
</template>
<script setup lang="ts">
import {ref} from "vue";

const {src, alt = "img", width, height, shape = 'rectangle'} = defineProps<{
  src: string,
  alt?: string,
  width: string,
  height: string,
  shape?: string
}>()

const imgStyle = ref({
  display: 'none',
  opacity: 0
});
const skeletonDisplay = ref({
  display: 'block'
})

function onLoad() {
  skeletonDisplay.value.display = 'none';
  imgStyle.value.display = 'block';
  setTimeout(() => {
    imgStyle.value.opacity = 1;
  }, 100)
}

</script>

<style scoped>
.body {
  display: flex;
  justify-content: center;
  align-items: center;
}

.body img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
  user-select: none;
  transition: opacity 0.5s ease-in-out;
}
</style>
