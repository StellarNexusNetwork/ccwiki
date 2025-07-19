<template>
  <div class="noticeBar">
    <div class="notice">
      <TransitionGroup name="fade" tag="div" mode="out-in" class="group" @mouseenter="pauseTimer()" @mouseleave="resumeTimer()">
        <div v-for=" (item, index) in notice.noticeList" :key='item.id'>
          <ItemCard :item="item" :index="index" @remove-notice="notice.removeNotice"/>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import ItemCard from './ItemCard.vue';
import {useNoticeStore} from '@/stores/setting';

type NotificationType = 'success' | 'error' | 'warn' | 'other';

type Notification = {
  type: NotificationType;
  title: string;
  content: string;
  id: string;
  timer: number | undefined;
  startTime: number | undefined
  remaining: number;
  progressBar: string;
}

const notice = useNoticeStore();

// 暂停计时
function pauseTimer() {
  for (let i = 0; i < notice.noticeList.length; i++) {
    const item: Notification = notice.noticeList[i];
    if (!item) return;

    clearTimeout(item.timer);
    let elapsed = Date.now();
    if (item.startTime) {
      elapsed = Date.now() - item.startTime;
    }
    item.remaining -= elapsed;
  }
}

// 继续计时
function resumeTimer() {
  for (let i = 0; i < notice.noticeList.length; i++) {
    const item = notice.noticeList[i];
    if (!item) return;

    notice.startTimer(item.id);
  }
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
  width: 270px;
  position: relative
}
</style>