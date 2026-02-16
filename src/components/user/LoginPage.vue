<template>
  <div class="optionsDetail">
    <div class="winControl">
      <div class="title">{{ t(currentDisplayName) }}</div>
      <button @click="closeDialog">
        <img src="/components/TitleBar/svg/closeApp.svg" alt="SVG Image" draggable="false">
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
import {useI18n} from 'vue-i18n';
import {ref} from 'vue';
import login from '@/views/sign-in/sign-in.vue';

const {t} = useI18n();

function closeDialog() {
  const dialog = document.getElementById('login_dialog') as HTMLDialogElement;
  const login = document.getElementById('login_Div');
  dialog.classList.remove('show'); // 移除动画类
  login!.classList.remove('show');
  setTimeout(() => dialog.style.display = 'none', 500); // 等待动画结束后关闭对话框
}

const components = [login];
const currentNames = ['login'];
const currentDisplayName = ref('public.login.title.login');

const currentIndex = ref(0);

function switchDetail(index: number) {
  currentIndex.value = index;
  if (index > currentNames.length) {
    currentDisplayName.value = 'public.setting.title.systemError';
  } else {
    currentDisplayName.value = 'public.setting.title.' + currentNames[index];
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

.optionsDetail {
  height: 100%;
  width: 400px;
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
  margin-bottom: 15px;
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
  padding-left: 25px;
  padding-right: 25px;
  padding-bottom: 25px;
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
