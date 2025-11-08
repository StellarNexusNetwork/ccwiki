<template>
  <div>
    <ul v-if="Object.keys(data.wikiRepos).length> 0 && address.length<1">
      <li class="localRepositories" v-for="(item, index) in data.wikiRepos" :key="index" @click="routePush('/docs/' + index)">
        <img :src="item.icon" alt="SVG Image" draggable="false">
        <div class="textDiv">
          <Vue3Marquee v-if="useWindowStore().isMarqueeEnabled" :duration="5" :pauseOnHover="true" :animateOnOverflowOnly="true" :clone="true" @onOverflowDetected="onOverflowDetected" @onOverflowCleared="onOverflowCleared">
            <div class="name">
              {{
                item.name?.[lang] ?? Object.values(item.name)?.[0] ?? t("page.docsView.wikiRepos.name.unknow")
              }}
            </div>
          </Vue3Marquee>
          <div v-else class="name">
            {{
              item.name?.[lang] ?? Object.values(item.name)?.[0] ?? t("page.docsView.wikiRepos.name.unknow")
            }}
          </div>
          <div class="version">{{ item.version }}</div>
        </div>
      </li>
    </ul>
    <div class="notFoundR" v-else>
      <div class="imgAndTitle">
        <img src="/views/ClassificationView/svg/NotFound.svg" alt="SVG Image" draggable="false">
        <p>{{ t("page.classification.NotFound") }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useDataSourcesStore2} from "@/stores/dataSources2.ts";
import {useI18n} from 'vue-i18n';
import {useRoute, useRouter} from "vue-router";
import {useWindowStore} from "@/stores/window.ts";
import {useTextOverflow} from "@/composables/useTextOverflow";
import {useSettingStore} from "@/stores/setting.ts";

const data = useDataSourcesStore2()

const {t} = useI18n();
const router = useRouter();

function routePush(url: string) {
  router.push(url);
}

const {shouldAddGap, onOverflowDetected, onOverflowCleared} = useTextOverflow();

const route = useRoute()
const address = route.params.pathMatch

const lang = useSettingStore().setting.lang

</script>

<style scoped>
ul {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 20px;
  padding: 25px;
}

.localRepositories {
  width: 200px;
  height: 90px;
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 10px;
  background: var(--color-background-2);
  border: 1px solid rgba(0, 0, 0, 0);
  transition-duration: 0.3s;
}

.localRepositories:hover {
  border: 1px solid var(--color-border-3);
  transition-duration: 0.3s;
}

.localRepositories img {
  width: 45px;
  height: 45px;
  object-fit: contain;
  image-rendering: pixelated;
  margin-left: 5px;
  margin-right: 20px;
  user-select: none;
}

.localRepositories .textDiv {
  display: block;
  width: 110px;
}

.localRepositories .textDiv .name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: MiSans-M;
  font-size: 16px;
  margin-bottom: 0;
  color: var(--color-text-title);
  display: flex;
  transition-duration: 0.3s;
}

.localRepositories .textDiv .version {
  height: 36px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: var(--color-text-body);
  transition-duration: 0.3s;
  text-align: left;
}

.notFoundR {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.notFoundR .imgAndTitle {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: RHRCN-H;
  font-size: 22.5px;
  color: var(--color-text-caption);
  transition-duration: 0.3s;
  padding-left: 10px;
  padding-right: 10px;
}

.notFoundR .imgAndTitle img {
  max-width: 250px;
  max-height: 250px;
  user-select: none;
  margin-bottom: 15px;
}
</style>
