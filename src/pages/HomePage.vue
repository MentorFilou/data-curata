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

// Reset form when schema changes
watch(
  () => schemaStore.schema.fields,
  () => {
    formData.value = buildDefaultData()
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
  formData.value = buildDefaultData()
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
    <div class="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
      <h2 class="text-base font-semibold text-neutral-900 mb-5">Add Entry</h2>

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
          @update:model-value="formData = $event"
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
