<template>
  <div class="Div">
    <div class="notFound">
      <div class="imgAndTitle">
        <img src="/static/public/svg/NotFound.svg" alt="SVG Image" draggable="false">
        {{ $t("public.NotFound.imgAndTitle") }}
      </div>
      <div class="textDiv">
        <div class="suggestion">{{ $t("public.NotFound.suggestion") }}</div>
        <div class="errorCode">404 Not Found.</div>
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
  color: var(--color-text-title);
  transition-duration: 0.3s;
}

.Div .notFound .imgAndTitle img {
  width: 150px;
  height: 150px;
  margin-right: 30px;
  user-select: none;
}

.Div .notFound .textDiv {
  margin-top: 40px;
}

.Div .notFound .textDiv .suggestion {
  font-family: RHRCN-M;
  font-size: 20px;
  color: var(--color-text-body-subtle);
  transition-duration: 0.3s;
}

.Div .notFound .textDiv .errorCode {
  font-family: RHRCN-N;
  font-size: 15px;
  color: var(--color-text-caption);
  transition-duration: 0.3s;
}
</style>
