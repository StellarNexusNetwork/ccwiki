<template>
  <div>
    <Suspense>
      <template #default>
        <DocsIndexView/>
      </template>
      <!--      <template #fallback>-->
      <!--        加载中……-->
      <!--      </template>-->
    </Suspense>
  </div>
</template>
<script setup lang="ts">
import DocsIndexView from '@/components/docs/DocsIndexView.vue';
</script>
<style scoped>
</style>
