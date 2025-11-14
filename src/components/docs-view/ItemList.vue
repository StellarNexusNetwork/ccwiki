<template>
  <div class="mainDiv">
    <div class="titleDiv">
      <div class="title" :style="{ 'viewTransitionName': 'class-itemList-title-'+address.join('-'),'borderBottom':'none'}">
        {{ meta.title ?? t("page.docsView.wikiRepos.name.unknow") }}
      </div>
    </div>
    <div v-if="meta.introduction" class="introduction">
      {{ meta.introduction }}
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
  padding-bottom: 20px;
  width: 95%;
  min-width: calc(100% - 80px);
  padding-top: 15px;
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

.introduction {
  padding: 15px;
  margin-top: 10px;
  margin-bottom: 10px;
  border-radius: 10px;
  background: var(--color-background-2);
  color: var(--color-text-body-subtle);
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
