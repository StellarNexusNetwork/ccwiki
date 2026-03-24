import {nextTick, ref} from 'vue';
import type {NavigationGuardNext, RouteLocationNormalized, Router} from 'vue-router';
import get from 'lodash/get';

type ViewTransitionLike = {
  finished?: Promise<void>
  skipTransition?: () => void
}

type DocumentWithViewTransition = Document & {
  startViewTransition?: (_updateCallback: () => void | Promise<void>) => ViewTransitionLike | undefined
}

const VIEW_TRANSITION_WAIT_TIMEOUT_MS = 320;

export function useRouteTransition(router: Router, options: { disableMarquee: () => void }) {
  const routerLoadingS = ref({display: 'none'});
  const rtLoadingBgS = ref({
    width: '100px',
    height: '100px',
    opacity: 0,
    marginBottom: '0px',
    transitionDuration: '0.5s'
  });
  const rtLoadingS = ref({opacity: 0});

  const blackList: Record<string, string[]> = {
    docs: ['docs']
  };

  let ifLoadingFinish = document.readyState === 'complete';
  let rtIsAnimating = false;
  let allowRouting = false;
  let rtAeF = false;
  let activeViewTransition: ViewTransitionLike | null = null;

  window.addEventListener('load', () => {
    ifLoadingFinish = true;
  }, {once: true});

  function isBlacklisted(from: string, to: string): boolean {
    const item = get(blackList, from);
    return Array.isArray(item) && item.includes(to);
  }

  function waitForRouteDomCommit(timeoutMs = VIEW_TRANSITION_WAIT_TIMEOUT_MS): Promise<void> {
    return new Promise<void>((resolve) => {
      let finished = false;
      let unwatchAfterEach = () => {
      };

      const finish = () => {
        if (finished) {
          return;
        }
        finished = true;
        window.clearTimeout(timeoutId);
        unwatchAfterEach();
        resolve();
      };

      unwatchAfterEach = router.afterEach(() => {
        void nextTick().then(() => {
          requestAnimationFrame(() => {
            finish();
          });
        });
      });

      const timeoutId = window.setTimeout(() => {
        finish();
      }, timeoutMs);
    });
  }

  router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    let blacklisted = false;
    if (typeof from.name === 'string' && typeof to.name === 'string') {
      blacklisted = isBlacklisted(from.name, to.name);
    }

    options.disableMarquee();

    if (!blacklisted) {
      if (ifLoadingFinish && !rtIsAnimating) {
        rtIsAnimating = true;
        allowRouting = false;
        Object.assign(rtLoadingBgS.value, {
          width: '100px',
          height: '100px',
          opacity: 0,
          marginBottom: '0px',
          transitionDuration: '0.5s'
        });
        routerLoadingS.value.display = 'none';
        rtLoadingS.value.opacity = 0;
        setTimeout(() => {
          routerLoadingS.value.display = 'flex';
        }, 10);
        setTimeout(() => {
          Object.assign(rtLoadingBgS.value, {
            width: '250px',
            height: '250px',
            opacity: 1,
            marginBottom: '70px'
          });
        }, 20);
        setTimeout(() => {
          Object.assign(rtLoadingBgS.value, {width: '200px', height: '200px', marginBottom: '0px'});
        }, 500);
        setTimeout(() => {
          rtLoadingS.value.opacity = 1;
        }, 1000);
        setTimeout(() => {
          rtLoadingBgS.value.transitionDuration = '0.75s';
        }, 1499);
        setTimeout(() => {
          Object.assign(rtLoadingBgS.value, {
            width: 'calc(100vw + 100vh)',
            height: 'calc(100vw + 100vh)'
          });
        }, 1500);
        setTimeout(() => {
          next();
          rtLoadingBgS.value.transitionDuration = '0.5s';
          allowRouting = true;
        }, 2250);
      } else {
        if (allowRouting || !ifLoadingFinish) {
          next();
          rtAeF = true;
        } else {
          // 动画进行中时拒绝并等待用户重试，避免导航挂起
          next(false);
        }
      }
    } else {
      const docWithVT = document as DocumentWithViewTransition;
      if (typeof docWithVT.startViewTransition === 'function') {
        try {
          activeViewTransition?.skipTransition?.();
          const transition = docWithVT.startViewTransition(async () => {
            const routeCommitted = waitForRouteDomCommit();
            next();
            await routeCommitted;
          });
          activeViewTransition = transition ?? null;
          transition?.finished?.catch(() => {
          }).finally(() => {
            if (activeViewTransition === transition) {
              activeViewTransition = null;
            }
          });
        } catch {
          activeViewTransition = null;
          next();
        }
      } else {
        next();
      }
    }
  });

  router.afterEach((to: RouteLocationNormalized, from: RouteLocationNormalized) => {
    let blacklisted = false;
    if (typeof from.name === 'string' && typeof to.name === 'string') {
      blacklisted = isBlacklisted(from.name, to.name);
    }

    if (!blacklisted) {
      if (ifLoadingFinish && !rtAeF) {
        allowRouting = false;
        rtLoadingS.value.opacity = 0;
        setTimeout(() => {
          rtLoadingBgS.value.opacity = 0;
        }, 500);
        setTimeout(() => {
          routerLoadingS.value.display = 'none';
        }, 1000);
        setTimeout(() => {
          if (Math.random() < 0.5) {
            Object.assign(rtLoadingBgS.value, {width: '200px', height: '200px'});
          }
          rtIsAnimating = false;
        }, 1100);
      } else {
        rtAeF = false;
      }
    }
  });

  return {
    routerLoadingS,
    rtLoadingBgS,
    rtLoadingS
  };
}
