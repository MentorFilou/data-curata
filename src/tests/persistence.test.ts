import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'
import { resetDbForTest } from '@/lib/persistence/db'
import { loadSchema, saveSchema } from '@/lib/persistence/schemaRepo'
import {
  loadEntries,
  saveEntry,
  deleteEntry,
  clearEntries,
  saveAllEntries,
} from '@/lib/persistence/entriesRepo'
import { loadSnapshots, saveSnapshot, MAX_SNAPSHOTS } from '@/lib/persistence/historyRepo'
import type { Schema, Entry, Snapshot } from '@/lib/schema/types'

// Each test gets a fresh IndexedDB
beforeEach(() => {
  globalThis.indexedDB = new IDBFactory()
  resetDbForTest()
})

const baseSchema: Schema = {
  version: 1,
  fields: [{ id: 'f1', name: 'title', type: 'string', nullable: false }],
}

function makeEntry(id: string): Entry {
  return {
    id,
    createdAt: new Date().toISOString(),
    data: { f1: 'hello' },
  }
}

function makeSnapshot(id: string, reason: Snapshot['reason'] = 'schema-change'): Snapshot {
  return {
    id,
    createdAt: new Date(Date.now() + Math.random() * 1000).toISOString(),
    reason,
    schema: baseSchema,
    entries: [],
  }
}

describe('schemaRepo', () => {
  it('returns undefined when no schema saved', async () => {
    expect(await loadSchema()).toBeUndefined()
  })

  it('round-trips schema', async () => {
    await saveSchema(baseSchema)
    const loaded = await loadSchema()
    expect(loaded).toEqual(baseSchema)
  })

  it('overwrites on second save', async () => {
    await saveSchema(baseSchema)
    const updated: Schema = { ...baseSchema, fields: [] }
    await saveSchema(updated)
    expect(await loadSchema()).toEqual(updated)
  })
})

describe('entriesRepo', () => {
  it('returns empty array initially', async () => {
    expect(await loadEntries()).toEqual([])
  })

  it('saves and loads an entry', async () => {
    const e = makeEntry('e1')
    await saveEntry(e)
    const all = await loadEntries()
    expect(all).toEqual([e])
  })

  it('deletes an entry', async () => {
    const e = makeEntry('e1')
    await saveEntry(e)
    await deleteEntry('e1')
    expect(await loadEntries()).toEqual([])
  })

  it('clears all entries', async () => {
    await saveEntry(makeEntry('e1'))
    await saveEntry(makeEntry('e2'))
    await clearEntries()
    expect(await loadEntries()).toEqual([])
  })

  it('saveAllEntries replaces store', async () => {
    await saveEntry(makeEntry('old'))
    const entries = [makeEntry('new1'), makeEntry('new2')]
    await saveAllEntries(entries)
    const loaded = await loadEntries()
    expect(loaded).toHaveLength(2)
    expect(loaded.map((e) => e.id).sort()).toEqual(['new1', 'new2'])
  })
})

describe('historyRepo', () => {
  it('returns empty initially', async () => {
    expect(await loadSnapshots()).toEqual([])
  })

  it('saves and loads a snapshot', async () => {
    const s = makeSnapshot('s1')
    await saveSnapshot(s)
    expect(await loadSnapshots()).toEqual([s])
  })

  it(`caps at ${MAX_SNAPSHOTS} snapshots FIFO`, async () => {
    for (let i = 0; i < MAX_SNAPSHOTS + 5; i++) {
      const s = makeSnapshot(`s${String(i).padStart(3, '0')}`)
      s.createdAt = new Date(Date.now() + i * 1000).toISOString()
      await saveSnapshot(s)
    }
    const all = await loadSnapshots()
    expect(all.length).toBe(MAX_SNAPSHOTS)
  })
})
