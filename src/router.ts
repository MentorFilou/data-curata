import { createRouter, createWebHistory } from 'vue-router'
import CollectPage from '@/pages/CollectPage.vue'
import DefinePage from '@/pages/DefinePage.vue'
import HomePage from './pages/HomePage.vue'
import ReviewPage from './pages/ReviewPage.vue'
import DocsPage from './pages/DocsPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/define', name: 'define', component: DefinePage },
    { path: '/collect', name: 'collect', component: CollectPage },
    { path: '/review', name: 'review', component: ReviewPage },
    { path: '/docs/:pathMatch(.*)*', name: 'docs', component: DocsPage },
  ],
})

export default router
