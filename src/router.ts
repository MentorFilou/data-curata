import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('@/pages/HomePage.vue') },
    { path: '/define', name: 'define', component: () => import('@/pages/DefinePage.vue') },
    { path: '/collect', name: 'collect', component: () => import('@/pages/CollectPage.vue') },
    { path: '/review', name: 'review', component: () => import('@/pages/ReviewPage.vue') },
    {
      path: '/docs/:pathMatch(.*)*',
      name: 'docs',
      component: () => import('@/pages/DocsPage.vue'),
    },
  ],
})

export default router
