import mitt from 'mitt';

type Events = {
  callOpenSettingsDialog1: void;  // 设置弹窗
  callOpenSettingsDialog2: number; // 设置弹窗(页数)
  callOpenAccountSetting: void; // 侧边栏账号设置
  callCloseAccountSetting: boolean; // 侧边栏账号设置
  callOpenLoginDialog: void; // 登入弹窗
  switchAccountPage: number; // 设置-账号的子页面 0: 账号 1: 登录页
};

export const eventBus = mitt<Events>();
