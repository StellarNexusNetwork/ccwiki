<template>
  <div class="Div">
    <div class="mainDiv">
      <suspense>
        <template #default>
          <MarkdownRenderer :key="routeParams"/>
        </template>
      </suspense>
    </div>
  </div>
</template>
<script setup lang="ts">
import MarkdownRenderer from '@/views/DocsView/components/MarkdownRenderer.vue';
import {ref, watch} from 'vue';
import {useRoute} from 'vue-router';

const route = useRoute();
const routeParams = ref('');
watch(() => [route.params.rid, route.params.category, route.params.subcategory, route.params.id], ([newRid, newCategory, newSubcategory, newId]) => {
  routeParams.value = String(newRid) + String(newCategory) + String(newSubcategory) + String(newId);
});
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
