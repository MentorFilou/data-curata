import { openDB, type IDBPDatabase } from 'idb'
import type { Schema, Entry, Snapshot } from '@/lib/schema/types'

const DB_NAME = 'data-curata'
const DB_VERSION = 1

export interface DataCurataDB {
  schema: {
    key: 'current'
    value: Schema
  }
  entries: {
    key: string
    value: Entry
    indexes: { createdAt: string }
  }
  snapshots: {
    key: string
    value: Snapshot
    indexes: { createdAt: string }
  }
}

let dbPromise: Promise<IDBPDatabase<DataCurataDB>> | null = null

export function getDb(): Promise<IDBPDatabase<DataCurataDB>> {
  if (!dbPromise) {
    dbPromise = openDB<DataCurataDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('schema')) {
          db.createObjectStore('schema')
        }
        if (!db.objectStoreNames.contains('entries')) {
          const store = db.createObjectStore('entries', { keyPath: 'id' })
          store.createIndex('createdAt', 'createdAt')
        }
        if (!db.objectStoreNames.contains('snapshots')) {
          const store = db.createObjectStore('snapshots', { keyPath: 'id' })
          store.createIndex('createdAt', 'createdAt')
        }
      },
    })
  }
  return dbPromise
}

export function resetDbForTest(): void {
  dbPromise = null
}
