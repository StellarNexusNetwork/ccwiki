<template>
  <button class="item" @click="routePush('/docs/'+category+'/'+subcategory+'/'+id)">
    <img class="icon" :src="item.iconSrc" alt="SVG Image" draggable="false" :style="{ 'viewTransitionName': 'class-item-img-' + category + '-' + subcategory + '-' + id }">
    <div class="textBox">
      <div class="title" :style="{ 'viewTransitionName': 'class-item-name-' + category + '-' + subcategory + '-' + id }">
        {{ item.name }}
      </div>
      <div class="introduction"></div>
    </div>
  </button>
</template>
<script setup lang="ts">
import {computed} from "vue";
import {useRouter} from 'vue-router';
import {useDataSourcesStore} from "../../stores/dataSources";
import {useSettingStore} from "../../stores/setting";

const router = useRouter();

const {category, subcategory, id, data} = defineProps(['category', 'subcategory', 'id', 'data'])

const routes = computed(() => useDataSourcesStore().routeGroups)

let item = await useDataSourcesStore().getOrCacheItem([Object.keys(routes.value)[0], 'docs', useSettingStore().setting.lang, category, subcategory, id])

function routePush(url: string) {
  router.push(url)
}
</script>
<style scoped>
.item {
  width: 205px;
  height: 90px;
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 10px;
  background: var(--color-background-2);
  border: 1px solid rgba(0, 0, 0, 0);
  transition-duration: 0.3s;
}

.item:hover {
  border: 1px solid var(--color-border-3);
  transition-duration: 0.3s;
}

.icon {
  width: 45px;
  height: 45px;
  object-fit: contain;
  image-rendering: pixelated;
  margin-left: 5px;
  margin-right: 20px;
  user-select: none;
}

.item .textBox {
  display: block;
  width: 115px;
}

.item .textBox .title {
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

.item .textBox .introduction {
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