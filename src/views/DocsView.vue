<template>
  <div>
    <Suspense>
      <template #default>
        <DocsView/>
      </template>
      <template #fallback>
        加载中……
      </template>
    </Suspense>
  </div>
</template>
<script setup lang="ts">
import DocsView from '@/components/docs-view/Index.vue';
</script>
<style scoped>
</style>
