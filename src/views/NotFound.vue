<template>
    <div class="Div">
        <div class="notFound">
            <div class="imgAndTitle">
                <img src="/static/public/svg/NotFound.svg" alt="SVG Image" draggable="false">
                啊哦，没有找到页面哦！
            </div>
            <div class="textDiv">
                <div class="suggestion">您正在跳转的页面未在路由中注册，请检查您正在访问的URL!</div>
                <div class="errorCode">404 Not Found</div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
</script>
<style scoped>
.Div {
    display: flex;
    justify-content: center;
    align-items: center;
}

.Div .notFound {
    display: flex;
    flex-direction: column;
    margin-top: 40px;
}

.Div .notFound .imgAndTitle {
    display: flex;
    align-items: center;
    font-family: RHRCN-H;
    font-size: 40px;
    color: #3c3c3c;
}

.Div .notFound .imgAndTitle img {
    width: 150px;
    height: 150px;
    margin-right: 30px;
}

.Div .notFound .textDiv {
    margin-top: 40px;
}

.Div .notFound .textDiv .suggestion {
    font-family: RHRCN-M;
    font-size: 20px;
    color: #898989;
}

.Div .notFound .textDiv .errorCode {
    font-family: RHRCN-N;
    font-size: 15px;
    color: #979797;
}
</style>
