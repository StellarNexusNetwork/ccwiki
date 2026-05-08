<template>
  <div class="login">
    <div class="item">
      <label for="email" class="textBox">{{ t("public.login.item.title.email") }}</label>
      <InputText
        id="email"
        v-model="email"
        type="email"
        placeholder="hello@example.com"
        autocomplete="email"
      />
    </div>

    <div class="item">
      <label for="password" class="textBox">{{ t("public.login.item.title.password") }}</label>
      <Password
        inputId="password"
        v-model="password"
        :feedback="false"
        toggleMask
        :placeholder="t('public.login.item.input.password')"
        :inputProps="{ autocomplete: 'current-password' }"
        inputClass="w-full"
      />
    </div>

    <div class="item" style="flex-direction:row;width: 250px;margin-bottom: 7.5px;">
      <Checkbox
        inputId="remember"
        v-model="rememberMe"
        :binary="true"
      />
      <label for="remember" style="margin-left: 10px" class="textBox">
        {{ t("public.login.item.title.remember") }}
      </label>
    </div>

    <div class="Turnstile">
      <Turnstile
        ref="turnstile"
        v-model="captchaToken"
        site-key="0x4AAAAAADLEizNRST-VAJ17"
      />
    </div>

    <Button
      class="w-full"
      :loading="loading"
      :disabled="loading"
      :label="t('public.login.item.title.login')"
      @click="handleSignIn"
    />

    <Divider align="center" type="dotted">
      <b>{{ t("public.login.text.or") }}</b>
    </Divider>

    <Button
      outlined
      :disabled="loading"
      @click="handlePasskey"
    >
      <img src="/static/components/user/logo/svg/passkey.svg" alt="Passkey logo" draggable="false">
      {{ t('public.login.item.title.login.other', {name: 'Passkey'}) }}
    </Button>

    <Button
      outlined
      :disabled="loading"
      @click="handleSocialSignIn('github')"
    >
      <img src="/static/components/user/logo/svg/github.svg" alt="Passkey logo" draggable="false">
      {{ t('public.login.item.title.login.other', {name: 'Github'}) }}
    </Button>

    <div style="margin-bottom: 8px"></div>
    <Divider/>

    <div class="textBox" style="width: 250px;text-align: center">
      <i18n-t keypath="public.login.item.title.builtWith">
        <template #link>
          <a href="https://better-auth.com" target="_blank">
						  <span class="dark:text-white/70 cursor-pointer">
							  better-auth
						  </span>
          </a>
        </template>
      </i18n-t>
    </div>
  </div>
</template>


<script setup lang="ts">
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import {signIn} from "@/utils/auth-client";
import {ref} from "vue";
import {useI18n} from "vue-i18n";
import Turnstile from "vue-turnstile";

const {t} = useI18n();

const email = ref("");
const password = ref("");
const loading = ref(false);
const rememberMe = ref(false);
const captchaToken = ref("");

const turnstile = ref();

const resetCaptcha = () => {
  captchaToken.value = "";
  turnstile.value?.reset();
};

const handleSignIn = async () => {
  try {
    await signIn.email({
      email: email.value,
      password: password.value,
      rememberMe: rememberMe.value,
      fetchOptions: {
        headers: {
          "x-captcha-response": captchaToken.value,
        },
        onRequest: () => {
          loading.value = true;
        },
        onResponse: () => {
          loading.value = false;
          resetCaptcha();
        },
      },
    });
  } catch (err) {
    resetCaptcha();
  }
};

const handlePasskey = async () => {
  await signIn.passkey({
    fetchOptions: {
      onRequest: () => {
        loading.value = true;
      },
      onResponse: () => {
        loading.value = false;
      },
    },
  });
};

const handleSocialSignIn = async (provider: string) => {
  await signIn.social({
    provider,
    callbackURL: window.location.origin,
    fetchOptions: {
      onRequest: () => {
        loading.value = true;
      },
      onResponse: () => {
        loading.value = false;
      },
    },
  });
};
</script>
<style scoped>
.login {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.item {
  display: flex;
  margin-bottom: 15px;
  flex-direction: column;
}

.Turnstile {
  zoom: 0.82;
  margin-bottom: 7.5px;
}

:deep(.p-inputtext, .p-password) {
  width: 250px;
}

:deep(.p-password svg) {
  transform: translateY(-8px);
}

.p-button {
  width: 250px;
  margin-bottom: 8px;
}

.p-divider {
  width: 250px;
  margin-top: 7px;
  margin-bottom: 15px;
}

:deep(.p-divider-content) {
  background: var(--color-background-1);
  color: var(--color-text-body);
}

.textBox {
  color: var(--color-text-body);
  white-space: nowrap;
  overflow: hidden;
}

.p-button img {
  width: 20px;
  height: 20px;
  user-select: none;
  filter: drop-shadow(var(--color-text-title) 250vw 0);
  transform: translateX(-250vw);
}
</style>
