<script setup lang="ts">
import { ref, computed, watch, provide } from 'vue'
import EntryForm from '@/components/collect-page/EntryForm.vue'
import EntryActions from '@/components/collect-page/EntryActions.vue'
import { useSchemaStore } from '@/stores/schema'
import { useEntriesStore } from '@/stores/entries'
import { useUiStore } from '@/stores/ui'
import { validateEntry } from '@/lib/schema/validate'
import { defaultValueForField } from '@/lib/schema/defaults'
import type { EntryObject, EntryValue } from '@/lib/schema/types'

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

const DRAFT_KEY = 'data-curata:collect-draft'

function schemaFingerprint(): string {
  return schemaStore.schema.fields.map((f) => f.id).join(',')
}

function saveDraft(data: EntryObject): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ fingerprint: schemaFingerprint(), data }))
  } catch {
    // Storage quota exceeded — silently skip
  }
}

function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY)
}

function loadDraft(): EntryObject | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { fingerprint: string; data: EntryObject }
    if (parsed.fingerprint !== schemaFingerprint()) return null
    return parsed.data
  } catch {
    return null
  }
}

const restoredDraft = loadDraft()
const formData = ref<EntryObject>(restoredDraft ?? buildDefaultData())
const pinnedPaths = ref<Set<string>>(new Set())

if (restoredDraft) {
  uiStore.addToast('Draft restored', 'info')
}

watch(formData, (value) => saveDraft(value), { deep: true })

function togglePin(path: string) {
  const next = new Set(pinnedPaths.value)
  if (next.has(path)) next.delete(path)
  else next.add(path)
  pinnedPaths.value = next
}

provide('pinnedPaths', pinnedPaths)
provide('togglePin', togglePin)

// Reset form, pins, and draft when schema changes
watch(
  () => schemaStore.schema.fields,
  () => {
    formData.value = buildDefaultData()
    pinnedPaths.value = new Set()
    clearDraft()
  },
  { deep: true }
)

const validationResult = computed(() =>
  validateEntry(formData.value, schemaStore.schema, {
    existingEntries: entriesStore.entries,
  })
)

const canSubmit = computed(
  () => schemaStore.schema.fields.length > 0 && validationResult.value.valid
)

function applyPins(
  source: EntryObject,
  target: EntryObject,
  prefix: string,
  nextPins: Set<string>
): void {
  for (const fieldId of Object.keys(source)) {
    const path = prefix + fieldId
    if (pinnedPaths.value.has(path)) {
      target[fieldId] = source[fieldId]
    } else {
      const subPrefix = path + '.'
      const hasSub = [...pinnedPaths.value].some((p) => p.startsWith(subPrefix))
      if (!hasSub) continue
      const src = source[fieldId]
      if (src === null || typeof src !== 'object') continue
      if (Array.isArray(src)) {
        // Keep only individually pinned items; remap their indices in nextPins
        const srcArr = src as EntryValue[]
        const kept = srcArr.filter((_, idx) =>
          pinnedPaths.value.has(subPrefix + idx)
        )
        target[fieldId] = kept
        for (let idx = 0; idx < srcArr.length; idx++)
          nextPins.delete(subPrefix + idx)
        for (let idx = 0; idx < kept.length; idx++)
          nextPins.add(subPrefix + idx)
      } else {
        const tgt = ((target[fieldId] as EntryObject | null | undefined) ??
          {}) as EntryObject
        applyPins(src as EntryObject, tgt, subPrefix, nextPins)
        target[fieldId] = tgt
      }
    }
  }
}

function onSubmit() {
  if (!canSubmit.value) return
  entriesStore.addEntry({ ...formData.value })
  clearDraft()
  const newData = buildDefaultData()
  const nextPins = new Set(pinnedPaths.value)
  applyPins(formData.value, newData, '', nextPins)
  formData.value = newData
  pinnedPaths.value = nextPins
  uiStore.addToast('Entry added', 'success')
}

function onReset() {
  formData.value = buildDefaultData()
  clearDraft()
}
</script>

<template>
  <div class="space-y-8">
    <!-- Entry form -->
    <div
      class="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs dark:bg-neutral-800 dark:border-neutral-700"
    >
      <h2
        class="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-5"
      >
        Add Entry
      </h2>

      <div
        v-if="schemaStore.schema.fields.length === 0"
        class="text-center py-10 text-neutral-500"
      >
        <p class="text-sm">No schema defined yet.</p>
        <p class="text-xs mt-1">
          Head to
          <RouterLink
            to="/define"
            class="text-accent-700 hover:underline dark:text-accent-400"
          >
            Define
          </RouterLink>
          to create your data model.
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
        <EntryActions
          :can-submit="canSubmit"
          @submit="onSubmit"
          @reset="onReset"
        />
      </template>
    </div>
  </div>
</template>
