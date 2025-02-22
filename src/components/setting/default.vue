<template>
    <div class="mainDiv">
        <div class="div">
            <img id="_navigation_settings_svg" src="/static/public/svg/setting/setting.svg" alt="SVG Image" draggable="false">
            <div class="title" id="title">CC Wiki project</div>
            <div class="title" id="title_m">CC Wiki</div>
            <div id="detiails">
                <div class="data">版本号: 开发中...</div>
                <div class="data">更新日期: ****</div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
</script>
<style scoped>
@media (min-width: 670px) {
    .mainDiv .div #title_m {
        display: none;
    }
}

@media (max-width: 670px) {
    .mainDiv .div #title {
        display: none;
    }
}

@media (max-width: 615px) {
    .mainDiv {
        width: 60vw;
    }

}

.mainDiv {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.mainDiv .div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.mainDiv .div img {
    width: 80px;
    height: 80px;
}

.mainDiv .div .title {
    margin-top: 10px;
    font-family: RHRCN-H;
    font-size: 35px;
    color: #AFAFAF;
}

.mainDiv .div #detiails {
    margin-top: 10px;
    margin-bottom: 50px;
    color: #AFAFAF;
    font-family: RHRCN-N;
}
</style>