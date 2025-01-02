<template>
    <div class="Div" :style="mainDevStyle">
        <div class="home" ref="mainDiv" :style="homeStyle">
            <div class="logo">
                <img class='ring' src="/static/home/svg/ring.svg" alt='' width='auto' height='170px' draggable="false">
                <img class='logo_image' src="/static/public/svg/ccwiki_logo0.svg" alt='' width='auto' height='120px' draggable="false">
            </div>
            <div class='newsList'>
                <div class="newsDiv" style="margin-left: 0px;">
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
            <div class="updataList">
                <div class="updataDiv" style="margin-top: 0px;">
                    <div class="imgDiv">
                        <div class="ring">
                            <img class='ring2' src="/static/home/svg/ring2.svg" alt='' draggable="false">
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
                <!-- <div class="updataDiv">
                    <div class="imgDiv">
                        <div class="ring">
                        </div>
                    </div>
                    <div class="textDiv">
                        <div class="date">2024.9.7</div>
                        <ul>
                            <li>完成基础UI</li>
                        </ul>
                    </div>
                </div> -->
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect, reactive } from 'vue'

const mainDiv = ref();
let mainDevStyle = reactive({ alignItems: 'center' });
let homeStyle = reactive({ paddingBottom: '70px' });
const mainDevHeight = ref(0);
let newsDiv2Style = reactive({ display: 'flex' });

const windowHeight = ref(window.innerHeight);
const windowWidth = ref(window.innerWidth);
const updateWindowHeight = () => {
    windowHeight.value = window.innerHeight;
};
const updateWindowWidth = () => {
    windowWidth.value = window.innerWidth;
};

onMounted(() => {
    mainDevHeight.value = mainDiv.value.offsetHeight;
    updateWindowHeight(); // 初始化窗口高度
    updateWindowWidth(); // 初始化窗口宽度
    window.addEventListener('resize', updateWindowHeight); // 监听窗口大小变化
    window.addEventListener('resize', updateWindowWidth); // 监听窗口大小变化
});

// 在组件卸载时移除事件监听器
onUnmounted(() => {
    window.removeEventListener('resize', updateWindowHeight); // 移除事件监听器
    window.removeEventListener('resize', updateWindowWidth); // 移除事件监听器
});

watchEffect(() => {
    if (mainDevHeight.value >= windowHeight.value - 40) {
        mainDevStyle.alignItems = 'flex-start';
        homeStyle.paddingBottom = '20px';
    } else {
        mainDevStyle.alignItems = 'center';
        homeStyle.paddingBottom = '70px';
    }
    if (windowWidth.value <= 800) {
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

.Div .home .logo .logoImg {
    grid-area: 1;
    position: absolute;
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
    border: 1px solid #c9c9c9;
    border-radius: 10px;
    width: 170px;
    /* height: 155px; */
    margin-left: 20px;
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
    border-width: 0px 0px 1px 0px;
    border-style: solid;
    border-color: #c9c9c9;
    user-select: none;
}



.Div .home .newsList .newsDiv .text {
    font-family: RHRCN-H;
    font-size: 15px;
    color: #3c3c3c;
    padding-top: 3px;
    padding-left: 3px;
    padding-right: 3px;
    padding-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.Div .home .newsList .newsDiv .date {
    font-family: RHRCN-H;
    color: #787878;
    font-size: 10px;
    padding-left: 3PX;
    padding-right: 3PX;
    padding-bottom: 3PX;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.Div .home .updataList {
    margin-top: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.Div .home .updataList .updataDiv {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    margin-top: 20px;
}

.Div .home .updataList .updataDiv .imgDiv .ring {
    background: #04AAEB;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    user-select: none;
}

.Div .home .updataList .updataDiv .imgDiv .ring .ring2 {
    width: 30px;
    height: 30px;
    margin-left: -7.5px;
    margin-top: -7.5px;
    animation: 1s linear 0s infinite normal none running init_loading2;
}

.Div .home .updataList .updataDiv .textDiv {
    margin-left: 20px;
}

.Div .home .updataList .updataDiv .textDiv .date {
    font-family: RHRCN-H;
    font-size: 15px;
    margin-top: -5px;
}

.Div .home .updataList .updataDiv .textDiv ul {
    padding-left: 20px;
}

.Div .home .updataList .updataDiv .textDiv ul li {
    font-family: RHRCN-M;
    font-size: 15px;
}
</style>