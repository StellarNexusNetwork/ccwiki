import mitt from 'mitt';

type Events = {
  callOpenSettingsDialog1: void;  // 无参数
  callOpenSettingsDialog2: number; // 带参数
};

export const eventBus = mitt<Events>();