import mitt from 'mitt';

type Events = {
  callOpenSettingsDialog1: void;  // 设置弹窗
  callOpenSettingsDialog2: number; // 设置弹窗(页数)
  callOpenAccountSetting: void; // 侧边栏账号设置
  callCloseAccountSetting: boolean; // 侧边栏账号设置
  callOpenLoginDialog: void; // 登入弹窗
};

export const eventBus = mitt<Events>();
