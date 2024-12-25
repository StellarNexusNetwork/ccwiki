<template>
    <div class="optionsList">
        <div class="title">设置</div>
        <div class="line"></div>
        <div class="options">
            <button class="button">
                <img id="_navigation_Co-createdWikiCopilotAI_svg" src="/static/public/svg/setting/theme.svg" alt="SVG Image" draggable="false">
                <div class="textDiv">个性化</div>
            </button>
        </div>
        <div class="options">
            <button class="button">
                <img id="_navigation_Co-createdWikiCopilotAI_svg" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
                <div class="textDiv">Test</div>
            </button>
        </div>
    </div>
    <div class="optionsDetail">
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
</script>

<style scoped>
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