import {beforeEach, describe, expect, it, vi} from 'vitest';
import {mount} from '@vue/test-utils';
import {reactive} from 'vue';
import App from '../App.vue';

const mocks = vi.hoisted(() => ({
  initFetchData: vi.fn(),
  setPrimeLocale: vi.fn(),
  usePrimeVue: vi.fn(),
  useRouteTransition: vi.fn(),
  transitionOptions: null as null | { disableMarquee: () => void },
  windowStore: null as any,
  settingStore: null as any,
  primevue: {
    config: {
      locale: {},
    },
  },
}));

vi.mock('@/stores/dataSources.ts', () => ({
  useDataSourcesStore: () => ({
    initFetchData: mocks.initFetchData,
  }),
}));

vi.mock('@/stores/window', () => ({
  useWindowStore: () => mocks.windowStore,
}));

vi.mock('@/stores/setting', () => ({
  useSettingStore: () => mocks.settingStore,
}));

vi.mock('primevue/config', () => ({
  usePrimeVue: mocks.usePrimeVue,
}));

vi.mock('@/utils/i18n/primevue.ts', () => ({
  setPrimeLocale: mocks.setPrimeLocale,
}));

vi.mock('@/composables/useRouteTransition', async () => {
  const {ref} = await import('vue');

  return {
    useRouteTransition: mocks.useRouteTransition.mockImplementation(
      (_router, options) => {
        mocks.transitionOptions = options;

        return {
          routerLoadingS: ref({display: 'none'}),
          rtLoadingBgS: ref({
            width: '100px',
            height: '100px',
            opacity: 0,
          }),
          rtLoadingS: ref({opacity: 0}),
        };
      },
    ),
  };
});

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();

  return {
    ...actual,
    RouterView: {
      name: 'RouterViewStub',
      template: '<div class="router-view-stub"></div>',
    },
    useRouter: () => ({}),
  };
});

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.windowStore = reactive({
      enableMobileSupport: false,
      isMarqueeEnabled: true,
    });

    mocks.settingStore = {
      setting: reactive({
        lang: 'zh_cn',
        theme: {
          appearance: 'light',
        },
      }),
    };

    mocks.usePrimeVue.mockReturnValue(mocks.primevue);

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
  });

  function mountApp() {
    return mount(App, {
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
  }

  it('renders the application shell', () => {
    const wrapper = mountApp();

    expect(wrapper.find('.app').exists()).toBe(true);
    expect(wrapper.find('.mainDiv').exists()).toBe(true);
    expect(wrapper.find('.main').exists()).toBe(true);
    expect(wrapper.find('.routerLoading').exists()).toBe(true);
    expect(wrapper.find('.router-view-stub').exists()).toBe(true);

    wrapper.unmount();
  });

  it('initializes data sources on setup', () => {
    const wrapper = mountApp();

    expect(mocks.initFetchData).toHaveBeenCalledOnce();

    wrapper.unmount();
  });

  it('initializes PrimeVue locale with the current language', () => {
    const wrapper = mountApp();

    expect(mocks.usePrimeVue).toHaveBeenCalledOnce();
    expect(mocks.setPrimeLocale).toHaveBeenCalledWith(
      'zh_cn',
      mocks.primevue,
    );

    wrapper.unmount();
  });

  it('registers route transition with the router', () => {
    const wrapper = mountApp();

    expect(mocks.useRouteTransition).toHaveBeenCalledOnce();
    expect(mocks.transitionOptions).not.toBeNull();

    wrapper.unmount();
  });

  it('disables marquee when requested by route transition', () => {
    const wrapper = mountApp();

    mocks.windowStore.isMarqueeEnabled = true;
    mocks.transitionOptions!.disableMarquee();

    expect(mocks.windowStore.isMarqueeEnabled).toBe(false);

    wrapper.unmount();
  });

  it('adjusts layout when mobile support is enabled', async () => {
    const wrapper = mountApp();

    const mainDiv = wrapper.find('.mainDiv').element as HTMLElement;
    const main = wrapper.find('.main').element as HTMLElement;

    expect(mainDiv.style.paddingLeft).toBe('50px');
    expect(main.style.width).toBe('calc(100vw - 50px)');

    mocks.windowStore.enableMobileSupport = true;
    await wrapper.vm.$nextTick();

    expect(mainDiv.style.paddingLeft).toBe('0px');
    expect(main.style.width).toBe('100vw');

    mocks.windowStore.enableMobileSupport = false;
    await wrapper.vm.$nextTick();

    expect(mainDiv.style.paddingLeft).toBe('50px');
    expect(main.style.width).toBe('calc(100vw - 50px)');

    wrapper.unmount();
  });

  it('applies dark theme class when appearance is dark', async () => {
    const wrapper = mountApp();

    expect(wrapper.find('.app').classes()).not.toContain('app-dark');

    mocks.settingStore.setting.theme.appearance = 'dark';
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.app').classes()).toContain('app-dark');

    mocks.settingStore.setting.theme.appearance = 'light';
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.app').classes()).not.toContain('app-dark');

    wrapper.unmount();
  });
});
