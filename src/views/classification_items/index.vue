<template>
  <div>
    <suspense>
      <template #default>
        <MainDiv/>
      </template>
    </suspense>
  </div>
</template>

<script setup lang="ts">
import MainDiv from "./mainDiv.vue"
</script>