import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Schema, Field } from '@/lib/schema/types'
import { loadSchema, saveSchema } from '@/lib/persistence/schemaRepo'
import { useAutosave } from '@/composables/useAutosave'
import { isBreakingChange } from '@/lib/schema/validate'
import { migrateEntries } from '@/lib/schema/migrate'
import { useConfirm } from '@/composables/useConfirm'
import { useEntriesStore } from './entries'
import { useHistoryStore } from './history'

const EMPTY_SCHEMA: Schema = { version: 1, fields: [] }

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

export const useSchemaStore = defineStore('schema', () => {
  const schema = ref<Schema>(structuredClone(EMPTY_SCHEMA))
  const hydrated = ref(false)

  async function hydrate(): Promise<void> {
    if (hydrated.value) return
    const stored = await loadSchema()
    if (stored) schema.value = stored
    hydrated.value = true
    // Start autosave after hydration
    useAutosave(schema, saveSchema)
  }

  const fieldCount = computed(() => schema.value.fields.length)

  // Low-level setter — called after guard has been cleared
  function _applySchema(newSchema: Schema): void {
    schema.value = newSchema
    saveSchema(newSchema).catch(console.error)
  }

  async function setSchema(newSchema: Schema): Promise<boolean> {
    const { confirm } = useConfirm()
    const entriesStore = useEntriesStore()
    const historyStore = useHistoryStore()

    const hasEntries = entriesStore.entries.length > 0
    const breaking = isBreakingChange(schema.value.fields, newSchema.fields)

    if (hasEntries && breaking) {
      const ok = await confirm({
        title: 'Breaking schema change',
        message: `You have ${entriesStore.entries.length} saved ${entriesStore.entries.length === 1 ? 'entry' : 'entries'}. Editing the schema this way may alter or drop data in existing entries. A snapshot will be saved so you can restore. Continue?`,
        confirmLabel: 'Continue',
        danger: true,
      })
      if (!ok) return false
      await historyStore.snapshot(
        'schema-change',
        schema.value,
        entriesStore.entries
      )
    } else if (hasEntries && !breaking) {
      // Purely additive — silent snapshot
      await historyStore.snapshot(
        'schema-change',
        schema.value,
        entriesStore.entries
      )
    }

    if (hasEntries) {
      const migrated = migrateEntries(
        entriesStore.entries,
        schema.value,
        newSchema
      )
      _applySchema(newSchema)
      await entriesStore.replaceAll(migrated)
    } else {
      _applySchema(newSchema)
    }

    return true
  }

  async function addField(field: Field, parentId?: string): Promise<boolean> {
    const newSchema = deepClone(schema.value)
    if (parentId) {
      const parent = findFieldById(newSchema.fields, parentId)
      if (parent && parent.type === 'object') {
        parent.fields.push(field)
      }
    } else {
      newSchema.fields.push(field)
    }
    return setSchema(newSchema)
  }

  async function updateField(field: Field): Promise<boolean> {
    const newSchema = deepClone(schema.value)
    replaceFieldById(newSchema.fields, field)
    return setSchema(newSchema)
  }

  async function removeField(id: string): Promise<boolean> {
    const newSchema = deepClone(schema.value)
    removeFieldById(newSchema.fields, id)
    return setSchema(newSchema)
  }

  async function moveField(
    id: string,
    direction: 'up' | 'down',
    parentId?: string
  ): Promise<void> {
    const newSchema = deepClone(schema.value)
    const fields = parentId
      ? (() => {
          const p = findFieldById(newSchema.fields, parentId)
          return p && p.type === 'object' ? p.fields : null
        })()
      : newSchema.fields
    if (!fields) return
    const idx = fields.findIndex((f) => f.id === id)
    if (idx === -1) return
    const newIdx = direction === 'up' ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= fields.length) return
    ;[fields[idx], fields[newIdx]] = [fields[newIdx], fields[idx]]
    _applySchema(newSchema)
  }

  return {
    schema,
    hydrated,
    fieldCount,
    hydrate,
    setSchema,
    addField,
    updateField,
    removeField,
    moveField,
    _applySchema,
  }
})

function findFieldById(fields: Field[], id: string): Field | null {
  for (const f of fields) {
    if (f.id === id) return f
    if (f.type === 'object') {
      const found = findFieldById(f.fields, id)
      if (found) return found
    }
    if (f.type === 'array') {
      if (f.items.id === id) return f.items
      if (f.items.type === 'object') {
        const found = findFieldById(f.items.fields, id)
        if (found) return found
      }
    }
  }
  return null
}

function replaceFieldById(fields: Field[], updated: Field): boolean {
  for (let i = 0; i < fields.length; i++) {
    if (fields[i].id === updated.id) {
      fields[i] = updated
      return true
    }
    const f = fields[i]
    if (f.type === 'object') {
      if (replaceFieldById(f.fields, updated)) return true
    }
    if (f.type === 'array') {
      if (f.items.id === updated.id) {
        fields[i] = { ...f, items: updated } as Field
        return true
      }
      if (f.items.type === 'object') {
        if (replaceFieldById(f.items.fields, updated)) return true
      }
    }
  }
  return false
}

function removeFieldById(fields: Field[], id: string): boolean {
  for (let i = 0; i < fields.length; i++) {
    if (fields[i].id === id) {
      fields.splice(i, 1)
      return true
    }
    const f = fields[i]
    if (f.type === 'object') {
      if (removeFieldById(f.fields, id)) return true
    }
    if (f.type === 'array') {
      if (f.items.type === 'object') {
        if (removeFieldById(f.items.fields, id)) return true
      }
    }
  }
  return false
}
