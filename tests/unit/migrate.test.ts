import { describe, it, expect } from 'vitest'
import { migrateEntries } from '@/lib/schema/migrate'
import type { Schema, Entry } from '@/lib/schema/types'

function entry(data: Record<string, unknown>): Entry {
  return { id: 'e1', createdAt: '2024-01-01T00:00:00.000Z', data: data as Entry['data'] }
}

describe('migrateEntries', () => {
  it('carries over matching fields', () => {
    const schema: Schema = {
      version: 1,
      fields: [{ id: 'f1', name: 'title', type: 'string', nullable: false }],
    }
    const result = migrateEntries([entry({ f1: 'hello' })], schema, schema)
    expect(result[0].data.f1).toBe('hello')
  })

  it('adds default for new nullable field', () => {
    const old: Schema = {
      version: 1,
      fields: [{ id: 'f1', name: 'title', type: 'string', nullable: false }],
    }
    const next: Schema = {
      version: 1,
      fields: [...old.fields, { id: 'f2', name: 'note', type: 'string', nullable: true }],
    }
    const result = migrateEntries([entry({ f1: 'hello' })], old, next)
    expect(result[0].data.f2).toBeNull()
  })

  it('drops removed fields', () => {
    const old: Schema = {
      version: 1,
      fields: [
        { id: 'f1', name: 'title', type: 'string', nullable: false },
        { id: 'f2', name: 'extra', type: 'string', nullable: true },
      ],
    }
    const next: Schema = {
      version: 1,
      fields: [{ id: 'f1', name: 'title', type: 'string', nullable: false }],
    }
    const result = migrateEntries([entry({ f1: 'a', f2: 'b' })], old, next)
    expect(result[0].data).not.toHaveProperty('f2')
  })

  it('coerces number to string', () => {
    const old: Schema = {
      version: 1,
      fields: [{ id: 'f1', name: 'x', type: 'number', nullable: false }],
    }
    const next: Schema = {
      version: 1,
      fields: [{ id: 'f1', name: 'x', type: 'string', nullable: false }],
    }
    const result = migrateEntries([entry({ f1: 42 })], old, next)
    expect(result[0].data.f1).toBe('42')
  })

  it('handles rename (same id)', () => {
    const old: Schema = {
      version: 1,
      fields: [{ id: 'f1', name: 'old_name', type: 'string', nullable: false }],
    }
    const next: Schema = {
      version: 1,
      fields: [{ id: 'f1', name: 'new_name', type: 'string', nullable: false }],
    }
    const result = migrateEntries([entry({ f1: 'value' })], old, next)
    expect(result[0].data.f1).toBe('value')
  })
})
