import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Entry, EntryObject } from '@/lib/schema/types'
import { loadEntries, saveEntry, deleteEntry, clearEntries, saveAllEntries } from '@/lib/persistence/entriesRepo'

export const useEntriesStore = defineStore('entries', () => {
  const entries = ref<Entry[]>([])
  const hydrated = ref(false)

  async function hydrate(): Promise<void> {
    if (hydrated.value) return
    entries.value = await loadEntries()
    hydrated.value = true
  }

  function addEntry(data: EntryObject): Entry {
    const entry: Entry = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      data,
    }
    entries.value.push(entry)
    saveEntry(entry).catch(console.error)
    return entry
  }

  function updateEntry(id: string, data: EntryObject): void {
    const idx = entries.value.findIndex((e) => e.id === id)
    if (idx === -1) return
    entries.value[idx] = { ...entries.value[idx], data }
    saveEntry(entries.value[idx]).catch(console.error)
  }

  function removeEntry(id: string): void {
    entries.value = entries.value.filter((e) => e.id !== id)
    deleteEntry(id).catch(console.error)
  }

  async function clearAll(): Promise<void> {
    entries.value = []
    await clearEntries()
  }

  async function replaceAll(newEntries: Entry[]): Promise<void> {
    entries.value = [...newEntries]
    await saveAllEntries(newEntries)
  }

  return { entries, hydrated, hydrate, addEntry, updateEntry, removeEntry, clearAll, replaceAll }
})
