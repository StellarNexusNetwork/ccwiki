<template>
  <div class="Div">
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
<style scoped>
.Div {
  display: flex;
  justify-content: center;
  padding-bottom: 20px;
}
</style>