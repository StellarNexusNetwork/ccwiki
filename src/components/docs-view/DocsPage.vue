<template>
  <div class="Div">
    <div class="mainDiv">
      <suspense>
        <template #default>
          <MarkdownRenderer :config="config"/>
        </template>
      </suspense>
    </div>
  </div>
</template>
<script setup lang="ts">
import MarkdownRenderer from './MarkdownRenderer.vue';

const {config} = defineProps({
  config: Object,
})
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
