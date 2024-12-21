<template>
    <div class="Div">
        <div class="AboutList">
            <div class="AboutProject" id="AboutProject">
                <div class="title">CC Wiki project</div>
                <div class="detail">A Co-created Wiki by Stellar Nexus Network</div>
            </div>
            <div class="line"></div>
            <div class="boxDiv" id="Developers">
                <div class="title">主要开发者</div>
                <div class="Developer">xxx - xxx</div>
                <div class="Developer">xxx - xxx</div>
                <div class="Developer">xxx - xxx</div>
                <div class="Developer">xxx - xxx</div>
            </div>
            <div class="line"></div>
            <div class="boxDiv" id="Cooperative">
                <div class="title">合作伙伴</div>
                <div class="logoList">
                    <a href="https://github.com/StellarNexusNetwork/cc.wiki.project.v4.web2/" target="_blank">
                        <!-- <img src="/static/about/svg/ccwiki_logo.svg" style="marginLeft: 0px" alt="SVG Image" draggable="false"> -->
                        <img src="/static/about/svg/ccwiki_logo.svg" alt="SVG Image" draggable="false">
                    </a>
                    <a href="https://github.com/StellarNexusNetwork" target="_blank">
                        <img src="/static/about/svg/SNN_logo.svg" alt="SVG Image" draggable="false">
                    </a>
                </div>
            </div>
            <div class="line"></div>
            <div class="boxDiv" id="ClientInfo">
                <div class="title">客户端信息</div>
                <div class="detail">版本号: 24w37c</div>
                <div class="detail">数据提供服务:</div>
                <div class="detailList" style="marginLeft:20px ;">
                    <a href="https://stellarnexusnetwork.github.io/cc.wiki.project.v4.web2/" target="_blank">
                        <div class="detail">https://stellarnexusnetwork.github.io/cc.wiki.project.v4.web2</div>
                    </a>
                    <a href="https://github.com/StellarNexusNetwork" target="_blank">
                        <div class="detail">https://github.com/StellarNexusNetwork</div>
                    </a>
                </div>
            </div>
            <div class="line"></div>
            <div class="boxDiv" id="OpenSource">
                <div class="title">开源协议与数据使用许可</div>
                <div class="detail">开源协议: xxxx</div>
                <div class="detail">数据使用许可: xxxx</div>
            </div>
            <div class="line"></div>
            <div class="boxDiv" id="OtherOpenSource" style="paddingBottom: 30px;">
                <div class="title">开源许可</div>
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
}

.Div .AboutList {
    width: 92%;
    display: flex;
    flex-direction: column;
    margin-top: 30px;
}

.Div .AboutList .AboutProject {
    display: flex;
    flex-direction: column;
}

.Div .AboutList .AboutProject .title {
    font-family: MiSans-B;
    font-size: 40px;
}

.Div .AboutList .AboutProject .detail {
    font-family: MiSans;
    font-size: 16px;
}

.Div .AboutList .line {
    width: 100%;
    border-top: 0.5px solid #9c9c9c;
    margin-top: 20px;
    margin-bottom: 20px;
}

.Div .AboutList .boxDiv {
    display: flex;
    flex-direction: column;
}

.Div .AboutList .boxDiv .title {
    font-family: MiSans-B;
    font-size: 25px;
}

.Div .AboutList #Developers .Developer {
    font-family: MiSans;
    font-size: 15px;
}

.Div .AboutList #Cooperative .logoList {
    display: flex;
    margin-top: 10px;
    flex-wrap: wrap;
}

.Div .AboutList #Cooperative .logoList img {
    width: auto;
    height: 80px;
    margin-left: 30px;
    margin-bottom: 10px;
}

.Div .AboutList .boxDiv .detail {
    font-family: MiSans;
    font-size: 15px;
}

.Div .AboutList #ClientInfo .detailList .detail {
    text-decoration: underline;
}
</style>
