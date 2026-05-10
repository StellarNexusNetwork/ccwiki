<template>
  <div class="error" v-if="isLocalhost">
    <localDisabled/>
  </div>
  <div class="signin" v-else>
    <signInView/>
  </div>
</template>

<script setup lang="ts">
import localDisabled from '@/views/error-views/local-disabled.vue';
import signInView from './SignInView.vue';

const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
</script>

<style scoped>
.error {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.signin {
  width: 100%;
}
</style>
