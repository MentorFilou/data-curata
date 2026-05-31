import type { Entry, Schema } from '@/lib/schema/types'
import { jsonFormat } from './json'
import { jsonlFormat } from './jsonl'
import { csvFormat } from './csv'

export interface ExportFormat {
  id: string
  label: string
  extension: string
  mimeType: string
  serialize(entries: Entry[], schema: Schema): string | Blob
}

export const formats: ExportFormat[] = [jsonFormat, jsonlFormat, csvFormat]
