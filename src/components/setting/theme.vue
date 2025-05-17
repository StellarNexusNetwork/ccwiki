<template>
  <div>
    <div class="title">{{ $t("public.setting.themeDetail.appearance.title") }}</div>
    <div class="optionList">
      <div class="optionBox" v-for="(item, index) in appearanceOptions">
        <div class="option" :id="index === 0 ? 'firstItem' : undefined" @click="setAppearance(index)" :style="appearanceActive[index]">
          <img class="b_img" :src="baseUrl+'static/public/svg/setting/theme/'+item" alt="SVG Image" draggable="false" style="margin-left: 0;">
        </div>
        <div class="text" :style="appearanceTextActive[index]">
          {{ $t("public.setting.themeDetail.appearance." + item.slice(0, -4)) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useSettingStore} from '@/stores/setting';
import {ref, watchEffect} from "vue"

const baseUrl = import.meta.env.BASE_URL

let appearanceOptions = ['auto.svg', 'light.svg', 'dark.svg']
let appearanceActive = ref([{'border': 'none'}, {'border': 'none'}, {'border': 'none'}])
let appearanceTextActive = ref([{'color': 'var(--color-text-body)'}, {'color': 'var(--color-text-body)'}, {'color': 'var(--color-text-body)'}])

function setAppearance(index: number) {
  useSettingStore().setting.theme.appearance = appearanceOptions[index].slice(0, -4);
}

watchEffect(() => {
  let index
  appearanceActive.value = [{'border': 'none'}, {'border': 'none'}, {'border': 'none'}]
  appearanceTextActive.value = [{'color': 'var(--color-text-body)'}, {'color': 'var(--color-text-body)'}, {'color': 'var(--color-text-body)'}]
  if (useSettingStore().setting.theme.appearance === 'light') {
    index = 1;
  } else if (useSettingStore().setting.theme.appearance === 'dark') {
    index = 2;
  } else {
    index = 0;
  }
  appearanceActive.value[index]['border'] = '5px solid var(--color-information-active)';
  appearanceTextActive.value[index]['color'] = 'var(--color-information-active)';
})


</script>

<style scoped>

.title {
  font-size: 17px;
  color: var(--color-text-title);
  margin-bottom: 5px;
  transition-duration: 0.3s;
}

.optionList {
  display: flex;
  flex-wrap: wrap;
}

.optionList .optionBox {
  display: flex;
  flex: 1 1 100px;
  flex-direction: column;
  max-width: 200px;
}

.optionList .optionBox .text {
  width: 100%;
  margin-top: 5px;
  text-align: center;
  transition-duration: 0.25s;
}

.optionList .optionBox .option {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 15px;
  transition-duration: 0.25s;
  padding: 6px;
}


.optionList .optionBox .option img {
  width: 100%;
  height: auto;
  user-select: none;
}

</style>