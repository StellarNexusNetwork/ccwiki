<template>
  <div>
    <div class="accountInfo">
      <img class="session" v-if="session?.data?.user?.image" :src="session.data.user.image" alt="User Avatar" draggable="false">
      <div class="hello">
        <p id="hello">{{ t("public.setting.account.hello") }}</p>
        <div class="textBox">
          <div>{{ session?.data?.user?.name }}</div>
        </div>
      </div>
    </div>
    <Button
      outlined
      @click="logout"
    >
      <img src="/components/user/svg/logout.svg" alt="Log out logo" draggable="false">
      {{ t('public.setting.account.logout') }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import {authClient} from "@/utils/auth-client.ts";
import {useI18n} from "vue-i18n";
import {eventBus} from "@/utils/eventBus.ts";
import {useRouter} from "vue-router";

const {t} = useI18n();

const session = authClient.useSession();

const router = useRouter();

function logout() {
  eventBus.emit('switchAccountPage', 1);
  authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        router.push("/")
      }
    },
  })
}

</script>

<style scoped>
.accountInfo {
  display: flex;
  width: 100%;
  align-items: center;
  margin-bottom: 20px;
}

.accountInfo img {
  width: 100px;
  height: 100px;
  border-radius: 15%;
  border: 3px solid var(--color-border-2);
}

.hello {
  height: 100px;
  margin-left: 10px;
  padding: 10px;
}

.hello #hello {
  font-size: 25px;
  font-weight: 600;
  color: var(--color-text-body);
}

.hello .textBox {
  font-size: 20px;
  color: var(--color-text-body);
}

.p-button img {
  width: 25px;
  height: 25px;
  user-select: none;
  filter: drop-shadow(var(--color-text-title) 250vw 0);
  transform: translateX(-250vw);
}
</style>
