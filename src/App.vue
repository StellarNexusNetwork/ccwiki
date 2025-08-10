<template>
  <div class="app">
    <TitleBar/>
    <NoticeComponent/>
    <NavigationBar v-model:mainDivStyle="mainDivStyle" v-model:mainStyle="mainStyle"/>
    <SettingDialog/>
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
import SettingDialog from "@/components/setting/SettingDialog.vue";
import {useWindowStore} from '@/stores/window';
import {useDataSourcesStore} from '@/stores/dataSources';
import type {NavigationGuardNext, RouteLocationNormalized} from 'vue-router';
import {RouterView, useRouter} from 'vue-router';
import {ref, watchEffect} from 'vue';
import get from 'lodash/get';

type RouteRule = {
  from: string | RegExp
  to: string | RegExp
}

useDataSourcesStore().initFetchData();

const sysWindows = useWindowStore();

let ifLoadingFinish = false;
window.addEventListener('load', function () {
  ifLoadingFinish = true;
});


const mainDivStyle = ref({paddingLeft: '50px'});
const mainStyle = ref({
  width: 'calc(100vw - 50px)',
  position: 'static' as 'static' | 'absolute' | 'relative' | 'fixed',
  right: 'auto'
});

const routerLoadingS = ref({display: 'none'});
const rtLoadingBgS = ref({
  width: '100px',
  height: '100px',
  opacity: 0,
  marginBottom: '0px',
  transitionDuration: '0.5s'
});
const rtLoadingS = ref({opacity: 0});
let rtIsAnimating = false;
let allowRouting = false;
let rtAeF = false;

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
const blackList: Record<string, any> = {
  'classification': ['classification', 'classificationR', 'classification_items', 'docs'],
  'classificationR': ['classification', 'classificationR', 'classification_items', 'docs'],
  'classification_items': ['classification', 'classificationR', 'classification_items', 'docs'],
  'docs': ['classification', 'classificationR', 'classification_items', 'docs']
};

function IsBlacklisted(from: string, to: string) {
  const getItem = get(blackList, from);
  if (getItem !== undefined) {
    if (Array.isArray(getItem) && getItem.includes(to)) {
      return true;
    }
  }
  return false;
}

router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {

  let isBlacklisted = false;
  if (typeof from.name === 'string' && typeof to.name === 'string') {
    isBlacklisted = IsBlacklisted(from.name, to.name);
  }

  sysWindows.isMarqueeEnabled = false;

  if (!isBlacklisted) {
    if (ifLoadingFinish && !rtIsAnimating) {
      rtIsAnimating = true;
      allowRouting = false;
      Object.assign(rtLoadingBgS, {
        width: '100px',
        height: '100px',
        opacity: 0,
        marginBottom: '0px',
        transitionDuration: '0.5s'
      });
      routerLoadingS.value.display = 'none';
      rtLoadingS.value.opacity = 0;
      setTimeout(() => {
        routerLoadingS.value.display = 'flex';
      }, 10);
      setTimeout(() => {
        Object.assign(rtLoadingBgS.value, {
          width: '250px',
          height: '250px',
          opacity: 1,
          marginBottom: '70px'
        });
      }, 20);
      setTimeout(() => {
        Object.assign(rtLoadingBgS.value, {width: '200px', height: '200px', marginBottom: '0px'});
      }, 500);
      setTimeout(() => {
        rtLoadingS.value.opacity = 1;
      }, 1000);
      setTimeout(() => {
        rtLoadingBgS.value.transitionDuration = '0.75s';
      }, 1499);
      setTimeout(() => {
        Object.assign(rtLoadingBgS.value, {
          width: 'calc(100vw + 100vh)',
          height: 'calc(100vw + 100vh)'
        });
      }, 1500);
      setTimeout(() => {
        next();
        rtLoadingBgS.value.transitionDuration = '0.5s';
        allowRouting = true;
      }, 2250);
    } else {
      //这里是更改路由 但好像又失效了.
      if (allowRouting || !ifLoadingFinish) {
        next();
        rtAeF = true;
      }
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((document as any).startViewTransition) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (document as any).startViewTransition(() => next());
    } else {
      next();
    }
  }
});

router.afterEach((to: RouteLocationNormalized, from: RouteLocationNormalized) => {
  let isBlacklisted = false;
  if (typeof from.name === 'string' && typeof to.name === 'string') {
    isBlacklisted = IsBlacklisted(from.name, to.name);
  }

  if (!isBlacklisted) {
    if (ifLoadingFinish && !rtAeF) {
      allowRouting = false;
      rtLoadingS.value.opacity = 0;
      setTimeout(() => {
        rtLoadingBgS.value.opacity = 0;
      }, 500);
      setTimeout(() => {
        routerLoadingS.value.display = 'none';
      }, 1000);
      setTimeout(() => {
        if (Math.random() < 0.5) {
          Object.assign(rtLoadingBgS.value, {width: '200px', height: '200px'});
        }
        rtIsAnimating = false;
      }, 1100);
    } else {
      rtAeF = false;
    }
  }
});
</script>

<style scoped>
@media (min-width: 670px) {
  .mainDiv {
    padding-top: 42px;
  }

  .main {
    height: calc(100vh - 42px);
    border-radius: 20px 0 20px 0;
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
