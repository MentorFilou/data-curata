import type { Entry, Schema, EntryValue } from '@/lib/schema/types'
import type { ExportFormat } from './index'

export const csvFormat: ExportFormat = {
  id: 'csv',
  label: 'CSV',
  extension: 'csv',
  mimeType: 'text/csv',
  serialize(entries: Entry[], _schema: Schema): string {
    if (entries.length === 0) return ''

    // Collect all dot-paths across all entries
    const allPaths = new Set<string>()
    for (const entry of entries) {
      collectPaths(entry.data, '', allPaths)
    }

    const columns = Array.from(allPaths).sort()
    const header = columns.map(escapeCell).join(',')

    const rows = entries.map((entry) => {
      return columns
        .map((col) => {
          const val = getPath(entry.data, col)
          if (val === undefined || val === null) return ''
          return escapeCell(String(val))
        })
        .join(',')
    })

    return [header, ...rows].join('\r\n')
  },
}

function collectPaths(value: EntryValue, prefix: string, paths: Set<string>): void {
  if (value === null || value === undefined) {
    if (prefix) paths.add(prefix)
    return
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      if (prefix) paths.add(prefix)
      return
    }
    value.forEach((item, i) => {
      collectPaths(item, prefix ? `${prefix}.${i}` : String(i), paths)
    })
    return
  }

  if (typeof value === 'object') {
    for (const [key, val] of Object.entries(value)) {
      collectPaths(val, prefix ? `${prefix}.${key}` : key, paths)
    }
    return
  }

  if (prefix) paths.add(prefix)
}

function getPath(obj: EntryValue, path: string): EntryValue {
  const parts = path.split('.')
  let current: EntryValue = obj
  for (const part of parts) {
    if (current === null || current === undefined) return undefined as unknown as EntryValue
    if (Array.isArray(current)) {
      const idx = parseInt(part, 10)
      current = current[idx] as EntryValue
    } else if (typeof current === 'object') {
      current = (current as Record<string, EntryValue>)[part]
    } else {
      return undefined as unknown as EntryValue
    }
  }
  return current
}

function escapeCell(value: string): string {
  if (/[,"\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
