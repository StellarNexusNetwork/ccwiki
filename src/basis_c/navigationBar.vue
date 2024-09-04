<template>
    <div class="navigationBar" :style="navigationBarStyle">
        <div class="listDiv" id="navigation">
            <div class="options">
                <button class="button" @click="unfold">
                    <img class="b_img" src="/static/public/svg/navigationBar/fold.svg" alt="SVG Image" draggable="false" style="margin-left: 0px;margin-right: 0px;">
                    <div class="textDiv" :style="unfoldStyle.style"> unfold </div>
                </button>
            </div>
            <div class="line">
            </div>
            <!-- <div class="options" v-for="(item, index) in items" :key="index">
                <button class="button" @click="unfold">
                    <img class="b_img" src="../static/public/svg/navigationBar/fold.svg" alt="SVG Image" draggable="false" style="margin-left: 0px;margin-right: 0px;">
                    <div class="textDiv" :style="unfoldStyle.style"> unfold </div>
                </button>
            </div> -->
            <!-- 先不不急着写 -->

            <div class="options">
                <RouterLink to="/" class="button">
                    <img id="_navigation_home_svg" src="/static/public/svg/navigationBar/home.svg" alt="SVG Image" draggable="false">
                    <div class="textDiv" :style="unfoldStyle.style">首页</div>
                </RouterLink>
            </div>
            <div class="options">
                <RouterLink to="/classification" class="button">
                    <img id="_navigation_lassification_svg" src="/static/public/svg/navigationBar/classification.svg" alt="SVG Image" draggable="false">
                    <div class="textDiv" :style="unfoldStyle.style">分类</div>
                </RouterLink>
            </div>
            <div class="options">
                <RouterLink to="/components" class="button">
                    <img id="_navigation_components_svg" src="/static/public/svg/navigationBar/components.svg" alt="SVG Image" draggable="false">
                    <div class="textDiv" :style="unfoldStyle.style">工具</div>
                </RouterLink>
            </div>
            <div class="options">
                <button class="button">
                    <img id="_navigation_Co-createdWikiCopilotAI_svg" src="/static/public/svg/navigationBar/Co-createdWikiCopilotAI.svg" alt="SVG Image" draggable="false" style="margin-left: 0px;margin-right: 0px;">
                    <div class="textDiv" :style="unfoldStyle.style">**</div>
                </button>
            </div>
            <div class="options">
                <RouterLink to="/others" class="button">
                    <img id="_navigation_others_svg" src="/static/public/svg/navigationBar/others.svg" alt="SVG Image" draggable="false">
                    <div class="textDiv" :style="unfoldStyle.style">其他</div>
                </RouterLink>
            </div>
        </div>
        <div class="listDiv" id="tool">
            <div class="options">
                <button class="button">
                    <img id="_navigation_account_svg" src="/static/public/svg/navigationBar/account.svg" alt="SVG Image" draggable="false">
                    <div class="textDiv" :style="unfoldStyle.style">账号</div>
                </button>
            </div>
            <div class="options">
                <button class="button">
                    <img id="_navigation_settings_svg" src="/static/public/svg/navigationBar/settings.svg" alt="SVG Image" draggable="false">
                    <div class="textDiv" :style="unfoldStyle.style">设置</div>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { RouterLink } from 'vue-router'
// let navigation = ref([
//     { id: 'home', src: "../static/public/svg/navigationBar/account.svg", text: "" }
// ])
// 别急

let unfoldStyle = ref({ style: '', state: false })
let navigationBarStyle = ref('')

function unfold() {
    if (unfoldStyle.value.state) {
        unfoldStyle.value.state = false;
        unfoldStyle.value.style = '';
        navigationBarStyle.value = '';
    } else {
        unfoldStyle.value.state = true;
        unfoldStyle.value.style = 'opacity:1';
        navigationBarStyle.value = 'width:95px';
    }
}

</script>

<style scoped>
.navigationBar .listDiv .options {
    margin-bottom: 5px;
    width: 100%;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.navigationBar .listDiv .options .button {
    outline: none;
    border: none;
    background: transparent;
    width: calc(100% - 10px);
    height: 40px;
    transition-duration: 0.2s;
    display: flex;
    align-items: center;
    border-radius: 10px;
}

.navigationBar .listDiv .options .button:hover {
    background-color: #e2e2e2;
}

.navigationBar #navigation .options .button img {
    width: 30px;
    height: 30px;
    margin-left: 3px;
    margin-right: 3px;
}

.navigationBar .listDiv .options .button .textDiv {
    width: calc(100% - 45px);
    height: 100%;
    margin-left: 5px;
    margin-right: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: RHRCN-H;
    font-size: 15px;
    color: #323232;
    white-space: nowrap;
    overflow: hidden;
    transition-duration: 0.2s;
    opacity: 0;
}

.navigationBar .listDiv .line {
    width: calc(100% - 18px);
    height: 1px;
    background-color: #c9c9c9;
    margin-left: 9px;
    margin-bottom: 5px;
}

.navigationBar #tool {
    width: 100%;
    position: absolute;
    bottom: 0;
}

.navigationBar #tool .options .button img {
    width: 25px;
    height: 25px;
    margin-left: 2.5px;
    margin-right: 2.5px;
}
</style>