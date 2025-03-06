<template>
    <div class="optionsList">
        <button class="button" @click="switchDetail(0)">
            <div class="title">{{ $t("public.setting.settings") }}</div>
        </button>
        <div class="line"></div>
        <div class="options">
            <button class="button">
                <img src="/static/public/svg/setting/theme.svg" alt="SVG Image" draggable="false">
                <div class="textDiv">{{ $t("public.setting.theme") }}</div>
            </button>
        </div>
        <div class="options">
            <button class="button" @click="switchDetail(1)">
                <img src="/static/public/svg/setting/language.svg" alt="SVG Image" draggable="false">
                <div class="textDiv">{{ $t("public.setting.language") }}</div>
            </button>
        </div>
        <div class="options">
            <button class="button" @click="switchDetail(2)">
                <img src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
                <div class="textDiv">{{ $t("public.setting.test") }}</div>

            </button>
        </div>
    </div>
    <div class="optionsDetail">
        <component :is="components[currentIndex]"></component>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import V_default from './setting/default.vue'
import V_lang from './setting/lang.vue'
import V_test from './setting/test.vue'
import { eventBus } from '@/utils/eventBus'

const components = [V_default, V_lang, V_test]


const currentIndex = ref(0)

eventBus.on('callOpenSettingsDialog2', switchDetail)

function switchDetail(index: any) {
    currentIndex.value = index
}
</script>

<style scoped>
@media (min-width: 615px) {
    .optionsDetail {
        padding-left: 20px;
    }

}

@media (max-width: 615px) {
    .mainDiv {
        padding-left: 5px;
    }

}

.optionsList {
    width: 10vw;
    min-width: 125px;
    height: 100%;
    background-color: #F5F5F5;
    transition-duration: 0.5s;
}

.optionsDetail {
    width: 45vw;
    min-width: 450px;
    height: 100%;
    background: #fafafa;
    transition-duration: 0.5s;
    padding-top: 45px;
    padding-right: 20px;
}

.optionsList .button {
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

.optionsList .title {
    width: 100%;
    height: 45px;
    font-family: RHRCN-M;
    font-size: 20px;
    display: flex;
    align-items: center;
    padding-left: 15px;
}

.optionsList .line {
    width: calc(100% - 18px);
    height: 1px;
    background-color: #c9c9c9;
    margin-left: 9px;
    margin-bottom: 10px;
}

.optionsList .options {
    margin-bottom: 10px;
    width: 100%;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.optionsList .options .button {
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

.optionsList .options .button:hover {
    background-color: #e2e2e2;
}

.optionsList .options .button img {
    width: 25px;
    height: 25px;
}

.optionsList .options .button .textDiv {
    padding-left: 5px;
    height: 100%;
    margin-left: 5px;
    margin-right: 5px;
    display: flex;
    align-items: center;
    font-family: RHRCN-H;
    color: #323232;
    white-space: nowrap;
    overflow: hidden;
    font-size: 15px;
}
</style>