<template>
  <div class="navigationBar" :style="navigationBarStyle">
    <div class="listDiv" id="navigation">
      <div class="notNecessary">
        <!--              <div class="options">-->
        <!--                <button class="button" @click="unfold">-->
        <!--                  <img class="b_img" src="/static/public/svg/navigationBar/fold.svg" alt="SVG Image" draggable="false" style="margin-left: 0;">-->
        <!--                  <div class="textDiv" :style="unfoldStyle">{{ $t("public.navigationBar.unfold") }}</div>-->
        <!--                </button>-->
        <!--              </div>-->
        <div class="options">
          <button class="button">
            <img id="_navigation_AI_svg" src="/static/public/svg/navigationBar/AI.svg" alt="SVG Image" draggable="false" style="margin-left: 0;">
            <div class="textDiv" :style="unfoldStyle">{{ $t("public.navigationBar.AI") }}</div>
          </button>
        </div>
        <div class="line">
        </div>
      </div>
      <div class="options" v-for="item in navigationBarList" :key="item.name" v-tooltip='$t("public.navigationBar." + item.name)' placeholder="Right">
        <button @click="RouterLinkPush(item.path)">
          <img :src="baseUrl+'static/public/svg/navigationBar/' + item.name + '.svg'" :alt="item.name" draggable="false">
          <div class="textDiv" :style="unfoldStyle">{{ $t("public.navigationBar." + item.name) }}</div>
        </button>
      </div>
      <div class="notNecessary" :style="'display:'+onDev">
        <!--        <div class="options" v-for="item in nNavigationBarList" :key="item.name" v-tooltip='$t("public.navigationBar." + item.name)' placeholder="Right">-->
        <div class="options" v-for="item in nNavigationBarList" :key="item.name">
          <button @click="RouterLinkPush(item.path)">
            <img :src="baseUrl+'static/public/svg/navigationBar/' + item.name + '.svg'" :alt="item.name" draggable="false">
            <div class="textDiv" :style="unfoldStyle">{{ $t("public.navigationBar." + item.name) }}</div>
          </button>
        </div>
      </div>
      <div class="options" v-tooltip='$t("public.navigationBar.others")' placeholder="Right">
        <button @click="RouterLinkPush('/about')">
          <img id="_navigation_others_svg" src="/static/public/svg/navigationBar/others.svg" alt="SVG Image" draggable="false">
          <div class="textDiv" :style="unfoldStyle">{{ $t("public.navigationBar.others") }}</div>
        </button>
      </div>
      <div class="options" id="setting2" v-tooltip='$t("public.navigationBar.settings")' placeholder="Right">
        <button class="button" @click="openDialog">
          <img id="_navigation_settings_svg" src="/static/public/svg/navigationBar/settings.svg" alt="SVG Image" draggable="false">
          <div class="textDiv" :style="unfoldStyle">{{ $t("public.navigationBar.settings") }}</div>
        </button>
      </div>
    </div>
    <div class="listDiv" id="tool">
      <div class="options" v-tooltip='$t("public.navigationBar.account")' placeholder="Right">
        <button class="button">
          <img id="_navigation_account_svg" src="/static/public/svg/navigationBar/account.svg" alt="SVG Image" draggable="false">
          <div class="textDiv" :style="unfoldStyle">{{ $t("public.navigationBar.account") }}</div>
        </button>
      </div>
      <div class="options">
        <button class="button" @click="openDialog" v-tooltip='$t("public.navigationBar.settings")' placeholder="Right">
          <img id="_navigation_settings_svg" src="/static/public/svg/navigationBar/settings.svg" alt="SVG Image" draggable="false">
          <div class="textDiv" :style="unfoldStyle">{{ $t("public.navigationBar.settings") }}</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {reactive, ref, watchEffect} from 'vue';
import {useRouter} from 'vue-router';
import {useWindowStore} from '@/stores/window';
import {eventBus} from '@/utils/eventBus';

let onDev = ref('');
if (!import.meta.env.DEV) {
  onDev.value = 'none';
}

const baseUrl = import.meta.env.BASE_URL;

let navigationBarList = [
  {'name': 'home', 'path': '/'},
  {'name': 'classification', 'path': '/classification'},
  {'name': 'components', 'path': '/components'},
];

let nNavigationBarList = [
  {'name': '20241108', 'path': '/20241108'},
  {'name': 'eye8', 'path': '/eye8'},
  // {'name': 'chat', 'path': '/chat'}
];

let unfoldStyle = reactive({state: false, opacity: 0, fontSize: '15px'});
let navigationBarStyle = reactive({width: '50px'});


let oldNavigationBarWidth = '50px';
const router = useRouter();

function RouterLinkPush(path: string) {
  router.push(path);
}

// 移动端适配
watchEffect(() => {
  if (useWindowStore().windowWidth < 670 && navigationBarStyle.width != '100vw') {
    oldNavigationBarWidth = navigationBarStyle.width;
    navigationBarStyle.width = '100vw';
  }
  if (useWindowStore().windowWidth >= 670 && navigationBarStyle.width == '100vw') {
    navigationBarStyle.width = oldNavigationBarWidth;
  }
});


const props = defineProps({
  mainDivStyle: Object,
  mainStyle: Object
});
const emit = defineEmits(['update:mainDivStyle', 'update:mainStyle']);
const localMainDivStyle = {...props.mainDivStyle};
const localMainStyle = {...props.mainStyle};


function unfold() {
  if (unfoldStyle.state) {
    navigationBarStyle.width = '50px';
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
    navigationBarStyle.width = '95px';
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

// 弹出设置页面
const openDialog = () => {
  eventBus.emit('callOpenSettingsDialog1');
};
</script>

<style scoped>
@media (min-width: 670px) {
  .navigationBar {
    top: 42px;
    height: calc(100vh - 42px);
    padding-top: 5px;
  }

  .navigationBar .listDiv .options {
    margin-bottom: 5px;
  }

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
}

@media (max-width: 670px) {
  .navigationBar {
    bottom: 0;
    height: 50px;
  }

  .navigationBar .listDiv .options {
    margin-top: 5px;
  }

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
}

.navigationBar {
  position: fixed;
  left: 0;
  user-select: none;
  transition-duration: 0.3s;
  z-index: 2000;
  background-color: var(--color-background-2);
}

.navigationBar .listDiv .options {
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
</style>