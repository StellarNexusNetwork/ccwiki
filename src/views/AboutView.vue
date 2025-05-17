<template>
  <div class="Div">
    <div class="AboutList">
      <div class="AboutProject" id="AboutProject">
        <div class="title">CC Wiki project</div>
        <div class="detail">A Co-created Wiki by Stellar Nexus Network</div>
      </div>
      <div class="line"></div>
      <div class="boxDiv" id="Developers">
        <div class="title">{{ $t("about.title.mainDeveloper") }}</div>
        <div class="Developer">xxx - xxx</div>
        <div class="Developer">xxx - xxx</div>
        <div class="Developer">xxx - xxx</div>
        <div class="Developer">xxx - xxx</div>
      </div>
      <div class="line"></div>
      <div class="boxDiv" id="Cooperative">
        <div class="title">{{ $t("about.title.partners") }}</div>
        <div class="logoList">
          <a href="https://github.com/StellarNexusNetwork/cc.wiki.project.v4.web2/" target="_blank" class="fisrtItem">
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
        <div class="title">{{ $t("about.title.CI") }}</div>
        <div class="detail">{{ $t("about.detail.version") }} 24w37c</div>
        <div class="detail">{{ $t("about.detail.DPS") }}</div>
        <div class="detailList" style="marginLeft:20px ;">
          <a href="https://stellarnexusnetwork.github.io/cc.wiki.project.v4.web2/" target="_blank">
            <div class="detailA">https://stellarnexusnetwork.github.io/cc.wiki.project.v4.web2</div>
          </a>
          <a href="https://github.com/StellarNexusNetwork" target="_blank">
            <div class="detailA">https://github.com/StellarNexusNetwork</div>
          </a>
        </div>
      </div>
      <div class="line"></div>
      <div class="boxDiv" id="OpenSource">
        <div class="title">{{ $t("about.title.Licenses") }}</div>
        <div class="detail">{{ $t("about.detail.Licenses") }} xxxx</div>
        <div class="detail">{{ $t("about.detail.DLicenses") }} xxxx</div>
      </div>
      <div class="line"></div>
      <div class="boxDiv" id="OtherOpenSource" style="paddingBottom: 30px;">
        <a href="/static/licenses.txt">
          <div class="title">{{ $t("about.title.OLicenses") }}</div>
        </a>
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
  width: 95%;
  display: flex;
  flex-direction: column;
  margin-top: 25px;
}

.Div .AboutList .AboutProject {
  display: flex;
  flex-direction: column;
}

.Div .AboutList .AboutProject .title {
  font-family: MiSans-B;
  font-size: 40px;
  color: var(--color-text-title);
  transition-duration: 0.3s;
}

.Div .AboutList .AboutProject .detail {
  font-family: MiSans;
  font-size: 16px;
  color: var(--color-text-body);
  transition-duration: 0.3s;
}

.Div .AboutList .line {
  width: 100%;
  border-top: 0.5px solid var(--color-border-3);
  margin-top: 20px;
  margin-bottom: 20px;
  transition-duration: 0.3s;
}

.Div .AboutList .boxDiv {
  display: flex;
  flex-direction: column;
}

.Div .AboutList .boxDiv .title {
  font-family: MiSans-B;
  font-size: 25px;
  color: var(--color-text-title);
  transition-duration: 0.3s;
}

.Div .AboutList #Developers .Developer {
  font-family: MiSans;
  font-size: 15px;
  color: var(--color-text-body);
  transition-duration: 0.3s;
}

.Div .AboutList #Cooperative .logoList {
  display: flex;
  margin-top: 10px;
  overflow-x: auto;
}

.Div .AboutList #Cooperative .logoList a {
  margin-left: 30px;
  margin-bottom: 10px;
}

.Div .AboutList #Cooperative .logoList .fisrtItem {
  margin-left: 0;
}

.Div .AboutList #Cooperative .logoList img {
  width: auto;
  height: 80px;

  user-select: none;
}

.Div .AboutList .boxDiv .detail {
  font-family: MiSans;
  font-size: 15px;
  color: var(--color-text-body);
  transition-duration: 0.3s;
}

.Div .AboutList .boxDiv .detailA {
  font-family: MiSans;
  font-size: 15px;
}

.Div .AboutList #ClientInfo .detailList .detail {
  text-decoration: underline;
}
</style>
