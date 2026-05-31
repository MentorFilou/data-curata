import { getDb } from './db'
import type { Schema } from '@/lib/schema/types'

export async function loadSchema(): Promise<Schema | undefined> {
  const db = await getDb()
  return db.get('schema', 'current')
}

export async function saveSchema(schema: Schema): Promise<void> {
  const db = await getDb()
  await db.put('schema', schema, 'current')
}
