<template>
  <div>
    <ul>
      <li class="localRepositories" v-for="(item, index) in useDataSourcesStore().localRepositoriesDisplay" :key="item.ulid" @click="routePush('/classification/' + index)">
        <img :src="item.iconURL" alt="SVG Image" draggable="false">
        <div class="textDiv">
          <Vue3Marquee v-if="useWindowStore().isMarqueeEnabled" :duration="5" :pauseOnHover="true" :animateOnOverflowOnly="true" :clone="true" @onOverflowDetected="onOverflowDetected" @onOverflowCleared="onOverflowCleared">
            <div class="name">{{ item.name }}</div>
          </Vue3Marquee>
          <div v-if="!useWindowStore().isMarqueeEnabled" class="name">{{ item.name }}</div>
          <div class="version">{{ item.version }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import {useDataSourcesStore} from "@/stores/dataSources";
import {useRouter} from "vue-router";
import {useWindowStore} from "@/stores/window";
import {onMounted} from "vue";
import {useTextOverflow} from "@/composables/useTextOverflow";

onMounted(() => {
  setTimeout(() => {
    useWindowStore().isMarqueeEnabled = true;
  }, 1000);
});

const {shouldAddGap, onOverflowDetected, onOverflowCleared} = useTextOverflow();


const router = useRouter();

function routePush(url: string) {
  router.push(url);
}
</script>

<style scoped>
ul {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 20px;
  padding: 25px;
}

.localRepositories {
  width: 200px;
  height: 90px;
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 10px;
  background: var(--color-background-2);
  border: 1px solid rgba(0, 0, 0, 0);
  transition-duration: 0.3s;
}

.localRepositories:hover {
  border: 1px solid var(--color-border-3);
  transition-duration: 0.3s;
}

.localRepositories img {
  width: 45px;
  height: 45px;
  object-fit: contain;
  image-rendering: pixelated;
  margin-left: 5px;
  margin-right: 20px;
  user-select: none;
}

.localRepositories .textDiv {
  display: block;
  width: 110px;
}

.localRepositories .textDiv .name {
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

.localRepositories .textDiv .version {
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
</style>