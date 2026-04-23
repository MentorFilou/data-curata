import { describe, it, expect } from 'vitest'
import { validateSchema, validateEntry, isBreakingChange } from '@/lib/schema/validate'
import type { Schema, Field } from '@/lib/schema/types'

const simpleSchema: Schema = {
  version: 1,
  fields: [
    { id: 'f1', name: 'title', type: 'string', nullable: false },
    { id: 'f2', name: 'count', type: 'number', nullable: false },
    { id: 'f3', name: 'active', type: 'boolean', nullable: false },
  ],
}

describe('validateSchema', () => {
  it('validates a simple schema', () => {
    expect(validateSchema(simpleSchema).valid).toBe(true)
  })

  it('catches duplicate field names', () => {
    const schema: Schema = {
      version: 1,
      fields: [
        { id: 'a', name: 'title', type: 'string', nullable: false },
        { id: 'b', name: 'title', type: 'string', nullable: false },
      ],
    }
    const result = validateSchema(schema)
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toMatch(/duplicate/i)
  })

  it('catches empty field name', () => {
    const schema: Schema = {
      version: 1,
      fields: [{ id: 'a', name: '', type: 'string', nullable: false }],
    }
    expect(validateSchema(schema).valid).toBe(false)
  })

  it('catches enum with no values', () => {
    const schema: Schema = {
      version: 1,
      fields: [{ id: 'a', name: 'status', type: 'enum', nullable: false, values: [] }],
    }
    expect(validateSchema(schema).valid).toBe(false)
  })

  it('validates nested object schemas', () => {
    const schema: Schema = {
      version: 1,
      fields: [
        {
          id: 'obj',
          name: 'author',
          type: 'object',
          nullable: false,
          fields: [{ id: 'n', name: 'name', type: 'string', nullable: false }],
        },
      ],
    }
    expect(validateSchema(schema).valid).toBe(true)
  })
})

describe('validateEntry', () => {
  it('validates a correct entry', () => {
    const entry = { f1: 'hello', f2: 42, f3: true }
    expect(validateEntry(entry, simpleSchema).valid).toBe(true)
  })

  it('catches missing required string', () => {
    const entry = { f1: '', f2: 42, f3: true }
    const result = validateEntry(entry, simpleSchema)
    expect(result.valid).toBe(false)
    expect(result.errors['f1']).toBeDefined()
  })

  it('allows nullable null', () => {
    const schema: Schema = {
      version: 1,
      fields: [{ id: 'f1', name: 'note', type: 'string', nullable: true }],
    }
    expect(validateEntry({ f1: null }, schema).valid).toBe(true)
  })

  it('validates URL field', () => {
    const schema: Schema = {
      version: 1,
      fields: [{ id: 'u', name: 'url', type: 'url', nullable: false }],
    }
    expect(validateEntry({ u: 'https://example.com' }, schema).valid).toBe(true)
    expect(validateEntry({ u: 'not-a-url' }, schema).valid).toBe(false)
  })

  it('validates date field', () => {
    const schema: Schema = {
      version: 1,
      fields: [{ id: 'd', name: 'date', type: 'date', nullable: false }],
    }
    expect(validateEntry({ d: '2024-01-15' }, schema).valid).toBe(true)
    expect(validateEntry({ d: 'not-a-date' }, schema).valid).toBe(false)
  })
})

describe('isBreakingChange', () => {
  const oldFields: Field[] = [
    { id: 'f1', name: 'title', type: 'string', nullable: false },
  ]

  it('adding a nullable field is not breaking', () => {
    const newFields: Field[] = [
      ...oldFields,
      { id: 'f2', name: 'note', type: 'string', nullable: true },
    ]
    expect(isBreakingChange(oldFields, newFields)).toBe(false)
  })

  it('adding a non-nullable field is breaking', () => {
    const newFields: Field[] = [
      ...oldFields,
      { id: 'f2', name: 'note', type: 'string', nullable: false },
    ]
    expect(isBreakingChange(oldFields, newFields)).toBe(true)
  })

  it('removing a field is breaking', () => {
    expect(isBreakingChange(oldFields, [])).toBe(true)
  })

  it('type change is breaking', () => {
    const newFields: Field[] = [
      { id: 'f1', name: 'title', type: 'number', nullable: false },
    ]
    expect(isBreakingChange(oldFields, newFields)).toBe(true)
  })

  it('rename only (same id) is not breaking', () => {
    const newFields: Field[] = [
      { id: 'f1', name: 'renamed', type: 'string', nullable: false },
    ]
    expect(isBreakingChange(oldFields, newFields)).toBe(false)
  })
})
