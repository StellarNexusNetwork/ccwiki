<template>
  <div class="Div">
    <div class="mainDiv">
      <div class="mainContent">
      </div>
      <div class="subContent">
        <div class="introduction">

        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
</script>
<style scoped>
.Div {
  display: flex;
}

.Div .mainDiv {
  width: calc(100vw - 30px);
  margin: 15px;
}

.Div .mainDiv .subContent {
  width: 300px;
}

.Div .mainDiv .subContent .introduction {
  width: 100%;
  padding-bottom: 5px;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 0.8px solid var(--color-border-2);
}
</style>