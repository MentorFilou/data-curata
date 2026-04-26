<script setup lang="ts">
import { ref, computed } from 'vue'
import { Download, ChevronDown } from '@lucide/vue'
import { useEntriesStore } from '@/stores/entries'
import { useSchemaStore } from '@/stores/schema'
import { useUiStore } from '@/stores/ui'
import { useDownload } from '@/composables/useDownload'
import { formats } from '@/lib/export/index'
import { remapKeys } from '@/lib/export/remap'

const entriesStore = useEntriesStore()
const schemaStore = useSchemaStore()
const uiStore = useUiStore()
const { download } = useDownload()

const showDropdown = ref(false)
const pendingFormatId = ref<string | null>(null)

const dateStr = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

function chooseThenExport(formatId: string) {
  if (entriesStore.entries.length === 0) {
    uiStore.addToast('No entries to export', 'info')
    return
  }
  showDropdown.value = false
  pendingFormatId.value = formatId
}

function doExport(useNames: boolean) {
  const formatId = pendingFormatId.value
  pendingFormatId.value = null
  if (!formatId) return

  const fmt = formats.find((f) => f.id === formatId)
  if (!fmt) return

  const entries = useNames
    ? entriesStore.entries.map((e) => ({
        ...e,
        data: remapKeys(e.data, schemaStore.schema.fields),
      }))
    : entriesStore.entries

  const content = fmt.serialize(entries, schemaStore.schema)
  download(content, `entries-${dateStr.value}.${fmt.extension}`, fmt.mimeType)
  uiStore.addToast(`Exported as ${fmt.label}`, 'success')
}

function cancelExport() {
  pendingFormatId.value = null
}
</script>

<template>
  <div class="relative">
    <div class="flex rounded-lg border border-neutral-300 dark:border-neutral-600 overflow-hidden">
      <button
        class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        @click="chooseThenExport('json')"
      >
        <Download class="w-4 h-4" />
        Export
      </button>
      <button
        class="px-2 py-2 border-l border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        aria-label="More export formats"
        @click="showDropdown = !showDropdown"
      >
        <ChevronDown class="w-4 h-4" />
      </button>
    </div>

    <div
      v-if="showDropdown"
      class="absolute left-0 top-full mt-1 w-40 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-lg z-20 py-1"
    >
      <button
        v-for="fmt in formats"
        :key="fmt.id"
        class="w-full text-left px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
        @click="chooseThenExport(fmt.id)"
      >
        {{ fmt.label }}
      </button>
    </div>

    <!-- Close dropdown on click outside -->
    <div
      v-if="showDropdown"
      class="fixed inset-0 z-10"
      @click="showDropdown = false"
    />

    <!-- Key mode dialog -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="pendingFormatId !== null"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @keydown.esc="cancelExport"
        >
          <div
            class="absolute inset-0 bg-black/40"
            @click="cancelExport"
          />
          <div
            class="relative bg-white dark:bg-neutral-800 rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="key-mode-title"
          >
            <h2
              id="key-mode-title"
              class="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
            >
              Export keys as
            </h2>
            <p class="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Use field <strong>names</strong> for human-readable output, or field
              <strong>IDs</strong> to keep full schema compatibility.
            </p>
            <div class="flex flex-col gap-2 pt-1">
              <button
                class="w-full px-4 py-2 text-sm font-medium rounded-lg bg-accent-600 text-white hover:bg-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                @click="doExport(true)"
              >
                Field names
              </button>
              <button
                class="w-full px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                @click="doExport(false)"
              >
                Field IDs
              </button>
              <button
                class="w-full px-4 py-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 focus-visible:outline-none"
                @click="cancelExport"
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
