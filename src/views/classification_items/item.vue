<template>
  <button class="item" @click="routePush('/docs/'+category+'/'+subcategory+'/'+id)">
    <img class="icon" :src="item.iconSrc" alt="SVG Image" draggable="false">
    <div class="textBox">
      <div class="title">{{ item.name }}</div>
      <div class="introduction"></div>
    </div>
  </button>
</template>
<script setup lang="ts">
import {ref} from "vue";
import get from "lodash/get";
import {useRouter} from 'vue-router';

const router = useRouter();

const {category, subcategory, id, data} = defineProps(['category', 'subcategory', 'id', 'data'])

let item = ref({"name": "未知", "iconSrc": "/static/public/svg/Test.svg"})

const iconHandle = get(data, 'icon_png') as any
if (iconHandle !== undefined) {
  item.value.iconSrc = URL.createObjectURL(await iconHandle.getFile())
}
const configHandle = get(data, 'config_json') as any
if (configHandle !== undefined) {
  const configData = await configHandle.getFile()
  const jsonText = await configData.text()
  const jsonData = JSON.parse(jsonText)
  const itemName = get(jsonData, "name")
  if (itemName !== undefined) {
    item.value.name = itemName
  }
}

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