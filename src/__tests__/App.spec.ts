import {describe, expect, it, vi} from 'vitest';
import {mount} from '@vue/test-utils';
import {defineComponent} from 'vue';
import App from '../App.vue';

const beforeEachHandlers: Array<(...args: any[]) => void> = [];
const afterEachHandlers: Array<(...args: any[]) => void> = [];

vi.mock('@/stores/dataSources', () => ({
  useDataSourcesStore: () => ({
    initFetchData: vi.fn(),
  }),
}));

vi.mock('@/stores/window', () => ({
  useWindowStore: () => ({
    enableMobileSupport: false,
    isMarqueeEnabled: false,
  }),
}));

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return {
    ...actual,
    RouterView: defineComponent({
      name: 'RouterViewStub',
      template: '<div class="router-view-stub"></div>',
    }),
    useRouter: () => ({
      beforeEach: (cb: (...args: any[]) => void) => {
        beforeEachHandlers.push(cb);
      },
      afterEach: (cb: (...args: any[]) => void) => {
        afterEachHandlers.push(cb);
        return () => {};
      },
    }),
  };
});

describe('App', () => {
  it('mounts and renders shell components', () => {
    const wrapper = mount(App, {
      global: {
        mocks: {
          $route: {
            fullPath: '/',
          },
        },
        stubs: {
          TitleBar: true,
          NoticeComponent: true,
          NavigationBar: true,
          SettingDialog: true,
          LoginDialog: true,
        },
      },
    });

    expect(wrapper.find('.app').exists()).toBe(true);
    expect(wrapper.find('.mainDiv').exists()).toBe(true);
    expect(wrapper.find('.routerLoading').exists()).toBe(true);
    expect(beforeEachHandlers.length).toBeGreaterThan(0);
    expect(afterEachHandlers.length).toBeGreaterThan(0);
  });
});
