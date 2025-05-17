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
import MarkdownRenderer from "./MarkdownRenderer.vue";
import {ref, watch} from "vue";
import {useRoute} from "vue-router";

const route = useRoute()
let routeParams = ref('')
watch(
    () => [route.params.category, route.params.subcategory, route.params.id],
    ([newCategory, newSubcategory, newId]) => {
      routeParams.value = String(newCategory) + String(newSubcategory) + String(newId)
    }
)
</script>
<style scoped>
.Div {
  display: flex;
}

@media (min-width: 670px) {
  .Div .mainDiv {
    padding: 30px;
    flex-direction: row-reverse;
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
  width: 100vw;
  overflow-y: auto;
}
</style>