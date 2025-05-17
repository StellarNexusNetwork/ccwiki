<template>
  <div class="optionsList">
    <button class="button" @click="switchDetail(0)">
      <div class="title">{{ $t("public.setting.settings") }}</div>
    </button>
    <div class="line"></div>
    <div class="options">
      <button class="button" @click="switchDetail(1)">
        <img src="/static/public/svg/setting/theme.svg" alt="SVG Image" draggable="false">
        <div class="textDiv">{{ $t("public.setting.theme") }}</div>
      </button>
    </div>
    <div class="options">
      <button class="button" @click="switchDetail(2)">
        <img src="/static/public/svg/setting/language.svg" alt="SVG Image" draggable="false">
        <div class="textDiv">{{ $t("public.setting.language") }}</div>
      </button>
    </div>
    <div class="options">
      <button class="button" @click="switchDetail(3)">
        <img src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
        <div class="textDiv">{{ $t("public.setting.test") }}</div>
      </button>
    </div>
  </div>
  <div class="optionsDetail">
    <div class="winControl">
      <div class="title">{{ $t(currentDisplayName) }}</div>
      <button @click="closeDialog">
        <img src="/static/public/svg/titleBar/closeApp.svg" alt="SVG Image" draggable="false">
      </button>
    </div>
    <div class="optionsDetailContent">
      <transition name="fade" mode="out-in">
        <component :is="components[currentIndex]"></component>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
function closeDialog() {
  const dialog = document.getElementById("setting_dialog") as HTMLDialogElement;
  const setting = document.getElementById("setting_Div");
  dialog.classList.remove("show"); // 移除动画类
  setting!.classList.remove("show");
  dialog.style.pointerEvents = "none";
  setTimeout(() => dialog!.close(), 300); // 等待动画结束后关闭对话框
}

import {ref} from 'vue'
import V_default from './setting/default.vue'
import V_theme from './setting/theme.vue'
import V_lang from './setting/lang.vue'
import V_test from './setting/test.vue'
import {eventBus} from '@/utils/eventBus'

const components = [V_default, V_theme, V_lang, V_test]
const currentNames = ['default', 'theme', 'language', 'test']
const currentDisplayName = ref('public.setting.default')

const currentIndex = ref(0)

eventBus.on('callOpenSettingsDialog2', switchDetail)

function switchDetail(index: any) {
  currentIndex.value = index
  if (index > currentNames.length) {
    currentDisplayName.value = 'public.setting.systemError'
  } else {
    currentDisplayName.value = 'public.setting.' + currentNames[index]
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(25px) scale(0.9);
}

.optionsList {
  width: 10vw;
  min-width: 125px;
  height: 100%;
  background-color: var(--color-background-2);
  transition-duration: 0.5s;
}

@media (min-width: 670px) {
  .optionsDetail {
    width: 45vw;
  }
}

@media (max-width: 670px) {
  .optionsDetail {
    width: calc(100vw - 125px - 40px);
  }
}

.optionsDetail {
  height: 100%;
  background: var(--color-background-1);
  transition-duration: 0.5s;
}

.optionsDetail .winControl {
  width: 100%;
  height: 45px;
  display: flex;
  padding-top: 10px;
  padding-right: 10px;
  padding-left: 15px;
  margin-bottom: 5px;
  transition-duration: 0.5s;
  pointer-events: none;
}

.optionsDetail .winControl .title {
  font-size: 20px;
  color: var(--color-text-title);
  transition-duration: 0.3s;
}

.optionsDetail .winControl button {
  outline: none;
  border: none;
  background: transparent;
  width: 35px;
  height: 35px;
  transition-duration: 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  overflow: hidden;
  pointer-events: auto;
  margin-left: auto;
}

.optionsDetail .winControl button:hover {
  background-color: var(--color-background-3);
  border-radius: 10px;
  overflow: hidden;
}

.optionsDetail .winControl button img {
  width: 20px;
  height: 20px;
  user-select: none;
}

.optionsDetail .optionsDetailContent {
  width: 100%;
  height: calc(100% - 45px - 5px);
  padding-left: 15px;
  padding-right: 15px;
  overflow-y: auto;
}

.optionsList .button {
  outline: none;
  border: none;
  background: transparent;
  width: calc(100% - 20px);
  height: 40px;
  transition-duration: 0.2s;
  display: flex;
  align-items: center;
  border-radius: 10px;
}

.optionsList .title {
  width: 100%;
  height: 45px;
  font-family: RHRCN-M;
  font-size: 20px;
  display: flex;
  align-items: center;
  padding-left: 15px;
  color: var(--color-text-title);
  transition-duration: 0.3s;
}

.optionsList .line {
  width: calc(100% - 18px);
  height: 1px;
  background-color: var(--color-border-3);
  margin-left: 9px;
  margin-bottom: 10px;
}

.optionsList .options {
  margin-bottom: 10px;
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.optionsList .options .button {
  outline: none;
  border: none;
  background: transparent;
  width: calc(100% - 20px);
  height: 40px;
  transition-duration: 0.2s;
  display: flex;
  align-items: center;
  border-radius: 10px;
}

.optionsList .options .button:hover {
  background-color: var(--color-background-3);
}

.optionsList .options .button img {
  width: 25px;
  height: 25px;
  user-select: none;
  filter: drop-shadow(var(--color-text-title) 250vw 0);
  transform: translateX(-250vw);
}

.optionsList .options .button .textDiv {
  padding-left: 5px;
  height: 100%;
  margin-left: 5px;
  margin-right: 5px;
  display: flex;
  align-items: center;
  font-family: RHRCN-H;
  color: var(--color-text-body);
  white-space: nowrap;
  overflow: hidden;
  font-size: 15px;
  transition-duration: 0.3s;
}
</style>