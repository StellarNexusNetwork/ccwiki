<template>
  <div class="mainDiv">
    <div class="div">
      <img src="/static/public/svg/setting/setting.svg" alt="SVG Image" draggable="false">
      <div class="title" id="title">CC Wiki project</div>
      <div class="title" id="title_m">CC Wiki</div>
      <div id="details">
        <div class="data">版本号: 25w23a</div>
        <div class="data">更新日期: 2025.06.08</div>
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
  user-select: none;
}

.mainDiv .div .title {
  margin-top: 10px;
  font-family: RHRCN-H;
  font-size: 35px;
  color: var(--color-text-caption);
}

.mainDiv .div #details {
  margin-top: 10px;
  margin-bottom: 50px;
  color: var(--color-text-caption);
  font-family: RHRCN-N;
}
</style>