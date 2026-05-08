<template>
  <div :class="{ app: true, 'app-dark': isDark }">
    <TitleBar/>
    <NoticeComponent/>
    <NavigationBar v-model:mainDivStyle="mainDivStyle" v-model:mainStyle="mainStyle"/>
    <SettingDialog/>
    <LoginDialog/>
    <div class="mainDiv" :style="mainDivStyle">
      <div class="main" :style="mainStyle">
        <RouterView class="router-view" :key="$route.fullPath"/>
      </div>
    </div>
    <div class="routerLoading" :style="[routerLoadingS, { marginLeft: mainDivStyle.paddingLeft }]">
      <div class="loading_bg" :style="rtLoadingBgS">
        <svg xmlns="http://www.w3.org/2000/svg" class="loading" :style="rtLoadingS" width="130" height="130"
             viewBox="0 0 130 130">
          <circle cx="65" cy="65" r="60" stroke="#04AAEB" stroke-width="10" fill="none" class="circle"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TitleBar from '@/components/TitleBar.vue';
import NavigationBar from '@/components/NavigationBar.vue';
import NoticeComponent from '@/components/notice/NoticeComponent.vue';
import LoginDialog from "@/components/user/LoginDialog.vue";
import SettingDialog from "@/components/settings/SettingDialog.vue";
import {useWindowStore} from '@/stores/window';
import {useDataSourcesStore} from '@/stores/dataSources';
import {RouterView, useRouter} from 'vue-router';
import {computed, onMounted, onUnmounted, ref, watchEffect} from 'vue';
import {useRouteTransition} from '@/composables/useRouteTransition';
import {useSettingStore} from '@/stores/setting';


useDataSourcesStore().initFetchData();

const sysWindows = useWindowStore();

const mainDivStyle = ref({paddingLeft: '50px'});
const mainStyle = ref({
  width: 'calc(100vw - 50px)',
  position: 'static' as 'static' | 'absolute' | 'relative' | 'fixed',
  right: 'auto'
});

// 移动端适配
let oldMainDivPL = '50px';
let oldMainStyleW = 'calc(100vw - 50px)';
watchEffect(() => {
  if (sysWindows.enableMobileSupport && mainDivStyle.value.paddingLeft != '0') {
    oldMainDivPL = mainDivStyle.value.paddingLeft;
    oldMainStyleW = mainStyle.value.width;
    mainDivStyle.value.paddingLeft = '0';
    mainStyle.value.width = '100vw';
  }
  if (!sysWindows.enableMobileSupport && mainDivStyle.value.paddingLeft == '0') {
    mainDivStyle.value.paddingLeft = oldMainDivPL;
    mainStyle.value.width = oldMainStyleW;
  }
});

const router = useRouter();
const {routerLoadingS, rtLoadingBgS, rtLoadingS} = useRouteTransition(router, {
  disableMarquee: () => {
    sysWindows.isMarqueeEnabled = false;
  }
});

const setting = useSettingStore().setting;
const theme = setting.theme;

const media = window.matchMedia('(prefers-color-scheme: dark)')

const systemDark = ref(media.matches)

const updateSystemTheme = (e: MediaQueryListEvent) => {
  systemDark.value = e.matches
}

onMounted(() => {
  media.addEventListener('change', updateSystemTheme)
})

onUnmounted(() => {
  media.removeEventListener('change', updateSystemTheme)
})

const isDark = computed(() => {
  return (
    theme.appearance === 'dark' ||
    (
      theme.appearance === 'auto' &&
      systemDark.value
    )
  )
})
</script>

<style scoped>
@media (min-width: 670px) {
  .mainDiv {
    padding-top: 42px;
  }

  .main {
    height: calc(100vh - 42px);
    border-radius: 20px 0 0 0;
  }
}

@media (max-width: 670px) {
  .main {
    height: calc(100vh - 50px);
  }
}

.mainDiv {
  width: 100vw;
  overflow: hidden;
}

.main {
  background: var(--color-background-1);
  transition-duration: 0.3s;
  overflow-y: auto;
  overflow-x: hidden;
  border-width: 2px 0 0 2px;
  border-style: solid;
  border-color: var(--color-border-main);
}

.router-view {
  height: 100%;
  width: 100%;
}

.routerLoading {
  width: 100%;
  height: calc(100vh - 42px);
  justify-content: center;
  align-items: center;
  position: fixed;
  bottom: 0;
  border-radius: 20px 0 20px 0;
  overflow: hidden;
  transition-duration: 0.5s;
}

.routerLoading .loading_bg {
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--color-background-1);
  border-radius: 50%;
  box-shadow: 0 4px 20px 0 var(--color-shadow-l);
  flex-shrink: 0;
}

.routerLoading .loading_bg .loading {
  stroke-dasharray: 377;
  /* 半圆的圆周长（2 * π * 半径） */
  stroke-dashoffset: 70;
  animation: 1.5s linear 0s infinite normal none running routerLoading;
  transition-duration: 0.5s;
}
</style>
