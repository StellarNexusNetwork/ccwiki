<template>
  <div class="main" :style="asStyle">
    <div class="hello">
      <p>{{ t("public.AccountSetting.hello") }}</p>
      <div class="textBox">
        <Vue3Marquee :duration="5" :pauseOnHover="true" :animateOnOverflowOnly="true" :clone="true">
          <div>{{ session?.data?.user?.name }}</div>
        </Vue3Marquee>
      </div>
    </div>
    <div class="line"></div>
    <div class="option">
      <button class="button" @click="openAccountSetting">
        <img src="/components/user/svg/user.svg" alt="SVG Image" draggable="false" style="transform: translate(-250vw,-2px)">
        <div class="textDiv">{{ t("public.AccountSetting.item.account") }}</div>
      </button>
    </div>
    <div class="option">
      <button class="button" @click="logout">
        <img src="/components/user/svg/logout.svg" alt="SVG Image" draggable="false">
        <div class="textDiv">{{ t("public.AccountSetting.item.logout") }}</div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {authClient} from "@/utils/auth-client.ts";
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import {eventBus} from "@/utils/eventBus.ts";

const router = useRouter();
const {t} = useI18n();

const {asStyle} = defineProps({
  asStyle: Object,
});
const session = authClient.useSession();

function logout() {
  eventBus.emit('callCloseAccountSetting', true);
  authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        router.push("/")
      }
    },
  })
}

const openAccountSetting = () => {
  eventBus.emit('callCloseAccountSetting', true);
  eventBus.emit('callOpenSettingsDialog1');
  eventBus.emit('callOpenSettingsDialog2', 4);
};
</script>


<style scoped>
.main {
  position: absolute;
  left: 60px;
  bottom: 50px;
  background: var(--color-background-2);
  border-radius: 10px;
  border: 2px solid var(--color-border-2);
  width: 200px;
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
  transform-origin: left bottom;
  overflow: hidden;
}

.hello {
  display: flex;
  flex-direction: column;
  margin: 8px;
}

.hello p {
  font-family: RHRCN-H;
  color: var(--color-text-body);
  white-space: nowrap;
  overflow: hidden;
  font-size: 15px;
  transition-duration: 0.3s;
}

.hello .textBox {
  display: block;
  width: 180px;
  font-family: RHRCN-H;
  color: var(--color-text-body);
  white-space: nowrap;
  overflow: hidden;
  font-size: 15px;
  transition-duration: 0.3s;
}

.hello .textBox div {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  margin-right: 25px;
}

.line {
  width: calc(100% - 18px);
  height: 1px;
  background-color: var(--color-border-3);
  margin-left: 9px;
  margin-top: 10px;
  margin-bottom: 10px;
}

.option {
  margin-bottom: 10px;
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.option .button {
  outline: none;
  border: none;
  background: transparent;
  width: calc(100% - 20px);
  height: 40px;
  transition-duration: 0.2s;
  display: flex;
  align-items: center;
  border-radius: 10px;
}

.option .button:hover {
  background-color: var(--color-background-3);
}

.option .button img {
  width: 25px;
  height: 25px;
  user-select: none;
  filter: drop-shadow(var(--color-text-title) 250vw 0);
  transform: translateX(-250vw);
}

.option .button .textDiv {
  padding-left: 5px;
  height: 100%;
  margin-left: 5px;
  margin-right: 5px;
  display: flex;
  align-items: center;
  font-family: RHRCN-H;
  color: var(--color-text-body);
  white-space: nowrap;
  overflow: hidden;
  font-size: 15px;
  transition-duration: 0.3s;
}


</style>
