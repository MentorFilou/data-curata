<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'
import { useEntriesStore } from '@/stores/entries'
import { useHistoryStore } from '@/stores/history'
import { useSchemaStore } from '@/stores/schema'
import { useUiStore } from '@/stores/ui'
import { useConfirm } from '@/composables/useConfirm'
import { computed } from 'vue'

const entriesStore = useEntriesStore()
const historyStore = useHistoryStore()
const schemaStore = useSchemaStore()
const uiStore = useUiStore()
const { confirm } = useConfirm()

const count = computed(() => entriesStore.entries.length)

async function clearAll() {
  const ok = await confirm({
    title: 'Clear all data',
    message: `Delete all ${count.value} ${count.value === 1 ? 'entry' : 'entries'}? A snapshot will be saved so you can restore.`,
    confirmLabel: 'Delete all',
    danger: true,
  })
  if (!ok) return
  await historyStore.snapshot('clear-all', schemaStore.schema, entriesStore.entries)
  await entriesStore.clearAll()
  uiStore.addToast('All entries deleted. Snapshot saved.', 'info')
}
</script>

<template>
  <button
    :disabled="count === 0"
    :class="[
      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
      count > 0
        ? 'border border-red-200 text-red-600 hover:bg-red-50'
        : 'border border-neutral-200 text-neutral-400 cursor-not-allowed',
    ]"
    @click="clearAll"
  >
    <Trash2 class="w-4 h-4" />
    Clear all data
  </button>
</template>
