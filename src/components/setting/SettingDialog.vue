<template>
  <div id="setting_dialog" style="display: none">
    <div id="setting_Div">
      <div class="setting2">
        <div class="setting">
          <div style="display: flex;">
            <SettingPage/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SettingPage from './SettingPage.vue';
import {eventBus} from '@/utils/eventBus';

eventBus.on('callOpenSettingsDialog1', openDialog);

function openDialog() {
  const settingDialog = document.getElementById('setting_dialog');
  const setting = document.getElementById('setting_Div');

  settingDialog!.style.display = 'block';
  setTimeout(() => {
    settingDialog!.classList.add('show');
    setting!.classList.add('show');
  }, 50);
};
</script>

<style scoped>
@media (min-width: 670px) {
  #setting_dialog {
    height: 100vh;
  }
}

@media (max-width: 670px) {
  #setting_dialog {
    height: calc(100vh - 50px);
  }
}

#setting_dialog {
  z-index: 2001;
  position: fixed;
  inset: 0;
  width: 100vw;
  padding: 0;
  border: none;
  backdrop-filter: blur(0px);
  background-color: rgba(0, 0, 0, 0);
  transition-duration: 0.5s;
  overflow: hidden;
}

#setting_dialog.show {
  backdrop-filter: blur(8px);
  background-color: rgba(0, 0, 0, 0.15);
  transition-duration: 0.5s;
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
