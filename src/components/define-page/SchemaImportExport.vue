<script setup lang="ts">
import { ref } from 'vue'
import { Upload, Download } from '@lucide/vue'
import { useSchemaStore } from '@/stores/schema'
import { useUiStore } from '@/stores/ui'
import { validateSchema } from '@/lib/schema/validate'
import { useDownload } from '@/composables/useDownload'
import type { Schema } from '@/lib/schema/types'

const schemaStore = useSchemaStore()
const uiStore = useUiStore()
const { download } = useDownload()
const fileInput = ref<HTMLInputElement | null>(null)

function exportSchema() {
  const json = JSON.stringify(schemaStore.schema, null, 2)
  download(json, 'schema.json', 'application/json')
}

function triggerImport() {
  fileInput.value?.click()
}

async function onFileSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    const text = await file.text()
    const parsed = JSON.parse(text) as Schema
    const result = validateSchema(parsed)
    if (!result.valid) {
      uiStore.addToast(`Invalid schema: ${result.errors[0]}`, 'error')
      return
    }
    const ok = await schemaStore.setSchema(parsed)
    if (ok) uiStore.addToast('Schema imported', 'success')
  } catch {
    uiStore.addToast('Failed to parse schema file', 'error')
  } finally {
    if (fileInput.value) fileInput.value.value = ''
  }
}
</script>

<template>
  <div class="flex items-center gap-2">
    <button
      class="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
      title="Import schema from JSON file"
      @click="triggerImport"
    >
      <Upload class="w-3.5 h-3.5" />
      Import
    </button>
    <button
      class="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
      title="Export schema as JSON file"
      @click="exportSchema"
    >
      <Download class="w-3.5 h-3.5" />
      Export
    </button>
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      class="hidden"
      @change="onFileSelected"
    />
  </div>
</template>
