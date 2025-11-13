import {createRouter, createWebHashHistory} from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/docs/:pathMatch(.*)*',
      name: 'docs',
      component: () => import('@/views/DocsView.vue'),
    },
    // {
    //   path: '/20241108/',
    //   name: '20241108',
    //   component: () => import('@/views/20241108/WebUI2.vue')
    // },
    {
      path: '/eye8/',
      name: 'eye8',
      component: () => import('@/views/WebUI.vue')
    },
    {
      path: '/chat/',
      name: 'chat',
      component: () => import('@/views/ChatView/ChatView.vue')
    },
    {
      path: '/about/',
      name: 'about',
      component: () => import('@/views/AboutView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/ErrorViews/NotFoundView.vue')
    },
    {
      path: '/setting/uninstall/',
      name: 'uninstall',
      component: () => import('@/views/UninstallPage.vue')
    }
  ]
});

export default router;
