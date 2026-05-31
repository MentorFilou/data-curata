import { getDb } from './db'
import type { Snapshot } from '@/lib/schema/types'

export const MAX_SNAPSHOTS = 20

export async function loadSnapshots(): Promise<Snapshot[]> {
  const db = await getDb()
  return db.getAll('snapshots')
}

export async function saveSnapshot(snapshot: Snapshot): Promise<void> {
  const db = await getDb()
  const tx = db.transaction('snapshots', 'readwrite')

  await tx.store.put(snapshot)

  // Enforce FIFO cap
  const all = await tx.store.index('createdAt').getAll()
  all.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  while (all.length > MAX_SNAPSHOTS) {
    const oldest = all.shift()!
    await tx.store.delete(oldest.id)
  }

  await tx.done
}

export async function deleteSnapshot(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('snapshots', id)
}
