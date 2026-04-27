import { describe, it, expect } from 'vitest'
import { jsonFormat } from '@/lib/export/json'
import { jsonlFormat } from '@/lib/export/jsonl'
import { csvFormat } from '@/lib/export/csv'
import type { Entry, Schema } from '@/lib/schema/types'

const schema: Schema = {
  version: 1,
  fields: [
    { id: 'f1', name: 'title', type: 'string', nullable: false },
    {
      id: 'f2',
      name: 'author',
      type: 'object',
      nullable: false,
      fields: [{ id: 'f3', name: 'name', type: 'string', nullable: false }],
    },
    {
      id: 'f4',
      name: 'tags',
      type: 'array',
      nullable: true,
      items: { id: 'f5', name: 'tag', type: 'string', nullable: false },
    },
  ],
}

function entry(data: Entry['data']): Entry {
  return { id: 'e1', createdAt: '2024-01-01T00:00:00.000Z', data }
}

const entries: Entry[] = [
  entry({ f1: 'Hello', f2: { f3: 'Alice' }, f4: ['vue', 'ts'] }),
  entry({ f1: 'World', f2: { f3: 'Bob' }, f4: [] }),
]

describe('JSON export', () => {
  it('produces valid JSON array', () => {
    const output = jsonFormat.serialize(entries, schema) as string
    const parsed = JSON.parse(output)
    expect(parsed).toHaveLength(2)
    expect(parsed[0].f1).toBe('Hello')
  })
})

describe('JSONL export', () => {
  it('produces one JSON object per line', () => {
    const output = jsonlFormat.serialize(entries, schema) as string
    const lines = output.split('\n')
    expect(lines).toHaveLength(2)
    expect(JSON.parse(lines[0]).f1).toBe('Hello')
  })
})

describe('CSV export', () => {
  it('produces header + data rows', () => {
    const output = csvFormat.serialize(entries, schema) as string
    const lines = output.split('\r\n')
    expect(lines.length).toBeGreaterThan(1)
    const header = lines[0]
    expect(header).toContain('f1')
    expect(header).toContain('f2.f3')
  })

  it('uses dot-paths for nested fields', () => {
    const output = csvFormat.serialize(entries, schema) as string
    expect(output).toContain('f2.f3')
  })

  it('uses numeric indices for array items', () => {
    const output = csvFormat.serialize(entries, schema) as string
    expect(output).toContain('f4.0')
    expect(output).toContain('f4.1')
  })

  it('returns empty string for empty entries', () => {
    expect(csvFormat.serialize([], schema)).toBe('')
  })

  it('escapes commas in values RFC 4180', () => {
    const e = entry({ f1: 'hello, world', f2: { f3: 'x' }, f4: [] })
    const output = csvFormat.serialize([e], schema) as string
    expect(output).toContain('"hello, world"')
  })

  it('handles deeply nested objects', () => {
    const deepSchema: Schema = {
      version: 1,
      fields: [
        {
          id: 'a',
          name: 'a',
          type: 'object',
          nullable: false,
          fields: [
            {
              id: 'b',
              name: 'b',
              type: 'object',
              nullable: false,
              fields: [
                {
                  id: 'c',
                  name: 'c',
                  type: 'object',
                  nullable: false,
                  fields: [{ id: 'd', name: 'd', type: 'string', nullable: false }],
                },
              ],
            },
          ],
        },
      ],
    }
    const deepEntry = entry({ a: { b: { c: { d: 'deep' } } } })
    const output = csvFormat.serialize([deepEntry], deepSchema) as string
    expect(output).toContain('a.b.c.d')
    expect(output).toContain('deep')
  })
})
