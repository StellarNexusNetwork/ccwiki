<template>
  <div class="navigationBar" :style="navigationBarStyle">
    <div class="listDiv" id="navigation">
      <div class="notNecessary">
        <!--              <div class="options">-->
        <!--                <button class="button" @click="unfold">-->
        <!--                  <img class="b_img" src="/static/components/navigation-bar/svg/fold.svg" alt="SVG Image" draggable="false" style="margin-left: 0;">-->
        <!--                  <div class="textDiv" :style="unfoldStyle">{{ t("public.NavigationBar.unfold") }}</div>-->
        <!--                </button>-->
        <!--              </div>-->
        <div class="options">
          <button class="button">
            <img id="_navigation_AI_svg" src="/static/components/navigation-bar/svg/ai.svg" alt="SVG Image" draggable="false" style="margin-left: 0;">
            <div class="textDiv" :style="unfoldStyle">{{ t("public.NavigationBar.AI") }}</div>
          </button>
        </div>
        <div class="line">
        </div>
      </div>
      <div class="options" v-for="item in navigationBarList" :key="item.name" v-tooltip='t("public.NavigationBar." + item.name)' placeholder="Right">
        <button @click="RouterLinkPush(item.path)">
          <img :src="baseUrl+'static/components/navigation-bar/svg/' + item.name + '.svg'" :alt="item.name" draggable="false">
          <div class="textDiv" :style="unfoldStyle">{{
              t("public.NavigationBar." + item.name)
            }}
          </div>
        </button>
      </div>
      <div class="notNecessary" :style="'display:'+onDev">
        <!--        <div class="options" v-for="item in nNavigationBarList" :key="item.name" v-tooltip='t("public.NavigationBar." + item.name)' placeholder="Right">-->
        <div class="options" v-for="item in nNavigationBarList" :key="item.name">
          <button @click="RouterLinkPush(item.path)">
            <img :src="baseUrl+'static/components/navigation-bar/svg/' + (item.icon ?? item.name) + '.svg'" :alt="item.name" draggable="false">
            <div class="textDiv" :style="unfoldStyle">{{
                t("public.NavigationBar." + item.name)
              }}
            </div>
          </button>
        </div>
      </div>
      <div class="options" v-tooltip='t("public.NavigationBar.others")' placeholder="Right">
        <button @click="RouterLinkPush('/about')">
          <img id="_navigation_others_svg" src="/static/components/navigation-bar/svg/others.svg" alt="SVG Image" draggable="false">
          <div class="textDiv" :style="unfoldStyle">{{ t("public.NavigationBar.others") }}</div>
        </button>
      </div>
      <div class="options" id="setting2" v-tooltip='t("public.NavigationBar.settings")' placeholder="Right">
        <button class="button" @click="openDialog">
          <img id="_navigation_settings_svg" src="/static/components/navigation-bar/svg/settings.svg" alt="SVG Image" draggable="false">
          <div class="textDiv" :style="unfoldStyle">{{ t("public.NavigationBar.settings") }}</div>
        </button>
      </div>
    </div>
    <div class="listDiv" id="tool">
      <UserProfile :unfoldStyle="unfoldStyle" :isACOpen="isACOpen"></UserProfile>
      <div class="options">
        <button class="button" @click="openDialog" v-tooltip='t("public.NavigationBar.settings")' placeholder="Right">
          <img id="_navigation_settings_svg" src="/static/components/navigation-bar/svg/settings.svg" alt="SVG Image" draggable="false">
          <div class="textDiv" :style="unfoldStyle">{{ t("public.NavigationBar.settings") }}</div>
        </button>
      </div>
    </div>
    <AccountSetting :asStyle="asStyle"/>
  </div>
</template>

<script setup lang="ts">
import {reactive, ref, watchEffect} from 'vue';
import {useRouter} from 'vue-router';
import {useWindowStore} from '@/stores/window';
import {eventBus} from '@/utils/eventBus';
import {useI18n} from 'vue-i18n';

import UserProfile from '@/components/user/UserProfile.vue'
import AccountSetting from "@/components/user/AccountSetting.vue";

const {t} = useI18n();

const sysWindows = useWindowStore();

const onDev = ref('');
if (!import.meta.env.DEV) {
  onDev.value = 'none';
}

const baseUrl = import.meta.env.BASE_URL;

const navigationBarList = [
  {'name': 'home', 'path': '/'},
  {'name': 'classification', 'path': '/docs'},
  {'name': 'components', 'path': '/components'},
];

const nNavigationBarList = [
  {'name': '20241108', 'path': '/20241108', 'icon': 'components'},
  {'name': 'eye8', 'path': '/eye8'},
  // {'name': 'chat', 'path': '/chat'}
];

const unfoldStyle = reactive({state: false, opacity: 0, fontSize: '15px'});
const navigationBarStyle = reactive({width: '50px'});


let oldNavigationBarWidth = '50px';
const router = useRouter();

function RouterLinkPush(path: string) {
  router.push(path);
}

// 移动端适配
watchEffect(() => {
  if (sysWindows.enableMobileSupport && navigationBarStyle.width != '100vw') {
    oldNavigationBarWidth = navigationBarStyle.width;
    navigationBarStyle.width = '100vw';
  }
  if (!sysWindows.enableMobileSupport && navigationBarStyle.width == '100vw') {
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

const asStyle = ref({
  opacity: 0,
  display: 'none',
  transform: 'scale(0.85)'
})
const isACOpen = ref(false);

function openAccountSetting() {
  if (isACOpen.value) {
    asStyle.value.opacity = 0;
    asStyle.value.transform = 'scale(0.85)'
    setTimeout(() => {
      asStyle.value.display = 'none'
    }, 300)
  } else {
    asStyle.value.display = 'block';
    setTimeout(() => {
      asStyle.value.opacity = 1;
      asStyle.value.transform = 'scale(1)'
    })
  }
  setTimeout(() => {
    isACOpen.value = !isACOpen.value;
  }, 300)
}

function closeAccountSetting(animation: boolean) {
  asStyle.value.opacity = 0;
  asStyle.value.transform = 'scale(0.85)';
  if (animation) {
    setTimeout(() => {
      asStyle.value.display = 'none'
      isACOpen.value = false;
    }, 300)
  } else {
    asStyle.value.display = 'none';
    isACOpen.value = false;
  }
}

eventBus.on('callOpenAccountSetting', openAccountSetting);
eventBus.on('callCloseAccountSetting', closeAccountSetting);
watchEffect(() => {
  if (sysWindows.enableMobileSupport) {
    closeAccountSetting(false)
  }
})
</script>

<style scoped>
@media (min-width: 670px) {
  .navigationBar {
    top: 42px;
    height: calc(100dvh - 42px);
    padding-top: 5px;
  }

  .navigationBar .listDiv .options {
    margin-bottom: 5px;
    width: 100%;
  }

  .navigationBar #navigation {
    max-height: calc(100% - 95px);
    overflow-y: auto;
  }

  .navigationBar #navigation::-webkit-scrollbar {
    display: none; /* Chrome Safari */
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
    width: 50px;
    height: 50px;
  }

  .navigationBar .listDiv .notNecessary {
    display: none;
  }

  .navigationBar #navigation {
    display: flex;
    justify-content: space-around;
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
