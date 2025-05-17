<template>
  <div class="Div">
    <div class="mainDiv">
      <suspense>
        <template #default>
          <MarkdownRenderer/>
        </template>
      </suspense>
    </div>
  </div>
</template>
<script setup lang="ts">
import MarkdownRenderer from "@/views/docs/MarkdownRenderer.vue";
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