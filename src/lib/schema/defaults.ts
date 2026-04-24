import type { Field, FieldType, EntryValue, EntryObject } from './types'

export function defaultValueForField(field: Field): EntryValue {
  if (field.nullable) return null
  return defaultValueForType(field)
}

function defaultValueForType(field: Field): EntryValue {
  switch (field.type) {
    case 'string':
      return ''
    case 'number':
      return field.integer ? 0 : 0
    case 'boolean':
      return false
    case 'date':
      return ''
    case 'datetime':
      return ''
    case 'url':
      return ''
    case 'enum':
      return field.values[0] ?? ''
    case 'object': {
      const obj: EntryObject = {}
      for (const f of field.fields) {
        obj[f.id] = defaultValueForField(f)
      }
      return obj
    }
    case 'array':
      return []
  }
}

export function defaultValueForType2(type: FieldType): EntryValue {
  switch (type) {
    case 'string':
      return ''
    case 'number':
      return 0
    case 'boolean':
      return false
    case 'date':
      return ''
    case 'datetime':
      return ''
    case 'url':
      return ''
    case 'enum':
      return ''
    case 'object':
      return {}
    case 'array':
      return []
  }
}
