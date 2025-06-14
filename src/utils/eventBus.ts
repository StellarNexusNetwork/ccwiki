import mitt from 'mitt';

type Events = {
  callOpenSettingsDialog2: number;
  // 其他事件...
};

export const eventBus = mitt<Events>();