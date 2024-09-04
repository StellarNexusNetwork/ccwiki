<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import titleBar from './basis_c/titleBar.vue'
import navigationBar from './basis_c/navigationBar.vue'
</script>

<template>
  <titleBar />
  <navigationBar />
  <div class="mainDiv">
    <div class="main">
    </div>
  </div>
</template>

<style scoped>
.titleBar {
  position: fixed;
  top: 0;
  width: 100vw;
  height: 42px;
  user-select: none;
  transition-duration: 0.3s;
  z-index: 99998;
}

.navigationBar {
  position: fixed;
  left: 0;
  top: 42px;
  width: 50px;
  height: calc(100vh - 42px);
  padding-top: 5px;
  user-select: none;
  transition-duration: 0.3s;
  z-index: 99997;
}

.mainDiv {
  padding-top: 42px;
  padding-left: 50px;
}

.main {
  height: calc(100vh - 42px);
  width: calc(100vw - 50px);
  border-radius: 20px 0px 20px 0px;
  background: #fafafa;
  transition-duration: 0.3s;
}
</style>
