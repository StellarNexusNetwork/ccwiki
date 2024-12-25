<template>
    <div class="navigationBar" :style="navigationBarStyle">
        <div class="listDiv" id="navigation">
            <div class="options">
                <button class="button" @click="unfold">
                    <img class="b_img" src="/static/public/svg/navigationBar/fold.svg" alt="SVG Image" draggable="false" style="margin-left: 0px;margin-right: 0px;">
                    <div class="textDiv" :style="unfoldStyle"> 展开 </div>
                </button>
            </div>
            <div class="line">
            </div>
            <!-- <div class="options" v-for="(item, index) in items" :key="index">
                <button class="button" @click="unfold">
                    <img class="b_img" src="../static/public/svg/navigationBar/fold.svg" alt="SVG Image" draggable="false" style="margin-left: 0px;margin-right: 0px;">
                    <div class="textDiv" :style="unfoldStyle"> unfold </div>
                </button>
            </div> -->
            <!-- 先不不急着写 -->

            <div class="options">
                <RouterLink to="/" class="button">
                    <img id="_navigation_home_svg" src="/static/public/svg/navigationBar/home.svg" alt="SVG Image" draggable="false">
                    <div class="textDiv" :style="unfoldStyle">首页</div>
                </RouterLink>
            </div>
            <div class="options">
                <RouterLink to="/classification" class="button">
                    <img id="_navigation_lassification_svg" src="/static/public/svg/navigationBar/classification.svg" alt="SVG Image" draggable="false">
                    <div class="textDiv" :style="unfoldStyle">分类</div>
                </RouterLink>
            </div>
            <div class="options">
                <RouterLink to="/components" class="button">
                    <img id="_navigation_components_svg" src="/static/public/svg/navigationBar/components.svg" alt="SVG Image" draggable="false">
                    <div class="textDiv" :style="unfoldStyle">工具</div>
                </RouterLink>
            </div>
            <div class="options">
                <RouterLink to="/20241108" class="button">
                    <img id="_navigation_components_svg" src="/static/public/svg/navigationBar/20241108.svg" alt="SVG Image" draggable="false">
                    <div class="textDiv" :style="unfoldStyle">**</div>
                </RouterLink>
            </div>
            <div class="options">
                <RouterLink to="/eye8" class="button">
                    <img id="_navigation_components_svg" src="/static/public/svg/navigationBar/8.svg" alt="SVG Image" draggable="false">
                    <div class="textDiv" :style="unfoldStyle">eye8</div>
                </RouterLink>
            </div>
            <div class="options">
                <RouterLink to="/chat" class="button">
                    <img id="_navigation_components_svg" src="/static/public/svg/navigationBar/chat.svg" alt="SVG Image" draggable="false" style="width:20px;height:20px;margin-left: 10px;margin-right: 10px">
                    <div class="textDiv" :style="unfoldStyle">闲聊</div>
                </RouterLink>
            </div>
            <div class="options">
                <button class="button">
                    <img id="_navigation_Co-createdWikiCopilotAI_svg" src="/static/public/svg/navigationBar/Co-createdWikiCopilotAI.svg" alt="SVG Image" draggable="false" style="margin-left: 0px;margin-right: 0px;">
                    <div class="textDiv" :style="unfoldStyle">**</div>
                </button>
            </div>
            <div class="options">
                <RouterLink to="/about" class="button">
                    <img id="_navigation_others_svg" src="/static/public/svg/navigationBar/others.svg" alt="SVG Image" draggable="false">
                    <div class="textDiv" :style="unfoldStyle">关于</div>
                </RouterLink>
            </div>
        </div>
        <div class="listDiv" id="tool">
            <div class="options">
                <button class="button">
                    <img id="_navigation_account_svg" src="/static/public/svg/navigationBar/account.svg" alt="SVG Image" draggable="false">
                    <div class="textDiv" :style="unfoldStyle">账号</div>
                </button>
            </div>
            <div class="options">
                <button class="button" @click="openDialog">
                    <img id="_navigation_settings_svg" src="/static/public/svg/navigationBar/settings.svg" alt="SVG Image" draggable="false">
                    <div class="textDiv" :style="unfoldStyle">设置</div>
                </button>
                <dialog id="setting_dialog">
                    <div class="titleBar_B ">
                        <div class="titleBar2">
                            <titleBar></titleBar>
                        </div>
                    </div>
                    <div id="setting_Div">
                        <div class="setting2">
                            <div class="setting">
                                <div class="winControl">
                                    <button @click="closeDialog">
                                        <img src="/static/public/svg/titleBar/closeApp.svg" alt="SVG Image" draggable="false">
                                    </button>
                                </div>
                                <div style="display: flex;">
                                    <setting></setting>
                                </div>
                            </div>
                        </div>
                    </div>
                </dialog>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import titleBar from './titleBar.vue'
import setting from './setting.vue';
import { reactive } from 'vue'
import { RouterLink } from 'vue-router'
// let navigation = ref([
//     { id: 'home', src: "../static/public/svg/navigationBar/account.svg", text: "" }
// ])
// 别急

let unfoldStyle = reactive({ state: false, opacity: 0, fontSize: '15px' })
let navigationBarStyle = reactive({ width: "50px" })

const props = defineProps({
    mainDivStyle: Object,
    mainStyle: Object
});
const emit = defineEmits(['update:mainDivStyle', 'update:mainStyle']);
const localMainDivStyle = { ...props.mainDivStyle };
const localMainStyle = { ...props.mainStyle };


function unfold() {
    if (unfoldStyle.state) {
        navigationBarStyle.width = "50px";
        localMainDivStyle.paddingLeft = '50px';
        Object.assign(localMainStyle, { width: 'calc(100vw - 50px)', position: 'fixed', right: '0' });
        emit('update:mainDivStyle', localMainDivStyle);
        emit('update:mainStyle', localMainStyle);
        setTimeout(() => {
            unfoldStyle.opacity = 0;
        }, 100);
        setTimeout(() => {
            Object.assign(localMainStyle, { position: 'static', right: 'Auto' });
            emit('update:mainStyle', { ...props.mainStyle });
        }, 300);
        unfoldStyle.state = false;
    } else {
        navigationBarStyle.width = "95px";
        localMainDivStyle.paddingLeft = '95px';
        Object.assign(localMainStyle, { width: 'calc(100vw - 95px)', position: 'fixed', right: '0' });
        emit('update:mainDivStyle', localMainDivStyle);
        emit('update:mainStyle', localMainStyle);
        setTimeout(() => {
            unfoldStyle.opacity = 1;
        }, 100);
        setTimeout(() => {
            Object.assign(localMainStyle, { position: 'static', right: 'Auto' });
            emit('update:mainStyle', { ...props.mainStyle });
        }, 300);
        unfoldStyle.state = true;
    }
}

function openDialog() {
    const dialog = document.getElementById("setting_dialog") as HTMLDialogElement;
    const setting = document.getElementById("setting_Div");
    dialog.style.pointerEvents = "auto";
    dialog.showModal(); // 打开对话框
    dialog.classList.add("show"); // 添加动画类
    setting!.classList.add("show");
}

function closeDialog() {
    const dialog = document.getElementById("setting_dialog") as HTMLDialogElement;
    const setting = document.getElementById("setting_Div");
    dialog.classList.remove("show"); // 移除动画类
    setting!.classList.remove("show");
    dialog.style.pointerEvents = "none";
    setTimeout(() => dialog!.close(), 300); // 等待动画结束后关闭对话框
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
    margin-left: 5px;
    margin-right: 5px;
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
    color: #323232;
    white-space: nowrap;
    overflow: hidden;
    transition-duration: 0.2s;
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
    background-color: #F5F5F5;
}

.navigationBar #tool .options .button img {
    width: 25px;
    height: 25px;
    margin-left: 2.5px;
    margin-right: 2.5px;
}

#setting_dialog {
    pointer-events: none;
    position: fixed;
    inset: 0;
    /* 等效于 top: 0; left: 0; right: 0; bottom: 0; */
    width: calc(100vw - 100px);
    /* 确保宽度100% */
    height: calc(100vh - 100px);
    /* 确保高度100% */
    margin-top: 50px;
    margin-left: 50px;
    /* 移除默认外边距 */
    padding: 0;
    /* 移除内边距（如不需要） */
    border: none;
    /* 去除默认边框 */
    /* 白色背景，略带透明效果 */
    background-color: rgba(0, 0, 0, 0);
    transition-duration: 0.5s;
    overflow: hidden;
}


#setting_dialog.show::backdrop {
    backdrop-filter: blur(8px);
    background-color: rgba(0, 0, 0, 0.15);
}

#setting_dialog::backdrop {
    width: 100%;
    transition-duration: 0.3s;
    background-color: rgba(0, 0, 0, 0);
    backdrop-filter: blur(0px);
    padding: 0;
}

#setting_Div {
    width: 100%;
    height: 100%;
    transform: scale(0.85);
    transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
    opacity: 0;
}

#setting_Div.show {
    transform: scale(1);
    opacity: 1;
}

.titleBar_B {
    height: 42px;
    width: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    background-color: #F5F5F5;
}

.titleBar {
    width: 100vw;
    height: 42px;
    user-select: none;
    transition-duration: 0.3s;
    position: fixed;
    top: 0;
    left: 0;
}

@media (min-width: 670px) {
    #setting_Div .winControl {
        min-width: 575px;
        width: 55vw;
    }
}

@media (max-width: 670px) {
    #setting_Div .winControl {
        width: calc(100vw - 100px);
    }
}

#setting_Div .winControl {
    position: absolute;
    display: flex;
    justify-content: flex-end;
    padding-top: 10px;
    padding-right: 10px;
    transition-duration: 0.5s;
}


#setting_Div .winControl button {
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
}

#setting_Div .winControl button:hover {
    background-color: #e2e2e2;
    border-radius: 10px;
    overflow: hidden;
}

#setting_Div .winControl button img {
    width: 20px;
    height: 20px;
    user-select: none;
}

.setting2 {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.setting {
    display: flex;
    height: 60vh;
    min-height: 350px;
    transition-duration: 0.5s;
    border-radius: 10px;
    overflow: hidden;
}
</style>