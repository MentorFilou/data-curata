import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './styles/main.css'
import { useSchemaStore } from './stores/schema'
import { useEntriesStore } from './stores/entries'
import { useHistoryStore } from './stores/history'

async function bootstrap() {
  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)
  app.use(router)

  // Hydrate stores from IndexedDB before mounting
  const schemaStore = useSchemaStore()
  const entriesStore = useEntriesStore()
  const historyStore = useHistoryStore()
  await Promise.all([schemaStore.hydrate(), entriesStore.hydrate(), historyStore.hydrate()])

  app.mount('#app')
}

bootstrap().catch(console.error)
