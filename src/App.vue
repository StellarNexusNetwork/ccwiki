<template>
  <titleBar/>
  <notice/>
  <navigationBar v-model:mainDivStyle="mainDivStyle" v-model:mainStyle="mainStyle"/>
  <div class="mainDiv" :style="mainDivStyle">
    <div class="main" :style="mainStyle">
      <RouterView class="router-view" :key="$route.fullPath"/>
    </div>
  </div>
  <div class="routerLoading" :style="[routerLoadingS, { marginLeft: mainDivStyle.paddingLeft }]">
    <div class="loading_bg" :style="rt_loading_bgS">
      <svg xmlns="http://www.w3.org/2000/svg" class="loading" :style="rt_loadingS" width="130" height="130"
           viewBox="0 0 130 130">
        <circle cx="65" cy="65" r="60" stroke="#04AAEB" stroke-width="10" fill="none" class="circle"/>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import titleBar from './components/titleBar.vue'
import navigationBar from './components/navigationBar.vue'
import notice from './components/notice/index.vue'
import {RouterView, useRouter} from 'vue-router'
import {ref, watchEffect} from 'vue'
import {useWindowStore} from './stores/window'
import {useDataSourcesStore} from './stores/dataSources';

type RouteRule = {
  from: string | RegExp
  to: string | RegExp
}

useDataSourcesStore().initFetchData()

let ifLoadingFinish = false;
window.addEventListener('load', function () {
  ifLoadingFinish = true;
});


let mainDivStyle = ref({paddingLeft: '50px'})
let mainStyle = ref({
  width: 'calc(100vw - 50px)',
  position: 'static' as 'static' | 'absolute' | 'relative' | 'fixed',
  right: 'auto'
})

let routerLoadingS = ref({display: 'none'})
let rt_loading_bgS = ref({width: '100px', height: '100px', opacity: 0, marginBottom: '0px', transitionDuration: '0.5s'})
let rt_loadingS = ref({opacity: 0})
let rt_isAnimating = false;
let allowRouting = false;
let rt_ae_f = false

// 移动端适配
let oldMainDivPL = '50px'
let oldMainStyleW = 'calc(100vw - 50px)'
watchEffect(() => {
  if (useWindowStore().windowWidth < 670 && mainDivStyle.value.paddingLeft != "0px") {
    oldMainDivPL = mainDivStyle.value.paddingLeft
    oldMainStyleW = mainStyle.value.width
    mainDivStyle.value.paddingLeft = "0px";
    mainStyle.value.width = '100vw'
  }
  if (useWindowStore().windowWidth >= 670 && mainDivStyle.value.paddingLeft == "0px") {
    mainDivStyle.value.paddingLeft = oldMainDivPL
    mainStyle.value.width = oldMainStyleW
  }
})

const router = useRouter()
const blackList: RouteRule[] = [
  {'from': 'classification', 'to': 'classification_items'},
  {'from': 'classification_items', 'to': 'classification'},
  {'from': 'classification_items', 'to': 'docs'},
  {'from': 'docs', 'to': 'classification_items'}
]

router.beforeEach((to: any, from: any, next) => {

  const isBlacklisted = blackList.some(rule => {
    const fromMatch = typeof rule.from === 'string'
        ? from.name === rule.from
        : rule.from.test(from.name)

    const toMatch = typeof rule.to === 'string'
        ? to.name === rule.to
        : rule.to.test(to.name)

    return fromMatch && toMatch
  })

  if (!isBlacklisted) {
    if (ifLoadingFinish && !rt_isAnimating) {
      rt_isAnimating = true;
      allowRouting = false;
      Object.assign(rt_loading_bgS, {
        width: '100px',
        height: '100px',
        opacity: 0,
        marginBottom: '0px',
        transitionDuration: '0.5s'
      })
      routerLoadingS.value.display = 'none';
      rt_loadingS.value.opacity = 0;
      setTimeout(() => {
        routerLoadingS.value.display = 'flex';
      }, 10);
      setTimeout(() => {
        Object.assign(rt_loading_bgS.value, {width: '250px', height: '250px', opacity: 1, marginBottom: '70px'});
      }, 20);
      setTimeout(() => {
        Object.assign(rt_loading_bgS.value, {width: '200px', height: '200px', marginBottom: '0px'});
      }, 500);
      setTimeout(() => {
        rt_loadingS.value.opacity = 1;
      }, 1000);
      setTimeout(() => {
        rt_loading_bgS.value.transitionDuration = '0.75s';
      }, 1499);
      setTimeout(() => {
        Object.assign(rt_loading_bgS.value, {width: 'calc(100vw + 100vh)', height: 'calc(100vw + 100vh)'});
      }, 1500);
      setTimeout(() => {
        next()
        rt_loading_bgS.value.transitionDuration = '0.5s';
        allowRouting = true;
      }, 2250);
    } else {
      //这里是更改路由 但好像又失效了.
      if (allowRouting || !ifLoadingFinish) {
        next()
        rt_ae_f = true
      }
    }
  } else {
    if ((document as any).startViewTransition) {
      (document as any).startViewTransition(() =>
          next()
      )
    } else {
      next()
    }
  }
})

router.afterEach((from: any, to: any) => {
  const isBlacklisted = blackList.some(rule => {
    const fromMatch = typeof rule.from === 'string'
        ? from.name === rule.from
        : rule.from.test(from.name)

    const toMatch = typeof rule.to === 'string'
        ? to.name === rule.to
        : rule.to.test(to.name)

    return fromMatch && toMatch
  })
  if (!isBlacklisted) {
    if (ifLoadingFinish && !rt_ae_f) {
      allowRouting = false;
      rt_loadingS.value.opacity = 0;
      setTimeout(() => {
        rt_loading_bgS.value.opacity = 0;
      }, 500);
      setTimeout(() => {
        routerLoadingS.value.display = 'none';
      }, 1000);
      setTimeout(() => {
        if (Math.random() < 0.5) {
          Object.assign(rt_loading_bgS.value, {width: '200px', height: '200px'});
        }
        rt_isAnimating = false;
      }, 1100);
    } else {
      rt_ae_f = false
    }
  }
})

</script>

<style scoped>
@media (min-width: 670px) {
  .titleBar {
    display: block;
  }

  .navigationBar {
    top: 42px;
    height: calc(100vh - 42px);
    padding-top: 5px;
  }

  .mainDiv {
    padding-top: 42px;
  }

  .main {
    height: calc(100vh - 42px);
    border-radius: 20px 0 20px 0;
  }
}

@media (max-width: 670px) {
  .titleBar {
    display: none;
  }

  .navigationBar {
    bottom: 0;
    height: 50px;
  }

  .main {
    height: calc(100vh - 50px);
  }
}

.titleBar {
  position: fixed;
  top: 0;
  width: 100vw;
  height: 42px;
  user-select: none;
  transition-duration: 0.3s;
  z-index: 99998;
  background-color: var(--color-background-2);
}

.navigationBar {
  position: fixed;
  left: 0;
  user-select: none;
  transition-duration: 0.3s;
  z-index: 99997;
  background-color: var(--color-background-2);
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
