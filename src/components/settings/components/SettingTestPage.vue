<template>
  <div>
    <div>测试</div>
    <button @click="clearLocalStorage()">清除数据</button>
    <br/>
    <input v-model="urlText">
    <button @click="redirect">跳转</button>
    <br/>
    <br/>
    <button @click="addNotice">弹出通知</button>
    <br/>
    <br/>
    <button @click="dataStore.addLocalRepo()">打开文件夹</button>
    <br/>
    <input v-model="repoAddress" placeholder="请输入仓库地址">
    <button @click="dataStore.addHttpRepo(repoAddress)">添加</button>
    <!--  todo：标记仓库类型（错误）  -->
    <!--  todo：显示更多信息  -->
    <div class="localRepositoriesList">
      <TransitionGroup name="fade" tag="ul" mode="out-in">
        <li class="localRepositories" v-for="( storage,repoId) in dataStore.persistentStorage" :key="repoId">
          <div class="img">
            <Image v-if="dataStore.wikiRepos[repoId]" class="icon" :path="dataStore.wikiRepos[repoId].iconPath" :repo="dataStore.wikiRepos[repoId]" :cache="false" alt="" currentDirPath="/" draggable="false"/>
            <img v-else class="icon" src="/static/views/error-views/not-found/svg/not-found.svg" alt="SVG Image" draggable="false">
          </div>
          <!--    todo:设置错误替换的图片      -->
          <div class="textDiv">
            <div class="name">{{
                storage.config.name?.[lang] ?? Object.values(storage.config.name ?? {})?.[0] ?? t("page.docsView.wikiRepos.name.unknow")
              }}
            </div>
            <div style="display: flex;gap: 7px">
              <div class="version" v-if="storage.config.version">{{ storage.config.version }}</div>
              <Tag v-if="storage.type == 'local'" severity="info" value="本地"></Tag>
              <Tag v-else-if="storage.type == 'httpServer'" severity="success" value="在线"></Tag>

              <Tag v-if="storage.status == 'reauthorization_required'" severity="danger" value="需要重新授权"></Tag>
              <Tag v-if="storage.status == 'connection_failed'" value="离线"></Tag>
              <Tag v-if="storage.status == 'configuration_error'" severity="danger" value="配置文件损坏"></Tag>
            </div>
          </div>
          <div class="optionList">
            <div class="div"></div>
            <div class="option red" @click="dataStore.deleteRepos(repoId)" :style="{'margin-left': '10px'}">
              <img class="icon" src="/static/components/settings/components/setting-test-page/svg/delete.svg" alt="SVG Image" draggable="false">
            </div>
            <div v-if="storage.status == 'reauthorization_required'" class="option" @click="dataStore.reauthorizeDirectory(storage)">
              <img class="icon" src="/static/components/settings/components/setting-test-page/svg/lucide-folder-open-dot.svg" alt="SVG Image" draggable="false">
            </div>
            <div v-if="storage.status == 'configuration_error' || storage.status == 'connection_failed'" class="option" @click="dataStore.reloadRepository(storage)">
              <img class="icon" src="/static/components/settings/components/setting-test-page/svg/lucide-refresh-cw.svg" alt="SVG Image" draggable="false">
            </div>
          </div>
        </li>
      </TransitionGroup>
    </div>
  </div>
</template>
<script setup lang="ts">
import {useDataSourcesStore} from '@/stores/dataSources.ts';
import {useSettingStore} from '@/stores/setting';
import {useNoticeStore} from '@/stores/notice';
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import {useI18n} from 'vue-i18n';
import Image from "@/components/common/image.vue";

const lang = useSettingStore().setting.lang

const {t} = useI18n();

const urlText = ref('');
const repoAddress = ref('');

const router = useRouter();

const dataStore = useDataSourcesStore();

function addNotice() {
  notice.addNotice('success', '测试！', '测试喵♪');
}

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
.p-tag {
  display: flex;
  font-size: 10px;
}

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

.localRepositories .img {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  margin-right: 15px;
}

.localRepositories .img .icon {
  width: 60px;
  height: 60px;
  user-select: none;
  image-rendering: pixelated;
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
  color: var(--color-text-title);
}

.localRepositories .textDiv .version {
  color: var(--color-text-caption);
}

.localRepositories .optionList {
  margin-left: auto;
  display: flex;
  transition-duration: 0.3s;
  align-items: center;
  flex-direction: row-reverse;
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
  margin-left: 10px;
}

.localRepositories .optionList .option .icon {
  width: 0;
  height: 0;
  opacity: 0;
  transition-duration: 0.3s;
  filter: drop-shadow(var(--color-text-title) 250vw 0);
  transform: translateX(-250vw);
  user-select: none;
}

.localRepositories .optionList:hover .div {
  width: 0;
  opacity: 0;
}

.localRepositories .optionList:hover .option.red {
  background: var(--color-danger-normal);
}

.localRepositories .optionList:hover .option {
  width: 50px;
  opacity: 1;
  background: var(--color-shadow-s);
}

.localRepositories .optionList:hover .option .icon {
  width: 25px;
  height: auto;
  opacity: 1;
  margin: 0 auto;
  user-select: none;
}
</style>
