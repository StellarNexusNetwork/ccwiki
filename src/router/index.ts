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
      path: '/classification/',
      name: 'classification',
      component: () => import('@/views/ClassificationViews/repository/classificationView.vue')
    },
    {
      path: '/classification/:rid',
      name: 'classificationR',
      component: () => import('@/views/ClassificationViews/category/categoryView.vue')
    },
    {
      path: '/classification/:rid/:category/:subcategory',
      name: 'classification_items',
      component: () => import('@/views/ClassificationViews/items/ItemView.vue')
    },
    {
      path: '/docs/:rid/:category/:subcategory/:id',
      name: 'docs',
      component: () => import('@/views/DocsView/DocsView.vue')
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
    },
    {
      path: '/tools/db2/',
      name: 'tools_db2',
      component: () => import('@/views/tools/db/IndexPage.vue')
    }
  ]
});

export default router;
