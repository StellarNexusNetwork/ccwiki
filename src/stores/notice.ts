import {ulid} from 'ulid';
import {nextTick, ref} from 'vue';
import {defineStore} from 'pinia';

type noticeType = 'success' | 'error' | 'warn' | 'other';

export interface noticeItem {
  type: noticeType,
  title: string,
  content: any
}

export type Notice = {
  type: noticeType;
  title: string;
  content: string;
  id: string;
  time: number;
}

export type NoticeDisplay = Notice & {
  timer: number | undefined;
  startTime: number | undefined;
  remaining: number;
  progressBar: string;
}

export const useNoticeStore = defineStore('notice', () => {

    const noticeList = ref<Notice[]>([]);
    const displayList = ref<NoticeDisplay[]>([]);


    function addNotice(type: noticeType, title: string, content: any) {
      const id: string = ulid();
      const loggers = {
        success: console.log,
        warn: console.warn,
        error: console.error,
        other: console.log
      };

      if (!['success', 'warn', 'error'].includes(type)) {
        type = 'other';
      }

      const contentStr = content.toString()
      noticeList.value.push({
        type: type,
        title: title,
        content: contentStr,
        id,
        time: Date.now()
      });

      displayList.value.push({
        type: type,
        title: title,
        content: contentStr,
        id,
        time: Date.now(),
        timer: undefined,
        startTime: undefined,
        remaining: 15000, // 初始15秒
        progressBar: '100%'
      });

      // todo:让长度可以被设置
      if (displayList.value.length >= 4) {
        removeDisplayNotice(displayList.value[0].id);
      }

      const logger = loggers[type] || console.log;
      logger(`[${type}] ${title} ${content}`);

      nextTick(() => {
        startTimer(id);
      });
    }

    // 开始倒计时
    function startTimer(id: any) {
      const item: any = displayList.value.find(i => i.id === id);
      if (!item) return;

      item.startTime = Date.now();
      item.timer = setTimeout(() => {
        removeDisplayNotice(id);
      }, item.remaining);
    }

    // 删除显示中的通知
    function removeDisplayNotice(id: any) {
      displayList.value = displayList.value.filter(i => i.id !== id);
    }

    // 删除通知
    function removeNotice(id: any) {
      removeDisplayNotice(id);
      noticeList.value = noticeList.value.filter(i => i.id !== id);
    }

    return {noticeList, displayList, addNotice, startTimer, removeNotice};
  }
);
