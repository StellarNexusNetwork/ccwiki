<template>
  <div class="local-disabled">
    <picture>
      <img src="/static/views/error-views/local-disabled/avif/local-disabled.avif" alt="SVG Image" draggable="false">
    </picture>

    <div class="textDiv">
      <div class="imgAndTitle">
        {{ t("page.error.local-disabled.title") }}
      </div>
      <div class="suggestion">{{ t("page.error.local-disabled.suggestion") }}</div>
      <div class="errorCode">Unavailable Locally.</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {useI18n} from 'vue-i18n';

const {t} = useI18n();
</script>
<style scoped>

.local-disabled {
  display: flex;
  align-items: center;
  padding-left: 15px;
  padding-right: 15px;
}

.local-disabled .imgAndTitle {
  font-family: RHRCN-H;
  color: var(--color-text-title);
  transition-duration: 0.3s;
}

@container (max-width: 575px) {
  .local-disabled {
    flex-direction: column;
    margin-bottom: 25px;
  }

  .local-disabled img {
    width: 250px;
    height: 250px;
  }

  .local-disabled .textDiv {
    margin-top: 15px;
  }

  .local-disabled .imgAndTitle {
    font-size: 25px;
  }

  .local-disabled .textDiv .suggestion {
    font-size: 15px;
  }

  .local-disabled .textDiv .errorCode {
    font-size: 10px;
  }
}

@container (min-width: 575px) {
  .local-disabled {
    margin-bottom: 55px;
  }

  .local-disabled img {
    width: 350px;
    height: 350px;
  }

  .local-disabled .textDiv {
    margin-top: 40px;
  }

  .local-disabled .imgAndTitle {
    font-size: 30px;
  }

  .local-disabled .textDiv .suggestion {
    font-size: 20px;
  }

  .local-disabled .textDiv .errorCode {
    font-size: 15px;
  }
}

.local-disabled img {
  user-select: none;
  transition-duration: 0.3s;
}

.local-disabled .textDiv .suggestion {
  font-family: RHRCN-M;
  color: var(--color-text-body-subtle);
  transition-duration: 0.3s;
}

.local-disabled .textDiv .errorCode {
  font-family: RHRCN-N;
  color: var(--color-text-caption);
  transition-duration: 0.3s;
}
</style>
