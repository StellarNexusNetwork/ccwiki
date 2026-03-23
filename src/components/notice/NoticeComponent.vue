<template>
  <div class="noticeBar">
    <div class="notice" :style="{'--notice-count': notice.displayList.length}">
      <TransitionGroup name="fade" tag="div" mode="out-in" class="group" @mouseenter="pauseTimer()" @mouseleave="resumeTimer()">
        <div v-for=" (item, index) in notice.displayList" :key='item.id' style="pointerEvents: none">
          <NoticeItemCard :item="item" :index="index" @remove-notice="notice.removeNotice"/>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import NoticeItemCard from './components/NoticeItemCard.vue';
import type {NoticeDisplay} from "@/stores/notice";
import {useNoticeStore} from '@/stores/notice';

const notice = useNoticeStore();

// 暂停计时
function pauseTimer() {
  for (let i = 0; i < notice.displayList.length; i++) {
    const item: NoticeDisplay = notice.displayList[i];
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
  for (let i = 0; i < notice.displayList.length; i++) {
    const item = notice.displayList[i];
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
  z-index: 2002;
  pointer-events: none;
}

.noticeBar .notice {
  display: flex;
  flex-direction: row-reverse;
  margin: 15px;
  transition-duration: 0.3s;
  --notice-item-offset: -45px;
  --notice-item-gap: 20px;
  max-height: calc(65px + (var(--notice-count) - 1) * var(--notice-item-gap));
}

.noticeBar .notice:hover {
  --notice-item-offset: 15px;
  --notice-item-gap: 80px;
}

.noticeBar .notice .group {
  pointer-events: auto;
  width: 270px;
  position: relative
}
</style>
