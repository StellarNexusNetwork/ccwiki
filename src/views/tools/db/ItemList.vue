<template>
  <div class="Div">
    <div class="appControl">
      <div class="options" v-if="page < pageLen">
        <button id="normal" @click='routePush(1)'>
          <img src="/static/public/svg/titleBar/goForward.svg" alt="goForward" draggable="false">
        </button>
      </div>
      <div class="options" v-if="page > 1">
        <button id="normal" @click='routePush(-1)'>
          <img src="/static/public/svg/titleBar/goBack.svg" alt="goBack" draggable="false">
        </button>
      </div>
    </div>
    <div class="AboutList">
      <TransitionGroup name="fade" tag="ul" mode="out-in">
        <div class="ItemBox" v-for="(item,item_index) in data" :key="item.id">
          <div class="Item">
            <div :class="'ele '+ele" v-for="(ele,ele_index) in ItemList" @click="handleCellClick([item_index,-1],item['id'],ele_index,ele, true,$event)" :ref="el => setCellRef(item_index,-1, ele_index, el)" :key="ele">
              <template v-if="editingID[0] === item_index && editingID[1] ===-1 && editingIndex === ele_index">
            <textarea
                v-model="tempValue"
                :ref="setInputRef"
                :style="{ height: inputHeight }"
                @keydown.enter.prevent="save"
            />
              </template>
              <template v-else>
                {{ item[ele] }}
              </template>
            </div>
          </div>
          <div class="SubItem" v-if="subItemData[item.id] !== undefined" v-for="(subItem,subIndex_index) in subItemData[item.id]" :key="subItem.id">
            <div :class="'ele '+ele" v-for="(ele,ele_index) in subItemList" @click="handleCellClick([item_index,subIndex_index],subItemData[item.id][subIndex_index].id,ele_index,ele, false,$event)" :ref="el => setCellRef(item_index,subIndex_index, ele_index, el)" :key="ele">
              <template v-if="editingID[0] === item_index && editingID[1] === subIndex_index && editingIndex === ele_index">
            <textarea
                v-model="tempValue"
                :ref="setInputRef"
                :style="{ height: inputHeight }"
                @keydown.enter.prevent="save"
            />
              </template>
              <template v-else>
                {{ subItemData[item.id][subIndex_index][ele] }}
              </template>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import {nextTick, onBeforeUnmount, onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router';
import {toInteger} from "lodash";

const router = useRouter();

const {page} = useRoute().params;

const data = ref<Record<string, any>[]>([])
const error = ref(null)
const pageLen = ref(0)

const ItemList = ['id', 'question', 'answer', 'created_at', 'edit_at']
const subItemList = ['none', 'id', 'question', 'answer', 'created_at', 'edit_at']

const subItemData = ref<Record<string, any>>({})

// GET 请求
const getData = async () => {
  try {
    const response = await axios.get('http://localhost:8000/Items/' + page)
    data.value = response.data
  } catch (err) {
    error.value = err
  }
}

// GET 请求
const getpageLen = async () => {
  try {
    const response = await axios.get('http://localhost:8000/PageLen')
    pageLen.value = response.data.Len
  } catch (err) {
    error.value = err
  }
}

// GET 请求
const getSubItem = async (mainID: any) => {
  try {
    const response = await axios.get('http://localhost:8000/SubItem/' + mainID)
    const subData = response.data
    if (Array.isArray(subData) && subData.length !== 0) {
      subItemData.value[mainID] = [...subData]
      console.log(1)
    } else {
      console.log(2)
    }
  } catch (err) {
    error.value = err
  }
}
await getData()
await getpageLen()
console.log(data.value)

// POST 请求
const updateItem = async (id: number, name: string, context: string) => {
  try {
    const response = await axios.post('http://localhost:8000/UpdateItem', {
      id: id,
      name: name,
      context: context
    })
  } catch (err) {
    error.value = err
  }
}

// // DELETE 请求
// const deleteData = async (id) => {
//   try {
//     const response = await axios.delete(`/api/data/${id}`)
//     data.value = response.data
//   } catch (err) {
//     error.value = err
//   }
// }
const editingID = ref([-1, -1])
const editingSqlID = ref(null)
const editingIndex = ref(null)
const editingIndexName = ref(null)
const tempValue = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const inputHeight = ref('auto')

const setInputRef = (el: HTMLInputElement | null) => {
  inputRef.value = el
}

// 存每个单元格的 DOM 元素，按 item_index-ele_index 键名
const cellRefs = ref<Record<string, HTMLElement | null>>({})

const setCellRef = (row: number, sub: number, col: number, el: HTMLElement | null) => {
  cellRefs.value[`${row}-${sub}-${col}`] = el
}

function handleCellClick(id_index: any, id: any, index: any, eleName: any, isMain: boolean, event: any) {
  console.log(id)
  if ((eleName === 'question' || eleName === 'answer') && (editingID.value !== id_index || editingIndex.value !== index)) {
    // 如果点击的不是当前正在编辑的格子 -> 保存旧的
    if (editingID.value[0] !== id_index[0] || editingID.value[1] !== id_index[1] || editingIndex.value !== index) {
      save()
    }

    // 然后进入新的编辑格子
    editingID.value = id_index
    editingSqlID.value = id
    editingIndex.value = index
    editingIndexName.value = eleName
    if (editingID.value[1] === -1) {
      tempValue.value = data.value[editingID.value[0]][editingIndexName.value]
    } else {
      console.log(editingID.value[0])
      tempValue.value = subItemData.value[data.value[editingID.value[0]].id][editingID.value[1]][editingIndexName.value]
    }

    // 记录高度
    const cellKey = `${id_index[0]}-${id_index[1]}-${index}`
    const cell = cellRefs.value[cellKey]
    if (cell) {
      inputHeight.value = `${cell.offsetHeight - 30}px`
    }

    nextTick(() => inputRef.value?.focus())

    event.stopPropagation() // 阻止冒泡，避免触发外部点击
  } else if (eleName === 'id' && isMain === true) {
    getSubItem(id)
  }
}

function save() {
  console.log(editingID.value, editingIndexName.value)
  if (editingID.value !== null && editingIndex.value !== null && (editingID.value[1] === -1 && data.value[editingID.value[0]][editingIndexName.value] !== tempValue.value)) {
    data.value[editingID.value[0]][editingIndexName.value] = tempValue.value
    sendToBackend(editingSqlID.value, editingIndexName.value, tempValue.value)
    inputHeight.value = 'auto'
    editingID.value = [-1, -1]
    editingSqlID.value = null
    editingIndex.value = null
    editingIndexName.value = null
  }
  if (editingID.value !== null && editingIndex.value !== null && (editingID.value[1] !== -1 && subItemData.value[data.value[editingID.value[0]].id][editingID.value[1]][editingIndexName.value] !== tempValue.value)) {
    subItemData.value[data.value[editingID.value[0]].id][editingID.value[1]][editingIndexName.value] = tempValue.value
    sendToBackend(editingSqlID.value, editingIndexName.value, tempValue.value)
    inputHeight.value = 'auto'
    editingID.value = [-1, -1]
    editingSqlID.value = null
    editingIndex.value = null
    editingIndexName.value = null
  }
}

function handleClickOutside(event: MouseEvent) {
  // if (!wrapperRef.value.contains(event.target)) {
  save()
  // }
}

function sendToBackend(id, name, value) {
  // 模拟请求
  console.log('📤 发送数据到后端:', {id, name, value})
  updateItem(id, name, value)
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

function routePush(index: number) {
  const url = toInteger(page) + index
  router.push('/tools/db/' + url);
}
</script>

<style scoped>
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

.Div {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 20px;
}

.Div .AboutList {
  width: 90%;
  margin-top: 25px;
}

.Div .AboutList .Item {
  width: 100%;
  min-height: 100px;
  display: flex;
}

.Div .AboutList .Item .ele {
  border: 1px solid #e1e1e1;
  padding: 10px;
  transition-duration: 0.1s;
  font-size: 15px;
}

.Div .AboutList .Item .ele:hover {
  border: 3px solid #4ca7e5;
}

.Div .AboutList .Item .ele:focus-within {
  border: 3px solid #4ca7e5;
}

.Div .AboutList .Item .ele.id {
  flex: 2;
}

.Div .AboutList .Item .ele.question {
  flex: 5;
}

.Div .AboutList .Item .ele.answer {
  flex: 5;
}

.Div .AboutList .Item .ele.created_at {
  flex: 2;
}

.Div .AboutList .Item .ele.edit_at {
  flex: 2;
}

textarea {
  font-size: 15px;
  width: 100%;
  max-height: 250px;
  resize: none; /* 不允许用户拖动 */
  overflow-wrap: break-word; /* 自动换行 */
  white-space: pre-wrap;
  width: 100%;
  border: none;
  background: none;
  outline: none;
  padding: 0;
  margin: 0;
  box-shadow: none;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.Div .AboutList .SubItem {
  width: 100%;
  min-height: 100px;
  display: flex;
}

.Div .AboutList .SubItem .ele {
  border: 1px solid #e1e1e1;
  padding: 10px;
  transition-duration: 0.1s;
  font-size: 15px;
}

.Div .AboutList .SubItem .ele:hover {
  border: 3px solid #4ca7e5;
}

.Div .AboutList .SubItem .ele:focus-within {
  border: 3px solid #4ca7e5;
}

.Div .AboutList .SubItem .ele.none {
  flex: 1;
  opacity: 0;
  padding: 0;
}

.Div .AboutList .SubItem .ele.id {
  flex: 1;
}

.Div .AboutList .SubItem .ele.question {
  flex: 5;
}

.Div .AboutList .SubItem .ele.answer {
  flex: 5;
}

.Div .AboutList .SubItem .ele.created_at {
  flex: 2;
}

.Div .AboutList .SubItem .ele.edit_at {
  flex: 2;
}

.appControl {
  margin-top: 20px;
  width: 90%;
  display: flex;
  flex-direction: row-reverse;
}

.appControl .options button {
  outline: none;
  border: none;
  background: transparent;
  width: 42px;
  height: 42px;
  transition-duration: 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.appControl .options #normal:hover {
  background-color: var(--color-background-3);
}

.appControl .options button img {
  width: 20px;
  height: 20px;
  user-select: none;
}
</style>