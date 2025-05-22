<template>
  <div class="Div" :style="mainDevStyle">
    <div class="home" ref="mainDiv" :style="homeStyle">
      <div class="logo">
        <img class='ring' src="/static/home/svg/ring.svg" fetchpriority=high width='auto' height='170px' draggable="false">
        <img class='logo_image' src="/static/public/svg/ccwiki_logo0.svg" fetchpriority=high width='auto' height='120px'
             draggable="false">
      </div>
      <div class='newsList'>
        <div class="newsDiv" style="margin-left: 0;">
          <img class='image' src="/static/home/svg/NotFind_bg.svg" alt='' draggable="false">
          <div class="text">{{ $t("home.news.text_none") }}</div>
          <div class='date'>{{ $t("home.news.date_none") }}</div>
          <!-- <div class="mainText">暂无信息</div> -->
        </div>
        <div class="newsDiv">
          <img class='image' src="/static/home/svg/NotFind_bg.svg" alt='' draggable="false">
          <div class="text">{{ $t("home.news.text_none") }}</div>
          <div class='date'>{{ $t("home.news.date_none") }}</div>
          <!-- <div class="mainText">暂无信息</div> -->
        </div>
        <div class="newsDiv" :style="newsDiv2Style">
          <img class='image' src="/static/home/svg/NotFind_bg.svg" alt='' draggable="false">
          <div class="text">{{ $t("home.news.text_none") }}</div>
          <div class='date'>{{ $t("home.news.date_none") }}</div>
          <!-- <div class="mainText">暂无信息</div> -->
        </div>
        <div class="newsDiv" :style="newsDiv2Style">
          <img class='image' src="/static/home/svg/NotFind_bg.svg" alt='' draggable="false">
          <div class="text">{{ $t("home.news.text_none") }}</div>
          <div class='date'>{{ $t("home.news.date_none") }}</div>
          <!-- <div class="mainText">暂无信息</div> -->
        </div>
      </div>
      <div class="updateList">
        <div class="updateDiv" style="margin-top: 0;">
          <div class="imgDiv">
            <div class="ring">
              <img class='ring2' src="/static/home/svg/ring2.svg" alt='' draggable="false">
            </div>
          </div>
          <div class="textDiv">
            <div class="date">2025.1.1</div>
            <ul>
              <li>新年快乐🎉</li>
            </ul>
          </div>
        </div>
        <div class="updateDiv">
          <div class="imgDiv">
            <div class="ring">
            </div>
          </div>
          <div class="textDiv">
            <div class="date">2024.9.7</div>
            <ul>
              <li>已完成 vue 迁移</li>
              <li>完成基础UI、首页、关于页面</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {onMounted, onUnmounted, reactive, ref, watchEffect} from 'vue'
import {useWindowStore} from '../stores/window'


const mainDiv = ref();
let mainDevStyle = reactive({alignItems: 'center'});
let homeStyle = reactive({paddingBottom: '70px'});
const mainDevHeight = ref(0);
let newsDiv2Style = reactive({display: 'flex'});

const windowHeight = ref(window.innerHeight);
const updateWindowHeight = () => {
  windowHeight.value = window.innerHeight;
};

onMounted(() => {
  mainDevHeight.value = mainDiv.value.offsetHeight;
  updateWindowHeight(); // 初始化窗口高度
  window.addEventListener('resize', updateWindowHeight); // 监听窗口大小变化
});

// 在组件卸载时移除事件监听器
onUnmounted(() => {
  window.removeEventListener('resize', updateWindowHeight); // 移除事件监听器
});

watchEffect(() => {
  if (mainDevHeight.value >= windowHeight.value - 40) {
    mainDevStyle.alignItems = 'flex-start';
    homeStyle.paddingBottom = '20px';
  } else {
    mainDevStyle.alignItems = 'center';
    homeStyle.paddingBottom = '70px';
  }
  if (useWindowStore().windowWidth <= 800) {
    newsDiv2Style.display = 'none';
  } else {
    newsDiv2Style.display = 'flex';
  }
})
</script>
<style scoped>
.Div {
  display: flex;
  justify-content: center;
}

.home {
  display: flex;
  flex-direction: column;
  margin-top: 40px;
  align-items: center;
}

.Div .home .logo {
  display: grid;
  user-select: none;
  position: relative;
}

.Div .home .logo .ring {
  grid-area: 1;
  position: absolute;
  /* animation: 1s linear 0s infinite normal none running init_loading2; */
  animation: init_loading2 3s infinite;
  margin-top: -25px;
  margin-left: -25px;
}

.Div .home .newsList {
  display: flex;
  width: 100%;
  margin-top: 50px;

}

.Div .home .newsList .newsDiv {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border-2);
  border-radius: 10px;
  width: 170px;
  /* height: 155px; */
  margin-left: 20px;
  transition-duration: 0.3s;
}

/* .Div .home .newsList .newsDiv::after {
    content: "";
    width: 160px;
    height: 155px;
    position: absolute;
    margin-top: -155px;
    border-radius: 10px;
    background: linear-gradient(0deg, #12b4ea 0%, rgba(200, 248, 237, 0.3169) 80%, rgba(255, 255, 255, 0) 100%);
    pointer-events: none;
    /* 确保覆盖层不会干扰图片的交互
} */

.Div .home .newsList .newsDiv .image {
  width: 100%;
  height: 100%;
  display: block;
  margin-top: -5px;
  margin-bottom: -5px;
  border-width: 0 0 1px 0;
  border-style: solid;
  border-color: var(--color-border-2);
  user-select: none;
  transition-duration: 0.3s;
}


.Div .home .newsList .newsDiv .text {
  font-family: RHRCN-H;
  font-size: 15px;
  color: var(--color-text-body);
  padding: 3px 3px 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition-duration: 0.3s;
}

.Div .home .newsList .newsDiv .date {
  font-family: RHRCN-H;
  color: var(--color-text-body-subtle);
  font-size: 10px;
  padding-left: 3PX;
  padding-right: 3PX;
  padding-bottom: 3PX;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition-duration: 0.3s;
}

.Div .home .updateList {
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  /* align-items: center; */
}

.Div .home .updateList .updateDiv {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-top: 20px;
}

.Div .home .updateList .updateDiv .date {
  color: var(--color-text-title);
  transition-duration: 0.3s;
}

.Div .home .updateList .updateDiv li {
  color: var(--color-text-body);
  transition-duration: 0.3s;
}

.Div .home .updateList .updateDiv .imgDiv .ring {
  background: var(--color-primary-normal);
  width: 15px;
  height: 15px;
  border-radius: 50%;
  user-select: none;
}

.Div .home .updateList .updateDiv .imgDiv .ring .ring2 {
  width: 30px;
  height: 30px;
  margin-left: -7.5px;
  margin-top: -7.5px;
  animation: 1s linear 0s infinite normal none running init_loading2;
}

.Div .home .updateList .updateDiv .textDiv {
  margin-left: 20px;
}

.Div .home .updateList .updateDiv .textDiv .date {
  font-family: RHRCN-H;
  font-size: 15px;
  margin-top: -5px;
}

.Div .home .updateList .updateDiv .textDiv ul {
  padding-left: 20px;
}

.Div .home .updateList .updateDiv .textDiv ul li {
  font-family: RHRCN-M;
  font-size: 15px;
}
</style>