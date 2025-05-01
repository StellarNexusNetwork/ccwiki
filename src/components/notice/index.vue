<template>
  <div class="noticeBar">
    <div class="notice">
      <TransitionGroup name="fade" tag="div" mode="out-in" class="group" @mouseenter="pauseTimer()" @mouseleave="resumeTimer()">
        <div v-for=" (item, index) in noticeList" :key='item.id'>
          <nItem :item="item" :index="index" @rmove-notice="removeNotice"/>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import {nextTick, onMounted, ref} from 'vue'
import {ulid} from "ulid";
import nItem from './item.vue'

let mouseenterItem = false

const noticeList = ref<{
  type: string,
  title: string,
  content: string,
  id: number,
  timer: any,
  startTime: any,
  remaining: number
  progressBar: string
}[]>([])

const noticeList2 = ref([
  {
    'type': 'success',
    'title': '成功',
    'content': '操作成功'
  },
  {
    'type': 'warn',
    'title': '警告！提示信息不宜过长，否则将无法显示！',
    'content': '警告！提示信息不宜过长，否则将无法显示！'
  },
  {
    'type': 'error',
    'title': '错误',
    'content': '操作失败'
  }
])
onMounted(() => {
  for (const i of noticeList2.value) {
    addNotice(i)
  }
});

function addNotice(item: any) {
  const id = ulid()

  noticeList.value.push({
    ...item,
    id,
    timer: null,
    startTime: null,
    remaining: 15000, // 初始15秒
    progressBar: '100%'
  })

  nextTick(() => {
    startTimer(id)
  })
}

// 开始倒计时
function startTimer(id: any) {
  const item: any = noticeList.value.find(i => i.id === id)
  if (!item) return

  item.startTime = Date.now()
  item.timer = setTimeout(() => {
    removeNotice(id)
  }, item.remaining)
}

// 暂停计时
function pauseTimer() {
  mouseenterItem = true;
  for (let i = 0; i < noticeList.value.length; i++) {
    const item: any = noticeList.value[i]
    if (!item) return

    clearTimeout(item.timer)
    const elapsed = Date.now() - item.startTime
    item.remaining -= elapsed
  }
}

// 继续计时
function resumeTimer() {
  mouseenterItem = false;
  for (let i = 0; i < noticeList.value.length; i++) {
    const item = noticeList.value[i]
    if (!item) return

    startTimer(item.id)
  }
}

// 删除通知
function removeNotice(id: any) {
  noticeList.value = noticeList.value.filter(i => i.id !== id)
}

</script>

<style scoped>
@media (min-width: 670px) {
  .noticeBar {
    top: 42px;
  }
}

@media (max-width: 670px) {
  .noticeBar {
    top: 0;
  }
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

.noticeBar {
  position: fixed;
  left: 0;
  width: 100vw;
  transition-duration: 0.3s;
  z-index: 100;
  pointer-events: none;
}

.noticeBar .notice {
  display: flex;
  flex-direction: row-reverse;
  margin: 15px;
  transition-duration: 0.3s;
}

.noticeBar .notice .group {
  pointer-events: auto;
  width: 250px;
  position: relative
}
</style>