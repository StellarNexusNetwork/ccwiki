<template>
  <div>
    <suspense>
      <template #default>
        <ItemList/>
      </template>
    </suspense>
  </div>
</template>

<script setup lang="ts">
import ItemList from './ItemList.vue';
</script>