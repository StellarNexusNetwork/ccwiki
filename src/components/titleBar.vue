<template>
  <div class="titleBar">
    <div class="logo">
      <img class='logoImg' src="/static/public/svg/ccwiki_logo.svg" alt='' width='auto' height='30' draggable="false">
    </div>
    <div class="appControl">
      <div class="options">
        <button id="red">
          <img src="/static/public/svg/titleBar/closeApp.svg" alt="close App" draggable="false">
        </button>
      </div>
      <div class="options">
        <button id="normal">
          <img src="/static/public/svg/titleBar/maximizeRestoreApp.svg" alt="maximize Restore App" draggable="false">
        </button>
      </div>
      <div class="options">
        <button id="normal">
          <img src="/static/public/svg/titleBar/minimizeApp.svg" alt="minimize App" draggable="false">
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
import {eventBus} from '@/utils/eventBus';

const openDialog = () => {
  eventBus.emit('callOpenSettingsDialog1')
  eventBus.emit('callOpenSettingsDialog2', 1)
}


</script>

<style scoped>
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
  background-color: var(--color-danger-normal);
}

.titleBar .appControl .options #red:hover img {
  position: relative;
  top: -42px;
  filter: drop-shadow(var(--color-background-1) 0 42px);
  user-select: none;
}

.titleBar .appControl .options #normal:hover {
  background-color: var(--color-background-3);
}

.titleBar .appControl .options button img {
  width: 20px;
  height: 20px;
  user-select: none;
}
</style>
