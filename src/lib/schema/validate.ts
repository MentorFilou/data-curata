import type { Field, Schema, EntryValue, EntryObject, ObjectField } from './types'

export interface SchemaValidationResult {
  valid: boolean
  errors: string[]
}

export interface EntryValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export function validateSchema(schema: Schema): SchemaValidationResult {
  const errors: string[] = []
  validateFields(schema.fields, '', errors, new Set())
  return { valid: errors.length === 0, errors }
}

function validateFields(
  fields: Field[],
  path: string,
  errors: string[],
  visited: Set<string>
): void {
  const names = new Set<string>()
  for (const field of fields) {
    const fieldPath = path ? `${path}.${field.name}` : field.name

    if (!field.name || field.name.trim() === '') {
      errors.push(`Field at ${fieldPath || '(root)'} has an empty name`)
    }

    if (names.has(field.name)) {
      errors.push(`Duplicate field name "${field.name}" at level ${path || '(root)'}`)
    }
    names.add(field.name)

    if (visited.has(field.id)) {
      errors.push(`Cycle detected at field "${fieldPath}"`)
      continue
    }

    if (field.type === 'enum') {
      if (!field.values || field.values.length === 0) {
        errors.push(`Enum field "${fieldPath}" must have at least one value`)
      }
    }

    if (field.type === 'object') {
      const next = new Set(visited)
      next.add(field.id)
      validateFields(field.fields, fieldPath, errors, next)
    }

    if (field.type === 'array') {
      if (!field.items) {
        errors.push(`Array field "${fieldPath}" must have an items definition`)
      } else {
        const next = new Set(visited)
        next.add(field.id)
        validateFields([field.items], fieldPath, errors, next)
      }
    }
  }
}

export function validateEntry(entry: EntryObject, schema: Schema): EntryValidationResult {
  const errors: Record<string, string> = {}
  validateObject(entry, schema.fields, '', errors)
  return { valid: Object.keys(errors).length === 0, errors }
}

function validateObject(
  obj: EntryObject,
  fields: Field[],
  path: string,
  errors: Record<string, string>
): void {
  for (const field of fields) {
    const fieldPath = path ? `${path}.${field.id}` : field.id
    const value = obj[field.id]
    validateValue(value, field, fieldPath, errors)
  }
}

function validateValue(
  value: EntryValue,
  field: Field,
  path: string,
  errors: Record<string, string>
): void {
  if (value === null || value === undefined) {
    if (!field.nullable) {
      errors[path] = `"${field.name}" is required`
    }
    return
  }

  switch (field.type) {
    case 'string':
      if (typeof value !== 'string') {
        errors[path] = `"${field.name}" must be a string`
      } else if (!field.nullable && value.trim() === '') {
        errors[path] = `"${field.name}" is required`
      }
      break

    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        errors[path] = `"${field.name}" must be a number`
      } else {
        if (field.integer && !Number.isInteger(value)) {
          errors[path] = `"${field.name}" must be an integer`
        }
        if (field.min !== undefined && value < field.min) {
          errors[path] = `"${field.name}" must be at least ${field.min}`
        }
        if (field.max !== undefined && value > field.max) {
          errors[path] = `"${field.name}" must be at most ${field.max}`
        }
      }
      break

    case 'boolean':
      if (typeof value !== 'boolean') {
        errors[path] = `"${field.name}" must be a boolean`
      }
      break

    case 'date':
      if (typeof value !== 'string') {
        errors[path] = `"${field.name}" must be a date string`
      } else if (!field.nullable && value === '') {
        errors[path] = `"${field.name}" is required`
      } else if (value !== '' && !isValidDate(value)) {
        errors[path] = `"${field.name}" must be a valid date (YYYY-MM-DD)`
      }
      break

    case 'datetime':
      if (typeof value !== 'string') {
        errors[path] = `"${field.name}" must be a datetime string`
      } else if (!field.nullable && value === '') {
        errors[path] = `"${field.name}" is required`
      } else if (value !== '' && !isValidDateTime(value)) {
        errors[path] = `"${field.name}" must be a valid datetime`
      }
      break

    case 'url':
      if (typeof value !== 'string') {
        errors[path] = `"${field.name}" must be a URL string`
      } else if (!field.nullable && value.trim() === '') {
        errors[path] = `"${field.name}" is required`
      } else if (value.trim() !== '' && !isValidUrl(value)) {
        errors[path] = `"${field.name}" must be a valid URL`
      }
      break

    case 'enum':
      if (typeof value !== 'string' || !field.values.includes(value)) {
        errors[path] = `"${field.name}" must be one of: ${field.values.join(', ')}`
      }
      break

    case 'object': {
      if (typeof value !== 'object' || Array.isArray(value)) {
        errors[path] = `"${field.name}" must be an object`
      } else {
        validateObject(value as EntryObject, field.fields, path, errors)
      }
      break
    }

    case 'array': {
      if (!Array.isArray(value)) {
        errors[path] = `"${field.name}" must be an array`
      } else {
        value.forEach((item, i) => {
          validateValue(item, field.items, `${path}.${i}`, errors)
        })
      }
      break
    }
  }
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const d = new Date(value)
  return !isNaN(d.getTime())
}

function isValidDateTime(value: string): boolean {
  const d = new Date(value)
  return !isNaN(d.getTime())
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export function isBreakingChange(oldFields: Field[], newFields: Field[]): boolean {
  const oldMap = new Map(oldFields.map((f) => [f.id, f]))
  const newMap = new Map(newFields.map((f) => [f.id, f]))

  // Removed field → breaking
  for (const [id] of oldMap) {
    if (!newMap.has(id)) return true
  }

  // Changed type or nullability tightened → breaking
  for (const [id, newField] of newMap) {
    const oldField = oldMap.get(id)
    if (!oldField) {
      // New field: only non-breaking if nullable
      if (!newField.nullable) return true
      continue
    }
    if (oldField.type !== newField.type) return true
    // Tightening nullability is breaking
    if (oldField.nullable && !newField.nullable) return true

    // Recurse into objects
    if (oldField.type === 'object' && newField.type === 'object') {
      if (isBreakingChange((oldField as ObjectField).fields, (newField as ObjectField).fields)) {
        return true
      }
    }
  }

  return false
}
