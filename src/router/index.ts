import { createRouter, createWebHashHistory } from 'vue-router'

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
      component: () => import('../views/classification/classification.vue')
    },
    {
      path: '/20241108/',
      name: '20241108',
      component: () => import('../views/20241108/eye8_copy.vue')
    },
    {
      path: '/eye8/',
      name: 'eye8',
      component: () => import('../views/eye8.vue')
    },
    {
      path: '/chat/',
      name: 'chat',
      component: () => import('../views/chat/chat.vue')
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
      path: '/docs/:id',
      name: 'docs',
      component: () => import('../views/docs/docs.vue')
    },
    {
      path: '/setting/uninstall/',
      name: 'uninstall',
      component: () => import('../views/uninstall.vue')
    }
  ]
})

export default router
