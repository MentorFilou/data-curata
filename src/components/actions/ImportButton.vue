<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from '@lucide/vue'
import { useEntriesStore } from '@/stores/entries'
import { useSchemaStore } from '@/stores/schema'
import { useHistoryStore } from '@/stores/history'
import { useUiStore } from '@/stores/ui'
import type { EntryObject } from '@/lib/schema/types'
import { reverseRemapKeys } from '@/lib/export/remap'

const entriesStore = useEntriesStore()
const schemaStore = useSchemaStore()
const historyStore = useHistoryStore()
const uiStore = useUiStore()

const fileInput = ref<HTMLInputElement | null>(null)
const pendingData = ref<EntryObject[] | null>(null)

function triggerFileInput() {
  fileInput.value?.click()
}

async function onFileSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  ;(event.target as HTMLInputElement).value = ''

  let parsed: unknown
  try {
    parsed = JSON.parse(await file.text())
  } catch {
    uiStore.addToast('Invalid JSON file', 'error')
    return
  }

  if (
    !Array.isArray(parsed) ||
    !parsed.every((item) => item !== null && typeof item === 'object' && !Array.isArray(item))
  ) {
    uiStore.addToast('Expected a JSON array of objects', 'error')
    return
  }

  pendingData.value = parsed as EntryObject[]
}

async function doImport(replace: boolean) {
  const raw = pendingData.value
  pendingData.value = null
  if (!raw) return

  const fields = schemaStore.schema.fields
  const remapped = raw.map((data) => reverseRemapKeys(data, fields))

  if (replace) {
    await historyStore.snapshot('import', schemaStore.schema, entriesStore.entries)
    await entriesStore.replaceAll(
      remapped.map((data) => ({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        data,
      }))
    )
    uiStore.addToast(`Imported ${remapped.length} entries (replaced existing)`, 'success')
  } else {
    remapped.forEach((data) => entriesStore.addEntry(data))
    uiStore.addToast(`Imported ${remapped.length} entries (merged)`, 'success')
  }
}

function cancelImport() {
  pendingData.value = null
}
</script>

<template>
  <div class="relative">
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      class="hidden"
      @change="onFileSelected"
    >

    <button
      class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
      @click="triggerFileInput"
    >
      <Upload class="w-4 h-4" />
      Import
    </button>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="pendingData !== null"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @keydown.esc="cancelImport"
        >
          <div
            class="absolute inset-0 bg-black/40"
            @click="cancelImport"
          />
          <div
            class="relative bg-white dark:bg-neutral-800 rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-dialog-title"
          >
            <h2
              id="import-dialog-title"
              class="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
            >
              Import {{ pendingData?.length }} {{ pendingData?.length === 1 ? 'entry' : 'entries' }}
            </h2>
            <p class="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              <strong>Merge</strong> appends to existing entries. <strong>Replace</strong> clears
              current entries first (a snapshot is saved automatically).
            </p>
            <div class="flex flex-col gap-2 pt-1">
              <button
                class="w-full px-4 py-2 text-sm font-medium rounded-lg bg-accent-600 text-white hover:bg-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                @click="doImport(false)"
              >
                Merge
              </button>
              <button
                class="w-full px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                @click="doImport(true)"
              >
                Replace all
              </button>
              <button
                class="w-full px-4 py-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 focus-visible:outline-none"
                @click="cancelImport"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
