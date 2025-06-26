<template>
  <div class="sheet" ref="wrapperRef">
    <div
        v-for="(cell, index) in cells"
        :key="index"
        class="cell"
        @click="handleCellClick(index, $event)"
    >
      <template v-if="editingIndex === index">
        <input
            v-model="tempValue"
            ref="inputRef"
            @keydown.enter.prevent="save"
        />
      </template>
      <template v-else>
        {{ cell }}
      </template>
    </div>
  </div>
</template>

<script setup>
import {nextTick, onBeforeUnmount, onMounted, ref} from 'vue'

const cells = ref(['单元格 A', '单元格 B', '单元格 C'])
const editingIndex = ref(null)
const tempValue = ref('')
const inputRef = ref(null)
const wrapperRef = ref(null)

function handleCellClick(index, event) {
  // 如果点击的不是当前正在编辑的格子 -> 保存旧的
  if (editingIndex.value !== null && editingIndex.value !== index) {
    save()
  }

  // 然后进入新的编辑格子
  editingIndex.value = index
  tempValue.value = cells.value[index]
  nextTick(() => inputRef.value?.focus())

  event.stopPropagation() // 阻止冒泡，避免触发外部点击
}

function save() {
  if (editingIndex.value !== null && cells.value[editingIndex.value] !== tempValue.value) {
    cells.value[editingIndex.value] = tempValue.value
    sendToBackend(editingIndex.value, tempValue.value)
    editingIndex.value = null
  }
}

function handleClickOutside(event) {
  // if (!wrapperRef.value.contains(event.target)) {
  save()
  // }
}

function sendToBackend(index, value) {
  // 模拟请求
  console.log('📤 发送数据到后端:', {index, value})
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.sheet {
  display: flex;
  gap: 10px;
  padding: 20px;
}

.cell {
  border: 1px solid #aaa;
  padding: 8px;
  min-width: 100px;
  cursor: pointer;
}

input {
  width: 100%;
  box-sizing: border-box;
}
</style>
