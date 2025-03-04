<template>
    <div class="Div">
        <div class="AboutList">
            <div class="boxDiv">
                <div class="title">条目</div>
                <div class="itemList">
                    <buttom class="item" id="fisrtItem" @click="hello()">
                        <div class="title">测试</div>
                        <div class="introduction">测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试</div>
                        <div class="iconList">
                            <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
                            <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
                            <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
                        </div>
                    </buttom>
                    <buttom class="item" @click="hello()">
                        <div class="title">测试</div>
                        <div class="introduction">测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试</div>
                        <div class="iconList">
                            <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
                            <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
                            <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
                        </div>
                    </buttom>
                    <buttom class="item" @click="hello()">
                        <div class="title">测试</div>
                        <div class="introduction">测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试</div>
                        <div class="iconList">
                            <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
                            <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
                            <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
                        </div>
                    </buttom>
                </div>
            </div>
            <div class="line"></div>
            <div class="boxDiv">
                <div class="title">新闻</div>
                <div class="itemList">
                    <buttom class="item" id="fisrtItem" @click="hello()">
                        <div class="title">测试</div>
                        <div class="introduction">测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试</div>
                        <div class="iconList">
                            <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
                            <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
                            <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
                        </div>
                    </buttom>
                </div>
            </div>
            <div class="line"></div>
            <div class="boxDiv">
                <div class="title">安全</div>
                <div class="itemList">
                    <buttom class="item" id="fisrtItem" @click="hello()">
                        <div class="title">测试</div>
                        <div class="introduction">测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试</div>
                        <div class="iconList">
                            <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
                            <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
                            <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
                        </div>
                    </buttom>
                </div>
            </div>

            <div class="line"></div>
            <Suspense>
                <template #default>
                    <boxDiv />
                </template>
            </Suspense>
        </div>
    </div>
</template>
<script setup lang="ts">
import boxDiv from './boxDiv.vue';
function hello() {
    console.log("hello")
}

</script>
<style scoped>
.Div {
    display: flex;
    justify-content: center;
}

.Div .AboutList {
    width: 95%;
    display: flex;
    flex-direction: column;
    margin-top: 25px;
}

.Div .AboutList .line {
    width: 100%;
    border-top: 0.5px solid #9c9c9c;
    margin-top: 30px;
    margin-bottom: 30px;
}

.Div .AboutList .boxDiv {
    display: flex;
    flex-direction: column;
}

.Div .AboutList .boxDiv .title {
    font-family: MiSans-B;
    font-size: 25px;
    margin-bottom: 5px;
}

.Div .AboutList .boxDiv .itemList {
    display: flex;
}

.Div .AboutList .boxDiv .itemList #fisrtItem {
    margin-left: 0px;
}

.Div .AboutList .boxDiv .itemList .item {
    width: 210px;
    min-width: 180px;
    height: 120px;
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 10px;
    margin-left: 20px;
}

.Div .AboutList .boxDiv .itemList .item .title {
    font-family: MiSans-M;
    font-size: 20px;
    margin-bottom: 0px;
}

.Div .AboutList .boxDiv .itemList .introduction {
    height: 48px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
}

.Div .AboutList .boxDiv .itemList .iconList {
    display: flex;
    height: 20px;
    justify-content: flex-end;
    padding-top: 5px;
}

.Div .AboutList .boxDiv .itemList .icon {
    margin-left: 5px;
}
</style>