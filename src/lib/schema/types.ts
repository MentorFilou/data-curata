export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'url'
  | 'enum'
  | 'object'
  | 'array'

export interface FieldBase {
  id: string
  name: string
  type: FieldType
  nullable: boolean
  unique?: boolean
  description?: string
}

export interface StringField extends FieldBase {
  type: 'string'
  multiline?: boolean
}

export interface NumberField extends FieldBase {
  type: 'number'
  integer?: boolean
  min?: number
  max?: number
}

export interface DateField extends FieldBase {
  type: 'date'
}

export interface DateTimeField extends FieldBase {
  type: 'datetime'
}

export interface UrlField extends FieldBase {
  type: 'url'
}

export interface BooleanField extends FieldBase {
  type: 'boolean'
}

export interface EnumField extends FieldBase {
  type: 'enum'
  values: string[]
}

export interface ObjectField extends FieldBase {
  type: 'object'
  fields: Field[]
}

export interface ArrayField extends FieldBase {
  type: 'array'
  items: Field
}

export type Field =
  | StringField
  | NumberField
  | DateField
  | DateTimeField
  | UrlField
  | BooleanField
  | EnumField
  | ObjectField
  | ArrayField

export interface Schema {
  version: 1
  fields: Field[]
}

export type EntryValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: EntryValue }
  | EntryValue[]

export type EntryObject = Record<string, EntryValue>

export type Entry = {
  id: string
  createdAt: string
  data: EntryObject
}

export type SnapshotReason =
  | 'schema-change'
  | 'clear-all'
  | 'import'
  | 'restore'

export interface Snapshot {
  id: string
  createdAt: string
  reason: SnapshotReason
  schema: Schema
  entries: Entry[]
}
