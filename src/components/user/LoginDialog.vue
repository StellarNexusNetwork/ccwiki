<template>
  <div id="login_dialog" style="display: none">
    <div id="login_Div">
      <div class="login2">
        <div class="login">
          <div style="display: flex;">
            <LoginPage/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginPage from '@/components/user/LoginPage.vue';
import {eventBus} from '@/utils/eventBus';

eventBus.on('callOpenLoginDialog', openDialog);

function openDialog() {
  const loginDialog = document.getElementById('login_dialog');
  const login = document.getElementById('login_Div');

  loginDialog!.style.display = 'block';
  setTimeout(() => {
    loginDialog!.classList.add('show');
    login!.classList.add('show');
  }, 50);
}
</script>

<style scoped>
#login_dialog {
  z-index: 2001;
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  padding: 0;
  border: none;
  backdrop-filter: blur(0px);
  background-color: rgba(0, 0, 0, 0);
  transition-duration: 0.5s;
  overflow: hidden;
}

#login_dialog.show {
  backdrop-filter: blur(8px);
  background-color: rgba(0, 0, 0, 0.15);
  transition-duration: 0.5s;
}

#login_Div {
  width: 100%;
  height: 100%;
  transform: scale(0.85);
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
  opacity: 0;
}

#login_Div.show {
  transform: scale(1);
  opacity: 1;
}

.login2 {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login {
  display: flex;
  min-height: 350px;
  transition-duration: 0.5s;
  border-radius: 10px;
  overflow: hidden;
}
</style>
