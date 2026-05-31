import type { Field, Schema, Entry, EntryValue, EntryObject } from './types'
import { defaultValueForField } from './defaults'

export function migrateEntries(
  entries: Entry[],
  oldSchema: Schema,
  newSchema: Schema
): Entry[] {
  return entries.map((entry) => ({
    ...entry,
    data: migrateObject(entry.data, oldSchema.fields, newSchema.fields),
  }))
}

function migrateObject(
  obj: EntryObject,
  oldFields: Field[],
  newFields: Field[]
): EntryObject {
  const oldMap = new Map(oldFields.map((f) => [f.id, f]))
  const result: EntryObject = {}

  for (const newField of newFields) {
    const oldField = oldMap.get(newField.id)

    if (!oldField) {
      // Added field
      result[newField.id] = defaultValueForField(newField)
      continue
    }

    const oldValue = obj[newField.id]

    if (oldField.name !== newField.name) {
      // Rename: id is stable, just carry value over (already keyed by id)
    }

    if (oldField.type === newField.type) {
      // Same type — recurse if object, otherwise carry value
      if (newField.type === 'object' && oldField.type === 'object') {
        result[newField.id] =
          oldValue === null || oldValue === undefined
            ? defaultValueForField(newField)
            : migrateObject(
                oldValue as EntryObject,
                oldField.fields,
                newField.fields
              )
      } else {
        result[newField.id] = oldValue ?? defaultValueForField(newField)
      }
    } else {
      // Type changed — attempt coercion
      result[newField.id] = coerce(oldValue, newField)
    }
  }

  return result
}

function coerce(value: EntryValue, field: Field): EntryValue {
  if (value === null || value === undefined) {
    return field.nullable ? null : defaultValueForField(field)
  }

  switch (field.type) {
    case 'string':
      return String(value)
    case 'number': {
      const n = Number(value)
      if (isNaN(n)) return field.nullable ? null : 0
      return n
    }
    case 'boolean':
      return Boolean(value)
    case 'date':
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value))
        return value
      return field.nullable ? null : ''
    case 'datetime':
      if (typeof value === 'string' && !isNaN(new Date(value).getTime()))
        return value
      return field.nullable ? null : ''
    case 'url':
      if (typeof value === 'string') {
        try {
          new URL(value)
          return value
        } catch {
          return field.nullable ? null : ''
        }
      }
      return field.nullable ? null : ''
    case 'enum':
      if (typeof value === 'string' && field.values.includes(value))
        return value
      return field.values[0] ?? (field.nullable ? null : '')
    case 'object':
      return field.nullable ? null : defaultValueForField(field)
    case 'array':
      return field.nullable ? null : []
    default: {
      // Exhaustive — TypeScript ensures all FieldType cases are handled above
      const _exhaustive: never = field
      void _exhaustive
      return null
    }
  }
}
