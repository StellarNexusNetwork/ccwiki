<template>
  <div class="navigationBar" :style="navigationBarStyle">
    <div class="listDiv" id="navigation">
      <div class="notNecessary">
        <div class="options">
          <button class="button" @click="unfold">
            <img class="b_img" src="/static/public/svg/navigationBar/fold.svg" alt="SVG Image" draggable="false" style="margin-left: 0;">
            <div class="textDiv" :style="unfoldStyle">{{ $t("public.navigationBar.unfold") }}</div>
          </button>
        </div>
        <div class="line">
        </div>
      </div>
      <div class="options" v-for="item in navigationBarList">
        <button @click="RouterLinkPush(item.path)">
          <img :src="baseUrl+'static/public/svg/navigationBar/' + item.name + '.svg'" :alt="item.name" draggable="false">
          <div class="textDiv" :style="unfoldStyle">{{ $t("public.navigationBar." + item.name) }}</div>
        </button>
      </div>
      <div class="notNecessary">
        <div class="options" v-for="item in nNavigationBarList">
          <button @click="RouterLinkPush(item.path)">
            <img :src="baseUrl+'static/public/svg/navigationBar/' + item.name + '.svg'" :alt="item.name" draggable="false">
            <div class="textDiv" :style="unfoldStyle">{{ $t("public.navigationBar." + item.name) }}</div>
          </button>
        </div>
        <div class="options">
          <button class="button">
            <img id="_navigation_Co-createdWikiCopilotAI_svg" src="/static/public/svg/navigationBar/Co-createdWikiCopilotAI.svg" alt="SVG Image" draggable="false" style="margin-left: 0;">
            <div class="textDiv" :style="unfoldStyle">{{ $t("public.navigationBar.AI") }}</div>
          </button>
        </div>
      </div>
      <div class="options">
        <button @click="RouterLinkPush('/about')">
          <img id="_navigation_others_svg" src="/static/public/svg/navigationBar/others.svg" alt="SVG Image" draggable="false">
          <div class="textDiv" :style="unfoldStyle">{{ $t("public.navigationBar.others") }}</div>
        </button>
      </div>
      <div class="options" id="setting2">
        <button class="button" @click="openDialog">
          <img id="_navigation_settings_svg" src="/static/public/svg/navigationBar/settings.svg" alt="SVG Image" draggable="false">
          <div class="textDiv" :style="unfoldStyle">{{ $t("public.navigationBar.settings") }}</div>
        </button>
      </div>
    </div>
    <div class="listDiv" id="tool">
      <div class="options">
        <button class="button">
          <img id="_navigation_account_svg" src="/static/public/svg/navigationBar/account.svg" alt="SVG Image" draggable="false">
          <div class="textDiv" :style="unfoldStyle">{{ $t("public.navigationBar.account") }}</div>
        </button>
      </div>
      <div class="options">
        <button class="button" @click="openDialog">
          <img id="_navigation_settings_svg" src="/static/public/svg/navigationBar/settings.svg" alt="SVG Image" draggable="false">
          <div class="textDiv" :style="unfoldStyle">{{ $t("public.navigationBar.settings") }}</div>
        </button>
      </div>
    </div>
    <dialog id="setting_dialog">
      <div class="titleBar_B ">
        <div class="titleBar2">
          <titleBar></titleBar>
        </div>
      </div>
      <notice/>
      <div id="setting_Div">
        <div class="setting2">
          <div class="setting">
            <div style="display: flex;">
              <setting></setting>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import titleBar from './titleBar.vue'
import setting from './setting.vue';
import notice from './notice/index.vue'
import {reactive, watchEffect} from 'vue'
import {useRouter} from 'vue-router'
import {eventBus} from '@/utils/eventBus';
import {useWindowStore} from '@/stores/window'

const baseUrl = import.meta.env.BASE_URL

let navigationBarList = [
  {"name": "home", "path": "/"},
  {"name": "classification", "path": "/classification"},
  {"name": "components", "path": "/components"},

]

let nNavigationBarList = [
  {"name": "20241108", "path": "/20241108"},
  {"name": "eye8", "path": "/eye8"},
  {"name": "chat", "path": "/chat"}
]

let unfoldStyle = reactive({state: false, opacity: 0, fontSize: '15px'})
let navigationBarStyle = reactive({width: "50px"})


let oldNavigationBarWidth = '50px'
const router = useRouter()

function RouterLinkPush(path: string) {
  router.push(path)
}

// 移动端适配
watchEffect(() => {
  if (useWindowStore().windowWidth < 670 && navigationBarStyle.width != "100vw") {
    oldNavigationBarWidth = navigationBarStyle.width
    navigationBarStyle.width = "100vw";
  }
  if (useWindowStore().windowWidth >= 670 && navigationBarStyle.width == "100vw") {
    navigationBarStyle.width = oldNavigationBarWidth
  }
})


const props = defineProps({
  mainDivStyle: Object,
  mainStyle: Object
});
const emit = defineEmits(['update:mainDivStyle', 'update:mainStyle']);
const localMainDivStyle = {...props.mainDivStyle};
const localMainStyle = {...props.mainStyle};


function unfold() {
  if (unfoldStyle.state) {
    navigationBarStyle.width = "50px";
    localMainDivStyle.paddingLeft = '50px';
    Object.assign(localMainStyle, {width: 'calc(100vw - 50px)', position: 'fixed', right: '0'});
    emit('update:mainDivStyle', localMainDivStyle);
    emit('update:mainStyle', localMainStyle);
    setTimeout(() => {
      unfoldStyle.opacity = 0;
    }, 100);
    setTimeout(() => {
      Object.assign(localMainStyle, {position: 'static', right: 'Auto'});
      emit('update:mainStyle', {...props.mainStyle});
    }, 300);
    unfoldStyle.state = false;
  } else {
    navigationBarStyle.width = "95px";
    localMainDivStyle.paddingLeft = '95px';
    Object.assign(localMainStyle, {width: 'calc(100vw - 95px)', position: 'fixed', right: '0'});
    emit('update:mainDivStyle', localMainDivStyle);
    emit('update:mainStyle', localMainStyle);
    setTimeout(() => {
      unfoldStyle.opacity = 1;
    }, 100);
    setTimeout(() => {
      Object.assign(localMainStyle, {position: 'static', right: 'Auto'});
      emit('update:mainStyle', {...props.mainStyle});
    }, 300);
    unfoldStyle.state = true;
  }
}

eventBus.on('callOpenSettingsDialog1', openDialog)

function openDialog() {
  const dialog = document.getElementById("setting_dialog") as HTMLDialogElement;
  const setting = document.getElementById("setting_Div");
  dialog.style.pointerEvents = "auto";
  dialog.showModal(); // 打开对话框
  dialog.classList.add("show"); // 添加动画类
  setting!.classList.add("show");
}
</script>

<style scoped>
.navigationBar .listDiv .options {
  margin-bottom: 5px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.navigationBar .listDiv .options button {
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

.navigationBar .listDiv .options button:hover {
  background-color: var(--color-background-3);
}

.navigationBar #navigation .options button img {
  width: 30px;
  height: 30px;
  filter: drop-shadow(var(--color-text-title) 250vw 0);
  transform: translateX(-250vw);
}

.navigationBar .listDiv .options button .textDiv {
  width: calc(100% - 45px);
  height: 100%;
  margin-left: 5px;
  margin-right: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: RHRCN-H;
  color: var(--color-text-title);
  white-space: nowrap;
  overflow: hidden;
  transition-duration: 0.2s;
}

.navigationBar .listDiv .line {
  width: calc(100% - 18px);
  height: 1px;
  background-color: var(--color-border-3);
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
  filter: drop-shadow(var(--color-text-title) 250vw 0);
  transform: translateX(-250vw);
}

#setting_dialog {
  pointer-events: none;
  position: fixed;
  inset: 0;
  /* 确保宽度100% */
  height: calc(100vh - 100px);
  /* 确保高度100% */
  margin-top: 50px;
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
  background-color: var(--color-background-2);
  transition-duration: 0.3s;
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
  .navigationBar #navigation {
    max-height: calc(100% - 95px);
    overflow-y: auto;
  }

  .navigationBar #navigation::-webkit-scrollbar {
    display: none; /* Chrome Safari */
  }

  .navigationBar .listDiv .options {
    width: 100%;
  }

  #setting2 {
    display: none;
  }

  #setting_dialog {
    width: calc(100vw - 100px);
    margin-left: 50px;
  }
}

@media (max-width: 670px) {
  .navigationBar .listDiv .notNecessary {
    display: none;
  }

  .navigationBar #navigation {
    display: flex;
    justify-content: space-around;
  }

  .navigationBar .listDiv .options {
    width: 50px;
    height: 50px;
  }

  .navigationBar #tool {
    display: none;
  }

  .titleBar_B {
    display: none;
  }

  #setting_dialog {
    width: calc(100vw - 40px);
    margin-left: 20px;
  }
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