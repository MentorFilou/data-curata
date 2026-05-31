<script setup lang="ts">
import { computed } from 'vue'
import { Plus } from '@lucide/vue'
import type { Field } from '@/lib/schema/types'
import { useSchemaStore } from '@/stores/schema'
import SchemaFieldRow from './SchemaFieldRow.vue'

const schemaStore = useSchemaStore()
const fields = computed(() => schemaStore.schema.fields)

function addField() {
  const newField: Field = {
    id: crypto.randomUUID(),
    name: '',
    type: 'string',
    nullable: false,
  }
  schemaStore.addField(newField)
}

function updateField(field: Field) {
  schemaStore.updateField(field)
}

function removeField(id: string) {
  schemaStore.removeField(id)
}

function moveUp(id: string) {
  schemaStore.moveField(id, 'up')
}

function moveDown(id: string) {
  schemaStore.moveField(id, 'down')
}
</script>

<template>
  <div class="p-4 space-y-4">
    <div
      v-if="fields.length === 0"
      class="text-center py-3 px-4 rounded-lg bg-white dark:bg-neutral-800 text-neutral-500 text-sm"
    >
      No fields yet. Click "+ Add field" to start building your schema.
    </div>

    <SchemaFieldRow
      v-for="(field, idx) in fields"
      :key="field.id"
      :field="field"
      :is-first="idx === 0"
      :is-last="idx === fields.length - 1"
      :depth="0"
      @update="updateField"
      @remove="removeField"
      @move-up="moveUp"
      @move-down="moveDown"
      @add-child="addField"
    />

    <div
      class="flex items-center gap-2 bg-white dark:bg-neutral-800 px-4 py-2 rounded-lg w-fit"
    >
      <button
        class="flex items-center gap-2 text-sm text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300 font-medium transition-colors"
        @click="addField"
      >
        <Plus class="w-4 h-4" />
        Add field
      </button>
    </div>
  </div>
</template>
