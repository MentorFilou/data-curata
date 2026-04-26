import { defineStore } from 'pinia'
import { ref } from 'vue'

export type SchemaEditorMode = 'visual' | 'raw'
export type Theme = 'light' | 'dark'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}

function applyTheme(t: Theme) {
  document.documentElement.classList.toggle('dark', t === 'dark')
}

export const useUiStore = defineStore('ui', () => {
  const editMode = ref(false)
  const schemaEditorMode = ref<SchemaEditorMode>('visual')
  const toasts = ref<Toast[]>([])
  const theme = ref<Theme>((localStorage.getItem('theme') as Theme) ?? 'light')

  // Sync initial theme to DOM
  applyTheme(theme.value)

  function toggleEditMode(): void {
    editMode.value = !editMode.value
  }

  function setSchemaEditorMode(mode: SchemaEditorMode): void {
    schemaEditorMode.value = mode
  }

  function toggleTheme(): void {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', theme.value)
    applyTheme(theme.value)
  }

  function addToast(message: string, type: Toast['type'] = 'info', duration = 3000): void {
    const id = crypto.randomUUID()
    toasts.value.push({ id, message, type, duration })
    setTimeout(() => removeToast(id), duration)
  }

  function removeToast(id: string): void {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    editMode,
    schemaEditorMode,
    toasts,
    theme,
    toggleEditMode,
    setSchemaEditorMode,
    toggleTheme,
    addToast,
    removeToast,
  }
})
