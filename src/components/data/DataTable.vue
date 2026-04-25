<script setup lang="ts">
import type { Entry, Field } from '@/lib/schema/types'
import DataTableRow from './DataTableRow.vue'

defineProps<{
  entries: Entry[]
  fields: Field[]
  editMode: boolean
}>()

const emit = defineEmits<{ edit: [id: string]; remove: [id: string] }>()
</script>

<template>
  <div class="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-700">
    <table class="w-full text-sm">
      <thead>
        <tr
          class="bg-neutral-50 border-b border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700"
        >
          <th
            v-for="field in fields"
            :key="field.id"
            class="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wide dark:text-neutral-400"
          >
            {{ field.name }}
          </th>
          <th v-if="editMode" class="px-4 py-3 w-20" />
        </tr>
      </thead>
      <tbody>
        <DataTableRow
          v-for="entry in entries"
          :key="entry.id"
          :entry="entry"
          :fields="fields"
          :edit-mode="editMode"
          @edit="emit('edit', $event)"
          @remove="emit('remove', $event)"
        />
      </tbody>
    </table>
  </div>
</template>
