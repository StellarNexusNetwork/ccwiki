<template>
  <div class="Div">
    <div class="AboutList">
      <div class="boxDiv">
        <div class="title">条目</div>
        <div class="itemList">
          <button class="item" id="firstItem" @click="hello()">
            <div class="title">测试</div>
            <div class="introduction">测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试</div>
            <div class="iconList">
              <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
              <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
              <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
            </div>
          </button>
          <button class="item" @click="hello()">
            <div class="title">测试</div>
            <div class="introduction">测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试</div>
            <div class="iconList">
              <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
              <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
              <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
            </div>
          </button>
          <button class="item" @click="hello()">
            <div class="title">测试</div>
            <div class="introduction">测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试</div>
            <div class="iconList">
              <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
              <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
              <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
            </div>
          </button>
        </div>
      </div>
      <div class="line"></div>
      <div class="boxDiv">
        <div class="title">新闻</div>
        <div class="itemList">
          <button class="item" id="firstItem" @click="hello()">
            <div class="title">测试</div>
            <div class="introduction">测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试</div>
            <div class="iconList">
              <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
              <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
              <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
            </div>
          </button>
        </div>
      </div>
      <div class="line"></div>
      <div class="boxDiv">
        <div class="title">安全</div>
        <div class="itemList">
          <button class="item" id="firstItem" @click="hello()">
            <div class="title">测试</div>
            <div class="introduction">测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试</div>
            <div class="iconList">
              <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
              <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
              <img class="icon" src="/static/public/svg/Test.svg" alt="SVG Image" draggable="false">
            </div>
          </button>
        </div>
      </div>

      <div class="line"></div>
      <Suspense>
        <template #default>
          <boxDiv/>
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
  border-top: 0.5px solid var(--color-border-3);
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
  color: var(--color-text-title)
}

.Div .AboutList .boxDiv .itemList {
  display: flex;
}

.Div .AboutList .boxDiv .itemList #firstItem {
  margin-left: 0;
}

.Div .AboutList .boxDiv .itemList .item {
  width: 210px;
  min-width: 180px;
  height: 108px;
  padding: 10px;
  border-radius: 10px;
  margin-left: 20px;
  background: var(--color-background-2);
  border: 1px solid rgba(0, 0, 0, 0);
  transition-duration: 0.3s;
}

.Div .AboutList .boxDiv .itemList .item:hover {
  border: 1px solid var(--color-border-3);
}

.Div .AboutList .boxDiv .itemList .item .title {
  font-family: MiSans-M;
  font-size: 20px;
  margin-bottom: 0;
  color: var(--color-text-title);
  display: flex;
}

.Div .AboutList .boxDiv .itemList .introduction {
  height: 36px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: var(--color-text-body);
}

.Div .AboutList .boxDiv .itemList .iconList {
  display: flex;
  height: 20px;
  justify-content: flex-end;
  padding-top: 5px;
}

.Div .AboutList .boxDiv .itemList .icon {
  margin-left: 5px;
  user-select: none;
}
</style>