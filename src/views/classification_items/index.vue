<template>
  <suspense>
    <template #default>
      <MainDiv/>
    </template>
  </suspense>
</template>

<script setup lang="ts">
import MainDiv from "./mainDiv.vue"
</script>