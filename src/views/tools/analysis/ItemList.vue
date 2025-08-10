<template>
  <div class="Div">
    <ChartBuilder v-for="config in configList" :config="config"/>
  </div>
</template>

<script setup lang="ts">
import ChartBuilder from './components/ChartBuilder.vue';
import {ref} from 'vue';

const configList = ref([
  {
    label: 'intent',
    isT: 'False'
  },
  {
    label: 'emotion',
    isT: 'False'
  },
  {
    label: 'intent',
    isT: 'True'
  }
])
</script>

<style scoped>
.Div {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
}
</style>
