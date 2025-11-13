<template>
  <div class="mainDiv">
    <div class="titleDiv">
      <div class="title" :style="{ 'viewTransitionName': 'class-itemList-title-'+address.join('-'),'borderBottom':'none'}">
        {{ meta.title ?? t("page.docsView.wikiRepos.name.unknow") }}
      </div>
    </div>
    <div class="AboutList">
      <suspense v-for="([id, meta], index) in Object.entries(meta.children ?? {})" :key="id">
        <template #default>
          <ItemCard :id="id" :meta="meta"/>
        </template>
      </suspense>
    </div>
  </div>
</template>

<script setup lang="ts">
import ItemCard from './ItemCard.vue';
import {useI18n} from 'vue-i18n';
import {useRoute} from "vue-router";

const {t} = useI18n();
const route = useRoute()

const {meta} = defineProps({
  meta: Object,
})

const address = route.params.pathMatch as string[];
</script>

<style scoped>
.mainDiv {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 20px;
  width: 95%;
  margin-top: 25px;
  margin-bottom: 25px;
  margin-right: auto;
  margin-left: auto;
}

.titleDiv {
  width: 100%;
}

.mainDiv .title {
  max-width: 90vw;
  overflow: hidden;
  white-space: pre-line;
  font-family: MiSans-B;
  font-size: 25px;
  margin-bottom: 5px;
  color: var(--color-text-title);
  transition-duration: 0.3s;
}


.mainDiv .AboutList {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 20px;
  margin-top: 10px;
  padding-bottom: 40px;
}
</style>
