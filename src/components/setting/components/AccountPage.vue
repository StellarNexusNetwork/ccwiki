<template>
  <div class="main">
    <transition name="fade" mode="out-in">
      <component :is="components[currentIndex]"></component>
    </transition>
  </div>
</template>

<script setup lang="ts">
import account from "./AccountPage/AccountInfo.vue";
import login from '@/../src/views/sign-in/sign-in.vue';
import {ref, watchEffect} from "vue";
import {authClient} from "@/utils/auth-client.ts";

const session = authClient.useSession();

const components = [account, login];
const currentIndex = ref(0);

watchEffect(() => {
  currentIndex.value = session.value.data ? 0 : 1;
});

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(25px) scale(0.9);
}
</style>
