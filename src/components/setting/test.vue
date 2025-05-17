<template>
  <div>
    <div>测试</div>
    <input v-model="urlText">
    <button @click="redirect">跳转</button>
    <br/>
    <br/>
    <button @click="openFolder">打开文件夹</button>
    <div class="localRepositoriesList">
      <TransitionGroup name="fade" tag="ul" mode="out-in">
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
  </div>
</template>
<script setup lang="js">
import {useDataSourcesStore} from '../../stores/dataSources';
import {useNoticeStore} from '../../stores/setting';
import {ref} from 'vue'
import {useRouter} from 'vue-router'

const urlText = ref('')
const router = useRouter()

function redirect() {
  router.push(urlText.value)
}

const notice = useNoticeStore()

useDataSourcesStore().refreshData();

async function openFolder() {
  try {
    const handle = await window.showDirectoryPicker();
    const root = await useDataSourcesStore().processHandle(handle);
    console.log(root)

    // 处理展示数据和存储数据
    if (root.children.some((obj => obj.name === "config.json"))) {

      // 读取仓库语言文件
      const lang = root.children.find(obj => obj.name === 'lang');
      const langObject = {};
      for (const i of lang.children) {
        langObject[i.name.slice(0, 5)] = i;
      }
      useDataSourcesStore().langHandles.push(langObject)
      // todo：刷新语言

      const config = root.children.find(obj => obj.name === "config.json");
      const configData = await config.getFile()
      const reader = new FileReader();
      reader.onload = async (e) => {
        const jsonDataRaw = JSON.parse(e.target.result)
        if ('from' in jsonDataRaw && jsonDataRaw.from === "ccwikiproject") {
          if (!useDataSourcesStore().localRepositories.some((obj => obj.ulid === jsonDataRaw.ulid))) {
            useDataSourcesStore().localRepositories.push({'ulid': jsonDataRaw.ulid, 'root': root})
            const iconData = await getIconURL(root)
            const iconURL = iconData['iconURL']
            const iconHandle = iconData['iconHandle']
            const jsonData = Object.assign({}, {
              'name': "Unknown",
              "version": "Unknown",
              "routes": []
            }, jsonDataRaw)
            useDataSourcesStore().localRepositoriesDisplay.push({
              'ulid': jsonData.ulid,
              'configHandle': config,
              "iconHandle": iconHandle,
              'name': jsonData.name,
              "version": jsonData.version,
              "iconURL": iconURL,
              "routes": jsonData.routes
            })
            notice.addNotice({'type': 'success', 'title': '仓库添加成功！', 'content': '已加载所选仓库！'})
          } else {
            console.warn("请勿重复添加仓库！")
            notice.addNotice({'type': 'warn', 'title': '请勿重复添加仓库！', 'content': '该仓库已加载，请勿重复添加！'})
          }
        } else {
          console.warn("选择仓库非标准仓库！")
          notice.addNotice({
            'type': 'error',
            'title': '选择仓库非标准仓库！',
            'content': '无法识别该仓库，请确认仓库类型！'
          })
        }
      }
      reader.readAsText(configData, 'utf-8')
      console.log(configData)
    } else {
      console.error("选择仓库非标准仓库！")
      notice.addNotice({
        'type': 'error',
        'title': '选择仓库非标准仓库！',
        'content': '无法识别该仓库，请确认仓库类型！'
      })
    }
  } catch {
    console.warn("未获得授权或发生错误！");
    notice.addNotice({
      'type': 'warn',
      'title': '请授权浏览器进行操作！',
      'content': '未获得用户授权或发生错误！'
    })
  }
}

async function getIconURL(root) {
  let iconURL = '/static/public/svg/NotFound.svg'
  let iconHandle = 'notFound'
  if (root.children.some((obj => obj.name === "icon.svg"))) {
    iconHandle = root.children.find(obj => obj.name === "icon.svg")
    const icon = await iconHandle.getFile()
    iconURL = URL.createObjectURL(icon);
  } else if (root.children.some((obj => obj.name === "icon.png"))) {
    iconHandle = root.children.find(obj => obj.name === "icon.png")
    const icon = await iconHandle.getFile()
    iconURL = URL.createObjectURL(icon);
  }
  return {iconURL: iconURL, iconHandle: iconHandle}
}

function deleteLocalData(index) {
  useDataSourcesStore().localRepositories.splice(index, 1);
  useDataSourcesStore().localRepositoriesDisplay.splice(index, 1);
  useDataSourcesStore().langHandles.splice(index, 1);
  notice.addNotice({'type': 'success', 'title': '仓库删除成功！', 'content': '已移除所选仓库！'})
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