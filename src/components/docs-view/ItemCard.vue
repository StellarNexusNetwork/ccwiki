<template>
  <button class="item" @click="routePush('/docs/'+rid0+'/'+category+'/'+subcategory+'/'+id)">
    <img class="icon" :src="item.iconSrc" alt="SVG Image" draggable="false" :style="{ 'viewTransitionName': 'class-item-img-' + category + '-' + subcategory + '-' + id }">
    <div class="textBox">
      <Vue3Marquee v-if="useWindowStore().isMarqueeEnabled" :duration="5" :pauseOnHover="true" :animateOnOverflowOnly="true" :clone="true" @onOverflowDetected="onOverflowDetected" @onOverflowCleared="onOverflowCleared">
        <div class="title" :style="{ 'viewTransitionName': 'class-item-name-' + category + '-' + subcategory + '-' + id }">
          {{ item.name }}
          <span v-if="shouldAddGap" style="display:inline-block;width:40px;"></span>
        </div>
      </Vue3Marquee>
      <div v-if="!useWindowStore().isMarqueeEnabled" class="title" :style="{ 'viewTransitionName': 'class-item-name-' + category + '-' + subcategory + '-' + id }">
        {{ item.name }}
      </div>
      <div class="introduction"></div>
    </div>
  </button>
</template>
<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import {useRouter} from 'vue-router';
import {useDataSourcesStore} from '@/stores/dataSources';
import {useSettingStore} from '@/stores/setting';
import {useTextOverflow} from '@/composables/useTextOverflow';
import {useWindowStore} from '@/stores/window';

onMounted(() => {
  setTimeout(() => {
    useWindowStore().isMarqueeEnabled = true;
  }, 1000);
});

const {shouldAddGap, onOverflowDetected, onOverflowCleared} = useTextOverflow();

const router = useRouter();

const {
  rid,
  category,
  subcategory,
  id,
  data
} = defineProps(['rid', 'category', 'subcategory', 'id', 'data']);

const rid0 = ref();
if (/^\d+$/.test(rid)) {
  rid0.value = Number(rid);
} else {
  useRouter().push('/404');
}

const routes = computed(() => useDataSourcesStore().routeGroups);

const item = await useDataSourcesStore().getOrCacheItem([Object.keys(routes.value)[rid0.value], 'docs', useSettingStore().setting.lang, category, subcategory, id], ['icon_png']);

function routePush(url: string) {
  router.push(url);
}
</script>
<style scoped>
.item {
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
  width: 110px;
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
