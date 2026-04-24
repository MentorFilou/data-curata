<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import SchemaEditor from '@/components/schema/SchemaEditor.vue'
import EntryForm from '@/components/entry/EntryForm.vue'
import EntryActions from '@/components/entry/EntryActions.vue'
import ViewDataButton from '@/components/actions/ViewDataButton.vue'
import ExportButton from '@/components/actions/ExportButton.vue'
import { useSchemaStore } from '@/stores/schema'
import { useEntriesStore } from '@/stores/entries'
import { useUiStore } from '@/stores/ui'
import { validateEntry } from '@/lib/schema/validate'
import { defaultValueForField } from '@/lib/schema/defaults'
import type { EntryObject } from '@/lib/schema/types'

const schemaStore = useSchemaStore()
const entriesStore = useEntriesStore()
const uiStore = useUiStore()

function buildDefaultData(): EntryObject {
  const data: EntryObject = {}
  for (const field of schemaStore.schema.fields) {
    data[field.id] = defaultValueForField(field)
  }
  return data
}

const formData = ref<EntryObject>(buildDefaultData())
const pinnedFields = ref<Set<string>>(new Set())

// Reset form when schema changes; clear pins for fields that no longer exist
watch(
  () => schemaStore.schema.fields,
  (fields) => {
    formData.value = buildDefaultData()
    const validIds = new Set(fields.map((f) => f.id))
    pinnedFields.value = new Set([...pinnedFields.value].filter((id) => validIds.has(id)))
  },
  { deep: true }
)

const validationResult = computed(() =>
  validateEntry(formData.value, schemaStore.schema)
)

const canSubmit = computed(
  () => schemaStore.schema.fields.length > 0 && validationResult.value.valid
)

function onSubmit() {
  if (!canSubmit.value) return
  entriesStore.addEntry({ ...formData.value })
  const newData = buildDefaultData()
  for (const fieldId of pinnedFields.value) {
    if (fieldId in formData.value) {
      newData[fieldId] = formData.value[fieldId]
    }
  }
  formData.value = newData
  uiStore.addToast('Entry added', 'success')
}

function onReset() {
  formData.value = buildDefaultData()
}
</script>

<template>
  <div class="space-y-8">
    <!-- Schema editor -->
    <SchemaEditor />

    <!-- Entry form -->
    <div class="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm dark:bg-neutral-800 dark:border-neutral-700">
      <h2 class="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-5">Add Entry</h2>

      <div v-if="schemaStore.schema.fields.length === 0" class="text-center py-10 text-neutral-500">
        <p class="text-sm">No schema defined yet.</p>
        <p class="text-xs mt-1">
          Click <strong>Schema · click to edit</strong> above to define your data model.
        </p>
      </div>

      <template v-else>
        <EntryForm
          :fields="schemaStore.schema.fields"
          :model-value="formData"
          :errors="canSubmit ? undefined : validationResult.errors"
          variant="full"
          :pinned-fields="pinnedFields"
          @update:model-value="formData = $event"
          @update:pinned-fields="pinnedFields = $event"
        />
        <EntryActions :can-submit="canSubmit" @submit="onSubmit" @reset="onReset" />
      </template>
    </div>

    <!-- Action row -->
    <div class="flex items-center gap-3">
      <ViewDataButton />
      <ExportButton />
    </div>
  </div>
</template>
