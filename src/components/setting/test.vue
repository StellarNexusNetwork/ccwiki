<template>
  <div>测试</div>
  <button @click="openFolder">打开文件夹</button>
  <div class="localRepositoriesList">
    <TransitionGroup name="fade" tag="ul">
      <li class="localRepositories" v-for="(item, index) in useDataSourcesStore().localRepositoriesDisplay" :key="item.ulid">
        <img :src="item.iconURL" alt="SVG Image" draggable="false">
        <div class="textDiv">
          <div class="name">{{ item.name }}</div>
          <div class="version">{{ item.version }}</div>
        </div>
        <div class="optionList">
          <div class="div"></div>
          <div class="option" @click="deleteLocalData(index)">
            <img class="icon" src="/static/public/svg/setting/test/delete.svg" alt="SVG Image" draggable="false">
          </div>
        </div>
      </li>
    </TransitionGroup>
  </div>
</template>
<script setup lang="js">
import {useDataSourcesStore} from '@/stores/dataSources';
import {reactive} from "vue";
import defaultSetting from "@/json/defaultSetting.json";

async function openFolder() {
  try {
    const handle = await window.showDirectoryPicker();
    const root = await processHandle(handle)
    if (root.children.some((obj => obj.name === "config.json"))) {
      const config = root.children.find(obj => obj.name === "config.json");
      const configData = await config.getFile()
      const reader = new FileReader();
      reader.onload = async (e) => {
        const jsonDataRaw = JSON.parse(e.target.result)
        if ('from' in jsonDataRaw && jsonDataRaw.from === "ccwikiproject") {
          if (!useDataSourcesStore().localRepositories.some((obj => obj.ulid === jsonDataRaw.ulid))) {
            useDataSourcesStore().localRepositories.push({'ulid': jsonDataRaw.ulid, 'root': root})
            const iconURL = await getIconURL(root)
            const jsonData = reactive(Object.assign({
              'name': "Unknown",
              "version": "Unknown"
            }, defaultSetting, jsonDataRaw))
            useDataSourcesStore().localRepositoriesDisplay.push({
              'ulid': jsonData.ulid,
              'name': jsonData.name,
              "version": jsonData.version,
              "iconURL": iconURL
            })
          } else {
            console.warn("请勿重复添加仓库！")
          }
        } else {
          console.warn("选择仓库非标准仓库！")
        }
      }
      reader.readAsText(configData, 'utf-8')
      console.log(configData)
    } else {
      console.error("选择仓库非标准仓库！")
    }
  } catch {
    console.warn("未获得用户授权或发生错误！");
  }
}

async function processHandle(handle) {
  if (handle.kind === 'file') {
    return handle
  }
  handle.children = []
  const iter = handle.entries();
  for await (const item of iter) {
    handle.children.push(await processHandle(item[1]));
  }
  return handle
}

async function getIconURL(root) {
  let iconURL = '/static/public/svg/NotFound.svg'
  if (root.children.some((obj => obj.name === "icon.svg"))) {
    const iconHandle = root.children.find(obj => obj.name === "icon.svg")
    const icon = await iconHandle.getFile()
    iconURL = URL.createObjectURL(icon);
  } else if (root.children.some((obj => obj.name === "icon.png"))) {
    const iconHandle = root.children.find(obj => obj.name === "icon.png")
    const icon = await iconHandle.getFile()
    iconURL = URL.createObjectURL(icon);
  }
  return iconURL
}

function deleteLocalData(index) {
  useDataSourcesStore().localRepositories.splice(index, 1);
  useDataSourcesStore().localRepositoriesDisplay.splice(index, 1);
}
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