<template>
  <div class="options" v-tooltip="!isACOpen ? (session?.data?.user?.name || t('public.NavigationBar.login')) : null" placeholder="Right">
    <button class="button" @click="clickAccount">
      <img class="session" v-if="session?.data?.user?.image" :src="session.data.user.image" alt="User Avatar" draggable="false">
      <img class="svg" v-else id="_navigation_account_svg" src="/static/components/navigation-bar/svg/account.svg" alt="sign in" draggable="false">
      <div class="textDiv" :style="unfoldStyle">{{ t("public.NavigationBar.login") }}</div>
    </button>
  </div>
</template>

<script setup lang="ts">
import {useI18n} from 'vue-i18n';
import {authClient} from "@/utils/auth-client.ts"
import {eventBus} from "@/utils/eventBus.ts";
import {toRefs} from "vue";

const {t} = useI18n();
const props = defineProps({
  unfoldStyle: Object,
  isACOpen: Boolean
})

const {unfoldStyle, isACOpen} = toRefs(props);

const session = authClient.useSession();

function clickAccount() {
  if (session.value.data) {
    eventBus.emit('callOpenAccountSetting');
  } else {
    eventBus.emit('callOpenLoginDialog');
  }
}
</script>

<style scoped>
@media (min-width: 670px) {
  .options {
    margin-bottom: 5px;
  }

  .options {
    width: 100%;
  }
}

@media (max-width: 670px) {
  .options {
    margin-top: 5px;
    width: 50px;
    height: 50px;
  }
}

.options {
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.options button {
  outline: none;
  border: none;
  background: transparent;
  width: calc(100% - 10px);
  height: 40px;
  transition-duration: 0.2s;
  display: flex;
  align-items: center;
  border-radius: 10px;
  padding-left: 5px;
}

.options button:hover {
  background-color: var(--color-background-3);
  transition-duration: 0.2s;
}

.options button img.session {
  width: 30px;
  height: 30px;
  border-radius: 5px;
  border: 3px solid var(--color-border-2);
  transition-duration: 0.2s;
}

.options button:hover img.session {
  border: none;
  transition-duration: 0.2s;
}

.options button img.svg {
  width: 25px;
  height: 25px;
  margin-left: 2.5px;
  margin-right: 2.5px;
  filter: drop-shadow(var(--color-text-title) 250vw 0);
  transform: translateX(-250vw);
}

.options button .textDiv {
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
  transition-duration: 0.3s;
}
</style>
