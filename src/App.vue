<template>
  <titleBar />
  <navigationBar v-model:mainDivStyle="mainDivStyle" v-model:mainStyle="mainStyle" />
  <div class="mainDiv" :style="mainDivStyle">
    <div class="main" :style="mainStyle">
      <RouterView class="router-view" />
    </div>
  </div>
</template>

<script setup lang="ts">
import titleBar from './basis_c/titleBar.vue'
import navigationBar from './basis_c/navigationBar.vue'
import { RouterView } from 'vue-router'
import { reactive, ref } from 'vue'

let mainDivStyle = ref({ paddingLeft: '50px' })
let mainStyle = ref({ width: 'calc(100vw - 50px)', position: 'static' as 'static' | 'absolute' | 'relative' | 'fixed', right: 'auto' })

</script>

<style scoped>
.titleBar {
  position: fixed;
  top: 0;
  width: 100vw;
  height: 42px;
  user-select: none;
  transition-duration: 0.3s;
  z-index: 99998;
  background-color: #F5F5F5;
}

.navigationBar {
  position: fixed;
  left: 0;
  top: 42px;
  height: calc(100vh - 42px);
  padding-top: 5px;
  user-select: none;
  transition-duration: 0.3s;
  z-index: 99997;
  background-color: #F5F5F5;
}

.mainDiv {
  padding-top: 42px;
}

.main {
  height: calc(100vh - 42px);
  border-radius: 20px 0px 20px 0px;
  background: #fafafa;
  transition-duration: 0.3s;
  overflow: auto;
}

.router-view {
  height: 100%;
  width: 100%;
}
</style>
