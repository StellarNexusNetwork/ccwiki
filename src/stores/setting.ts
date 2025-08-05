import {defineStore} from 'pinia';
import {nextTick, reactive, ref, watchEffect} from 'vue';
import defaultSetting from '@/assets/json/defaultSetting.json';
import {ulid} from 'ulid';


export const useSettingStore = defineStore('setting',
  () => {
    const langData = {};
    const oldSetting = reactive(
      JSON.parse(localStorage.getItem('setting') as string) || {}
    );
    const setting = reactive(Object.assign({}, defaultSetting, oldSetting));
    watchEffect(() => {
      localStorage.setItem('setting', JSON.stringify(setting));
    });

    //主题
    watchEffect(() => {
      if (setting.theme.appearance === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else if (setting.theme.appearance === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    });
    return {setting, langData};
  }
);

export const useNoticeStore = defineStore('notice',
  () => {
    type NotificationType = 'success' | 'error' | 'warn' | 'other';

    type Notification = {
      type: NotificationType;
      title: string;
      content: string;
      id: string;
      timer: number | undefined;
      startTime: number | undefined;
      remaining: number;
      progressBar: string;
    }

    const noticeList = ref<Notification[]>([]);

    function addNotice(item: { type: NotificationType, title: string, content: string }) {
      const id: string = ulid();

      if (!['success', 'warn', 'error'].includes(item.type)) {
        item.type = 'other';
      }

      noticeList.value.push({
        ...item,
        id,
        timer: undefined,
        startTime: undefined,
        remaining: 15000, // 初始15秒
        progressBar: '100%'
      });

      nextTick(() => {
        startTimer(id);
      });
    }

    // 开始倒计时
    function startTimer(id: any) {
      const item: any = noticeList.value.find(i => i.id === id);
      if (!item) return;

      item.startTime = Date.now();
      item.timer = setTimeout(() => {
        removeNotice(id);
      }, item.remaining);
    }

    // 删除通知
    function removeNotice(id: any) {
      noticeList.value = noticeList.value.filter(i => i.id !== id);
    }

    return {noticeList, addNotice, startTimer, removeNotice};
  }
);
