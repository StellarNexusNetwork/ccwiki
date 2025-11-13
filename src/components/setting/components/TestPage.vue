<template>
  <div>
    <div>测试</div>
    <button @click="clearLocalStorage()">清除数据</button>
    <br/>
    <input v-model="urlText">
    <button @click="redirect">跳转</button>
    <br/>
    <br/>
    <button @click="dataStore.addLocalRepo()">打开文件夹</button>
    <div class="localRepositoriesList">
      <TransitionGroup name="fade" tag="ul" mode="out-in">
        <li class="localRepositories" v-for="( item,id, index) in dataStore.wikiRepos" :key="id">
          <img :src="item.icon" alt="SVG Image" draggable="false">
          <div class="textDiv">
            <div class="name">{{
                item.name?.[lang] ?? Object.values(item.name)?.[0] ?? t("page.docsView.wikiRepos.name.unknow")
              }}
            </div>
            <div class="version">{{ item.version }}</div>
          </div>
          <div class="optionList">
            <div class="div"></div>
            <div class="option" @click="dataStore.deleteRepos(id)">
              <img class="icon" src="/components/setting/components/TestPage/svg/delete.svg" alt="SVG Image" draggable="false">
            </div>
          </div>
        </li>
      </TransitionGroup>
    </div>
  </div>
</template>
<script setup lang="ts">
import {useDataSourcesStore} from '@/stores/dataSources.ts';
import {useNoticeStore, useSettingStore} from '@/stores/setting';
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import {useI18n} from 'vue-i18n';

const lang = useSettingStore().setting.lang

const {t} = useI18n();

const urlText = ref('');
const router = useRouter();

const dataStore = useDataSourcesStore();

function redirect() {
  router.push(urlText.value);
}

const notice = useNoticeStore();

const clearLocalStorage = () => {
  localStorage.clear();
  dataStore.deleteDatabase('dataSourcesDB');
  console.log('本地数据已清除～喵♪');
  notice.addNotice('success', '操作成功！', '本地数据已清除～喵♪');
};

</script>
<style scoped>
.localRepositoriesList {
  margin-top: 15px;
  overflow-x: hidden;
  overflow-y: auto;
}

.localRepositoriesList ul {
  padding-left: 0;
}

.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

.fade-leave-active {
  position: absolute;
}

.localRepositories {
  display: flex;
  max-width: 450px;
  margin-top: 10px;
  border: 2px solid var(--color-border-2);
  border-radius: 15px;
  padding: 10px 15px 10px 15px;
}

.localRepositories img {
  width: 60px;
  height: auto;
  margin-right: 15px;
  user-select: none;
}

.localRepositories .textDiv {
  display: flex;
  flex-direction: column;
}

.localRepositories .textDiv div {
  word-break: break-all;
  width: auto;
}

.localRepositories .textDiv .name {
  font-size: 20px;
  color: var(--color-text-title)
}

.localRepositories .textDiv .version {
  color: var(--color-text-caption);
}

.localRepositories .optionList {
  margin-left: auto;
  display: flex;
  transition-duration: 0.3s;
  align-items: center;
}

.localRepositories .optionList .div {
  width: 10px;
  height: 50px;
  border-radius: 10px;
  background: var(--color-shadow-s);
  transition-duration: 0.3s;
}

.localRepositories .optionList .option {
  width: 0;
  height: 50px;
  display: flex;
  opacity: 0;
  transition-duration: 0.3s;
  border-radius: 10px;
}

.localRepositories .optionList .option img {
  width: 0;
  height: 0;
  opacity: 0;
  transition-duration: 0.3s;
  filter: drop-shadow(var(--color-text-title) 250vw 0);
  transform: translateX(-250vw);
}

.localRepositories .optionList:hover .div {
  width: 0;
  opacity: 0;
}

.localRepositories .optionList:hover .option {
  width: 50px;
  opacity: 1;
  background: var(--color-danger-normal);
}

.localRepositories .optionList:hover .option img {
  width: 25px;
  height: auto;
  opacity: 1;
  margin: 0 auto;
}
</style>
