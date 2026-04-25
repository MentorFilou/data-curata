import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Snapshot, Schema, Entry, SnapshotReason } from '@/lib/schema/types'
import { loadSnapshots, saveSnapshot } from '@/lib/persistence/historyRepo'

export const useHistoryStore = defineStore('history', () => {
  const snapshots = ref<Snapshot[]>([])
  const hydrated = ref(false)

  async function hydrate(): Promise<void> {
    if (hydrated.value) return
    snapshots.value = await loadSnapshots()
    hydrated.value = true
  }

  async function snapshot(reason: SnapshotReason, schema: Schema, entries: Entry[]): Promise<void> {
    const snap: Snapshot = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      reason,
      schema: JSON.parse(JSON.stringify(schema)) as Schema,
      entries: JSON.parse(JSON.stringify(entries)) as Entry[],
    }
    await saveSnapshot(snap)
    // Reload from DB to reflect FIFO cap
    snapshots.value = await loadSnapshots()
  }

  return { snapshots, hydrated, hydrate, snapshot }
})
