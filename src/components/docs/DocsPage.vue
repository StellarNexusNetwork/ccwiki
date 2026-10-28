<template>
  <div class="Div">
    <div class="mainDiv">
      <suspense>
        <template #default>
          <MarkdownRenderer :repo="wikiRepo" :config="config" :dirPath="dirPath"/>
        </template>
      </suspense>
    </div>
  </div>
</template>
<script setup lang="ts">
import MarkdownRenderer from './MarkdownRenderer.vue';
import type {WikiRepoInstance} from "@/adapters/adapter/types.ts";
import type {PageConfig} from "@/adapters/adapter/types/page-config.ts";


const {wikiRepo, config, dirPath} = defineProps<{
  wikiRepo: WikiRepoInstance,
  config: PageConfig,
  dirPath: string,
}>()
</script>
<style scoped>
.Div {
  display: flex;
}

@media (min-width: 670px) {
  .Div .mainDiv {
    padding: 20px;
    flex-direction: row-reverse;
    justify-content: flex-end;
  }
}

@media (max-width: 670px) {
  .Div .mainDiv {
    padding: 15px;
    flex-direction: column;
    align-items: center;
  }
}

.Div .mainDiv {
  display: flex;
  width: 100%;
}
</style>
