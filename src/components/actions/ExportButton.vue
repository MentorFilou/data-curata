<script setup lang="ts">
import { ref, computed } from 'vue'
import { Download, ChevronDown } from 'lucide-vue-next'
import { useEntriesStore } from '@/stores/entries'
import { useSchemaStore } from '@/stores/schema'
import { useUiStore } from '@/stores/ui'
import { useDownload } from '@/composables/useDownload'
import { formats } from '@/lib/export/index'

const entriesStore = useEntriesStore()
const schemaStore = useSchemaStore()
const uiStore = useUiStore()
const { download } = useDownload()

const showDropdown = ref(false)

const dateStr = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

function exportWith(formatId: string) {
  const fmt = formats.find((f) => f.id === formatId)
  if (!fmt) return
  if (entriesStore.entries.length === 0) {
    uiStore.addToast('No entries to export', 'info')
    return
  }
  const content = fmt.serialize(entriesStore.entries, schemaStore.schema)
  download(content, `entries-${dateStr.value}.${fmt.extension}`, fmt.mimeType)
  showDropdown.value = false
  uiStore.addToast(`Exported as ${fmt.label}`, 'success')
}
</script>

<template>
  <div class="relative">
    <div class="flex rounded-lg border border-neutral-300 overflow-hidden">
      <button
        class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        @click="exportWith('json')"
      >
        <Download class="w-4 h-4" />
        Export
      </button>
      <button
        class="px-2 py-2 border-l border-neutral-300 text-neutral-600 hover:bg-neutral-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        @click="showDropdown = !showDropdown"
        aria-label="More export formats"
      >
        <ChevronDown class="w-4 h-4" />
      </button>
    </div>

    <div
      v-if="showDropdown"
      class="absolute left-0 top-full mt-1 w-40 bg-white rounded-lg border border-neutral-200 shadow-lg z-20 py-1"
    >
      <button
        v-for="fmt in formats"
        :key="fmt.id"
        class="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
        @click="exportWith(fmt.id)"
      >
        {{ fmt.label }}
      </button>
    </div>

    <!-- Close on click outside -->
    <div v-if="showDropdown" class="fixed inset-0 z-10" @click="showDropdown = false" />
  </div>
</template>
