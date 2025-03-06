<template>
  <div class="titleBar">
    <div class="logo">
      <img class='logoImg' src="/static/public/svg/ccwiki_logo.svg" alt='' width='auto' height='30' draggable="false">
    </div>
    <div class="appControl">
      <div class="options" @click="closeWindow">
        <button id="red">
          <img src="/static/public/svg/titleBar/closeApp.svg" alt="close App" draggable="false">
        </button>
      </div>
      <div class="options">
        <button id="normal" @click="toggleMaximizeWindow">
          <img src="/static/public/svg/titleBar/maximizeRestoreApp.svg" alt="SVG Image" draggable="false">
        </button>
      </div>
      <div class="options">
        <button id="normal" @click="minimizeWindow">
          <img src="/static/public/svg/titleBar/minimizeApp.svg" alt="SVG Image" draggable="false">
        </button>
      </div>
      <div class="options">
        <button id="normal" @click='openDialog'>
          <img src="/static/public/svg/titleBar/language.svg" alt="language" draggable="false">
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { window } from '@tauri-apps/api';
import { eventBus } from '@/utils/eventBus';

async function minimizeWindow() {
  const currentWindow = await window.getCurrentWindow();
  await currentWindow.minimize();
}
async function toggleMaximizeWindow() {
  const currentWindow = await window.getCurrentWindow();
  const isMaximized = await currentWindow.isMaximized();
  if (isMaximized) {
    await currentWindow.unmaximize();
  } else {
    await currentWindow.maximize();
  }
}
async function closeWindow() {
  const currentWindow = await window.getCurrentWindow();
  await currentWindow.close();
}

const openDialog = () => {
  eventBus.emit('callOpenSettingsDialog1')
  eventBus.emit('callOpenSettingsDialog2', 1)
}


</script>

<style scoped>
.titleBar {
  -webkit-app-region: drag;
}

.titleBar .logo img {
  margin-top: 3.5px;
  margin-left: 3.5px;
  user-select: none;
}

.titleBar .appControl {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: row-reverse;
  -webkit-app-region: no-drag;
}

.titleBar .appControl .options button {
  outline: none;
  border: none;
  background: transparent;
  width: 42px;
  height: 42px;
  transition-duration: 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.titleBar .appControl .options #red:hover {
  background-color: #ff4551;
}

.titleBar .appControl .options #red:hover img {
  position: relative;
  top: -42px;
  filter: drop-shadow(#fff 0 42px);
  user-select: none;
}

.titleBar .appControl .options #normal:hover {
  background-color: #e2e2e2;
}

.titleBar .appControl .options button img {
  width: 20px;
  height: 20px;
  user-select: none;
}
</style>
