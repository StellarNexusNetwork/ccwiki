<template>
    <div class="Div">
        <div class="notFound">
            <div class="imgAndTitle">
                <img :src="imgsrc" alt="SVG Image" draggable="false">
                {{ text }}
            </div>
            <div class="textDiv">
                <button @click="clickCancel()" class="cancel" :style="'width:' + cancel.width + 'px;height:' + cancel.height + 'px;display:' + cancel.display">
                    <div class="Text">取消</div>
                </button>
                <button @click="clickUninstall()" class="uninstall" :style="'width:' + uninstall.width + 'px;height:' + uninstall.height + 'px;display:' + uninstall.display">
                    <div class="Text">卸载</div>
                </button>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
let counter = 0
let imgsrc = ref("/static/public/svg/NotFound.svg")
let text = ref("真的要卸载吗？ /(ㄒoㄒ)/~~")
let textList = ['是... 是点错了吧...', '你... 为什么还要点？...', '真的要离开我吗...', '离开我有什么好的？！', '这是你最后的机会咯！', '❤️你跑不掉的❤️，❤️乖乖取消吧❤️！']

let cancel = ref({
    "width": 160,
    "height": 50,
    "display": "flex"
})
let uninstall = ref({
    "width": 160,
    "height": 50,
    "display": "flex"
})

function clickUninstall() {
    uninstall.value.width *= 0.95
    uninstall.value.height *= 0.95
    cancel.value.width *= 1.3
    cancel.value.height *= 1.3
    text.value = textList[counter]
    counter += 1
    if (counter == 6) {
        uninstall.value.display = "none"
    }
}
function clickCancel() {
    uninstall.value.display = "none"
    cancel.value.display = "none"
    imgsrc.value = "/static/public/svg/ccwiki_logo0.svg"
    text.value = "太好了，要和我过一辈子哦！❤️"
}

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
    display: flex;
    justify-content: space-around;
}

.Div .notFound .textDiv button {

    outline: none;
    background: transparent;
    width: calc(100% - 10px);
    height: 40px;
    transition-duration: 0.2s;
    align-items: center;
    border-radius: 15px;
    align-items: center;
    justify-content: center;

}

.Div .notFound .textDiv button .Text {
    font-family: RHRCN-H;
    font-size: 20px;
}

.Div .notFound .textDiv .cancel {
    border: none;
    background-color: #04AAEB;
    max-width: 686.17px;
}

.Div .notFound .textDiv .cancel:hover {
    background-color: #0094d4;
}

.Div .notFound .textDiv .cancel .Text {
    color: #fafafa;
}

.Div .notFound .textDiv .uninstall {
    border: 2.5px solid #04AAEB;
    background-color: #fafafa;
}

.Div .notFound .textDiv .uninstall:hover {
    background-color: #0094d4;
    background-color: #ddd;
}
</style>
