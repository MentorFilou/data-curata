import { createRouter, createWebHistory } from 'vue-router'
import CollectPage from '@/pages/CollectPage.vue'
import DataPage from '@/pages/DataPage.vue'
import DefinePage from '@/pages/DefinePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/define', name: 'define', component: DefinePage },
    { path: '/collect', name: 'collect', component: CollectPage },
    { path: '/data', name: 'data', component: DataPage },
  ],
})

export default router
