<template>
  <div :id="index === 0 ? 'firstItem' : undefined" class="item" @mousedown="handleMouseDown" @touchstart="handleMouseDown" :style="'transform:translateX('+deltaX+'px)'+dt">
    <div class="contentBox">
      <img :src="baseUrl+'static/public/svg/notice/' + item.type + '.svg'" alt="" draggable="false">
      <div class="textDiv">
        <div class="title">{{ item.title }}</div>
        <div class="content">{{ item.content }}</div>
      </div>
    </div>
    <div class="progressBar" :style="{ background: getColor(item.type)}"></div>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";

const baseUrl = import.meta.env.BASE_URL

const {item, index} = defineProps(['item', 'index'])
const emit = defineEmits(['rmove-notice'])

// 获取对应颜色
const typeColorMap: any = {
  'success': 'var(--color-primary-normal)',
  'warn': 'var(--color-warning-normal)',
  'error': 'var(--color-danger-normal)'
};

function getColor(type: string) {
  return typeColorMap[type] || 'black';
}

const startX = ref(0)
const deltaX = ref(0)
let isDragging = false
let dt = ref('')

const handleMouseDown = (e: any) => {
  if (e instanceof TouchEvent) {
    e = e.touches[0]
  }
  startX.value = e.clientX
  isDragging = true
  dt.value = ''

  const onMouseMove = (e: any) => {
    if (e instanceof TouchEvent) {
      e = e.touches[0]
    }
    if (isDragging) {
      deltaX.value = e.clientX - startX.value
      deltaX.value = Math.min(deltaX.value, 150)
      deltaX.value = Math.max(deltaX.value, -150)
    }
  }

  const onMouseUp = () => {
    isDragging = false
    if (deltaX.value > 110 || deltaX.value < -110) {
      emit("rmove-notice", item.id)
    } else {
      dt.value = ';transition-duration:0.5s'
      deltaX.value = 0
    }
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    window.removeEventListener('touchmove', onMouseMove)
    window.removeEventListener('touchend', onMouseUp)
    window.removeEventListener('touchcancel', onMouseUp)
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('touchmove', onMouseMove)
  window.addEventListener('touchend', onMouseUp)
  window.addEventListener('touchcancel', onMouseUp)
}
</script>

<style scoped>
.item {
  width: 270px;
  height: 65px;
  box-shadow: 0 0 8px 0 var(--color-shadow-l);
  border-radius: 10px;
  background-color: var(--color-background-noticeBar);
  margin-top: 15px;
  overflow: hidden;
  user-select: none;
  transition-timing-function: ease;
}

.item .contentBox {
  display: flex;
}

#firstItem {
  margin-top: 0;
}

.item .contentBox img {
  width: 50px;
  height: 50px;
  margin: 5px;
  margin-bottom: 6px;
}

.item .contentBox .textDiv {
  padding: 10px 5px
}

.item .contentBox .textDiv .title {
  max-width: calc(270px - 75px - 10px);
  color: var(--color-text-title);
  font-size: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item .contentBox .textDiv .content {
  max-width: calc(270px - 75px - 10px);
  color: var(--color-text-body);
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item .progressBar {
  height: 4px;
  animation: progressBarAnimation 15s cubic-bezier(0.00, 0.25, 0.10, 1.00) forwards; /* 播放一次并保持动画结束状态 */
  animation-play-state: paused;
  animation-iteration-count: 1;
}

.noticeBar .notice .group:hover .item .progressBar {
  animation-play-state: paused;
}

.noticeBar .notice .group:not(:hover) .item .progressBar {
  animation-play-state: running;
}

@keyframes progressBarAnimation {
  0% {
    width: 100%
  }
  100% {
    width: 0
  }
}
</style>