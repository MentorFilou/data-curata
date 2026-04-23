import { getDb } from './db'
import type { Entry } from '@/lib/schema/types'

export async function loadEntries(): Promise<Entry[]> {
  const db = await getDb()
  return db.getAll('entries')
}

export async function saveEntry(entry: Entry): Promise<void> {
  const db = await getDb()
  await db.put('entries', entry)
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('entries', id)
}

export async function clearEntries(): Promise<void> {
  const db = await getDb()
  await db.clear('entries')
}

export async function saveAllEntries(entries: Entry[]): Promise<void> {
  const db = await getDb()
  const tx = db.transaction('entries', 'readwrite')
  await tx.store.clear()
  for (const entry of entries) {
    await tx.store.put(entry)
  }
  await tx.done
}
