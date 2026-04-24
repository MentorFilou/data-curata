<script setup lang="ts">
import { Pencil, Trash2 } from 'lucide-vue-next'
import type { Entry, Field, EntryValue } from '@/lib/schema/types'
import IconButton from '@/components/common/IconButton.vue'

defineProps<{
  entry: Entry
  fields: Field[]
  editMode: boolean
}>()

const emit = defineEmits<{ edit: [id: string]; remove: [id: string] }>()

function cellValue(entry: Entry, field: Field): string {
  const val = entry.data[field.id]
  return formatValue(val)
}

function formatValue(val: EntryValue): string {
  if (val === null || val === undefined) return '—'
  if (typeof val === 'boolean') return val ? 'Yes' : 'No'
  if (Array.isArray(val)) return `[${val.length} items]`
  if (typeof val === 'object') return '{…}'
  return String(val)
}
</script>

<template>
  <tr class="border-b border-neutral-100 hover:bg-neutral-50 transition-colors dark:border-neutral-700 dark:hover:bg-neutral-800/60">
    <td
      v-for="field in fields"
      :key="field.id"
      class="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 max-w-xs truncate"
      :title="String(entry.data[field.id] ?? '')"
    >
      {{ cellValue(entry, field) }}
    </td>
    <td v-if="editMode" class="px-4 py-3">
      <div class="flex items-center gap-1">
        <IconButton size="sm" title="Edit entry" @click="emit('edit', entry.id)">
          <Pencil class="w-3.5 h-3.5" />
        </IconButton>
        <IconButton size="sm" title="Delete entry" variant="danger" @click="emit('remove', entry.id)">
          <Trash2 class="w-3.5 h-3.5" />
        </IconButton>
      </div>
    </td>
  </tr>
</template>
