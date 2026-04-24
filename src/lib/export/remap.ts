import type { Field, EntryObject, EntryValue } from '@/lib/schema/types'

export function remapKeys(data: EntryObject, fields: Field[]): EntryObject {
  const result: EntryObject = {}
  for (const field of fields) {
    const value = data[field.id]
    if (value === undefined) continue
    result[field.name] = remapValue(value, field)
  }
  return result
}

function remapValue(value: EntryValue, field: Field): EntryValue {
  if (field.type === 'object') {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      return remapKeys(value as EntryObject, field.fields)
    }
    return value
  }
  if (field.type === 'array' && Array.isArray(value)) {
    return value.map((item) => remapValue(item as EntryValue, field.items))
  }
  return value
}
