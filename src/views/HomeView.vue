<template>
    <div class="Div">
        <div class="home">
            <div class="logo">
                <img class='ring' src="/static/home/svg/ring.svg" alt='' width='auto' height='170px' draggable="false">
                <img class='logo_image' src="/static/public/svg/ccwiki_logo0.svg" alt='' width='auto' height='120px' draggable="false">
            </div>
            <div class='newsList'>
                <div class="newsDiv" style="margin-right: 0px;">
                    <img class='image' src="/static/home/svg/NotFind.svg" alt='' draggable="false">
                    <div class="text">无信息</div>
                    <!-- <div class="mainText">暂无信息</div> -->
                </div>
                <div class="newsDiv">
                    <img class='image' src="/static/home/svg/NotFind.svg" alt='' draggable="false">
                    <div class="text">无信息</div>
                    <!-- <div class="mainText">暂无信息</div> -->
                </div>
                <div class="newsDiv">
                    <img class='image' src="/static/home/svg/NotFind.svg" alt='' draggable="false">
                    <div class="text">无信息</div>
                    <!-- <div class="mainText">暂无信息</div> -->
                </div>
                <div class="newsDiv">
                    <img class='image' src="/static/home/svg/NotFind.svg" alt='' draggable="false">
                    <div class="text">无信息</div>
                    <!-- <div class="mainText">暂无信息</div> -->
                </div>
            </div>
            <div class="updataList"></div>
        </div>
    </div>
</template>
<script setup lang="ts">
</script>
<style scoped>
.Div {
    display: flex;
    align-items: center;
    justify-content: center;
}

.home {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 50px;
}

.Div .home .logo {
    user-select: none;
}

.Div .home .logo .ring {
    position: absolute;
    /* animation: 1s linear 0s infinite normal none running init_loading2; */
    animation: init_loading2 3s infinite;
    margin-left: -24px;
    margin-top: -24px;
}

.Div .home .newsList {
    display: flex;
    width: 100%;
    margin-top: 50px;

}

.Div .home .newsList .newsDiv {
    display: flex;
    flex-direction: column;
    border: 1px solid #c9c9c9;
    border-radius: 10px;
    width: 170px;
    /* height: 155px; */
    margin-left: 20px;
}

/* .Div .home .newsList .newsDiv::after {
    content: "";
    width: 160px;
    height: 155px;
    position: absolute;
    margin-top: -155px;
    border-radius: 10px;
    background: linear-gradient(0deg, #12b4ea 0%, rgba(200, 248, 237, 0.3169) 80%, rgba(255, 255, 255, 0) 100%);
    pointer-events: none;
    /* 确保覆盖层不会干扰图片的交互
} */

.Div .home .newsList .newsDiv .image {
    width: 100%;
    height: 100%;
    display: block;
    border-width: 0px 0px 1px 0px;
    border-style: solid;
    border-color: #c9c9c9;
    user-select: none;
}



.Div .home .newsList .newsDiv .text {
    font-family: RHRCN-H;
    font-size: 15px;
    color: #3c3c3c;
    padding-left: 3PX;
    padding-right: 3PX;
    padding-bottom: 2PX;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>