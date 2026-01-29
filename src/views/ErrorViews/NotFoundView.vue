<template>
  <div class="Div">
    <div class="notFound">
      <picture>
        <source class="avif" srcset="/views/ErrorViews/NotFound/avif/not_found_p.avif" type="image/avif">
        <img src="/views/ErrorViews/NotFound/svg/not_found.svg" alt="SVG Image" draggable="false">
      </picture>

      <div class="textDiv">
        <div class="imgAndTitle">
          {{ t("page.NotFound.title") }}
        </div>
        <div class="suggestion">{{ t("page.NotFound.suggestion") }}</div>
        <div class="errorCode">404 Not Found.</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {useI18n} from 'vue-i18n';

const {t} = useI18n();
</script>
<style scoped>
.Div {
  display: flex;
  justify-content: center;
  align-items: center;
}

.Div .notFound {
  display: flex;
  align-items: center;
  padding-left: 15px;
  padding-right: 15px;
}

.Div .notFound .imgAndTitle {
  font-family: RHRCN-H;
  color: var(--color-text-title);
  transition-duration: 0.3s;
}

@media (max-width: 622px) {
  .notFound {
    flex-direction: column;
    margin-bottom: 80px;
  }

  .Div .notFound img {
    width: 250px;
    height: 250px;
  }

  .Div .notFound .textDiv {
    margin-top: 15px;
  }

  .Div .notFound .imgAndTitle {
    font-size: 30px;
  }

  .Div .notFound .textDiv .suggestion {
    font-size: 15px;
  }

  .Div .notFound .textDiv .errorCode {
    font-size: 10px;
  }
}

@media (min-width: 622px) {
  .Div .notFound img {
    width: 350px;
    height: 350px;
  }

  .Div .notFound .textDiv {
    margin-top: 40px;
  }

  .Div .notFound .imgAndTitle {
    font-size: 40px;
  }

  .Div .notFound .textDiv .suggestion {
    font-size: 20px;
  }

  .Div .notFound .textDiv .errorCode {
    font-size: 15px;
  }
}

.Div .notFound img {
  user-select: none;
  transition-duration: 0.3s;
}

.Div .notFound .textDiv .suggestion {
  font-family: RHRCN-M;
  color: var(--color-text-body-subtle);
  transition-duration: 0.3s;
}

.Div .notFound .textDiv .errorCode {
  font-family: RHRCN-N;
  color: var(--color-text-caption);
  transition-duration: 0.3s;
}
</style>
