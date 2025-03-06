<template>
    <div class="boxDiv" v-if="Error">
        <div class="title">错误</div>
    </div>
    <div class="boxDiv" v-else>
        <div class="title">测试</div>
        <div class="itemList">
            <buttom class="item" :id="index === 0 ? 'fisrtItem' : null" @click="" v-for="(item, index) in dataList">
                <div class="title">{{ item.name }}</div>
                <div class="introduction">{{ item.path }}</div>
                <div class="iconList">
                    <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
                    <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
                    <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
                </div>
            </buttom>
        </div>
    </div>
</template>
<script setup lang="js">
import axios from 'axios'

let dataList = null
let Error = null

await axios.get('https://api.github.com/repos/StellarNexusNetwork/cc.wiki.project.v4.data/contents/d3')
    .then(function (response) {
        // 处理成功情况
        dataList = response.data
    })
    .catch(function (error) {
        // 处理错误情况
        Error = true
        console.log(error);
    });

</script>
<style scoped>
.boxDiv {
    display: flex;
    flex-direction: column;
}

.boxDiv .title {
    font-family: MiSans-B;
    font-size: 25px;
    margin-bottom: 5px;
}

.boxDiv .itemList {
    display: flex;
}

.boxDiv .itemList #fisrtItem {
    margin-left: 0px;
}

.boxDiv .itemList .item {
    width: 210px;
    min-width: 180px;
    height: 120px;
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 10px;
    margin-left: 20px;
}

.boxDiv .itemList .item .title {
    font-family: MiSans-M;
    font-size: 20px;
    margin-bottom: 0px;
}

.boxDiv .itemList .introduction {
    height: 48px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
}

.boxDiv .itemList .iconList {
    display: flex;
    height: 20px;
    justify-content: flex-end;
    padding-top: 5px;
}

.boxDiv .itemList .icon {
    margin-left: 5px;
}
</style>