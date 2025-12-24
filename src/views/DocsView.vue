<template>
  <div>
    <Suspense>
      <template #default>
        <IndexView/>
      </template>
      <!--      <template #fallback>-->
      <!--        加载中……-->
      <!--      </template>-->
    </Suspense>
  </div>
</template>
<script setup lang="ts">
import IndexView from '@/components/docs-view/IndexView.vue';
</script>
<style scoped>
</style>
