import type { Entry } from '@/lib/schema/types'
import type { ExportFormat } from './index'

export const jsonFormat: ExportFormat = {
  id: 'json',
  label: 'JSON',
  extension: 'json',
  mimeType: 'application/json',
  serialize(entries: Entry[]): string {
    return JSON.stringify(
      entries.map((e) => entryToObject(e)),
      null,
      2
    )
  },
}

function entryToObject(entry: Entry): Record<string, unknown> {
  return { ...entry.data }
}
