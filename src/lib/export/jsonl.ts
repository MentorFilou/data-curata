import type { Entry, Schema } from '@/lib/schema/types'
import type { ExportFormat } from './index'

export const jsonlFormat: ExportFormat = {
  id: 'jsonl',
  label: 'JSONL',
  extension: 'jsonl',
  mimeType: 'application/x-ndjson',
  serialize(entries: Entry[], _schema: Schema): string {
    return entries.map((e) => JSON.stringify(e.data)).join('\n')
  },
}
