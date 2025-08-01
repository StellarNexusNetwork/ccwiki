import {createRouter, createWebHashHistory} from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/classification/',
      name: 'classification',
      component: () => import('@/views/classification/IndexPage.vue')
    },
    {
      path: '/classification/:rid',
      name: 'classificationR',
      component: () => import('@/views/classificationR/IndexPage.vue')
    },
    {
      path: '/classification/:rid/:category/:subcategory',
      name: 'classification_items',
      component: () => import('../views/classification_items/IndexPage.vue')
    },
    {
      path: '/docs/:rid/:category/:subcategory/:id',
      name: 'docs',
      component: () => import('../views/docs/IndexPage.vue')
    },
    // {
    //   path: '/20241108/',
    //   name: '20241108',
    //   component: () => import('../views/20241108/WebUI2.vue')
    // },
    {
      path: '/eye8/',
      name: 'eye8',
      component: () => import('../views/WebUI.vue')
    },
    {
      path: '/chat/',
      name: 'chat',
      component: () => import('../views/chat/IndexPage.vue')
    },
    {
      path: '/about/',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFound.vue')
    },
    {
      path: '/setting/uninstall/',
      name: 'uninstall',
      component: () => import('../views/UninstallPage.vue')
    }
  ]
});

export default router;
