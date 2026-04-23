import { defineStore } from 'pinia'
import { ref } from 'vue'

export type SchemaEditorMode = 'visual' | 'raw'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}

export const useUiStore = defineStore('ui', () => {
  const editMode = ref(false)
  const schemaEditorMode = ref<SchemaEditorMode>('visual')
  const schemaEditorExpanded = ref(false)
  const toasts = ref<Toast[]>([])

  function toggleEditMode(): void {
    editMode.value = !editMode.value
  }

  function setSchemaEditorMode(mode: SchemaEditorMode): void {
    schemaEditorMode.value = mode
  }

  function toggleSchemaEditor(): void {
    schemaEditorExpanded.value = !schemaEditorExpanded.value
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
    schemaEditorExpanded,
    toasts,
    toggleEditMode,
    setSchemaEditorMode,
    toggleSchemaEditor,
    addToast,
    removeToast,
  }
})
