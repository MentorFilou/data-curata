<script setup lang="ts">
import { computed } from 'vue'

function newId() {
  return crypto.randomUUID()
}
import { Trash2, ChevronUp, ChevronDown, Plus } from '@lucide/vue'
import type {
  Field,
  FieldType,
  ObjectField,
  ArrayField,
  EnumField,
} from '@/lib/schema/types'
import SchemaTypePicker from './SchemaTypePicker.vue'
import SchemaEnumEditor from './SchemaEnumEditor.vue'
import IconButton from '@/components/common/IconButton.vue'

const props = defineProps<{
  field: Field
  isFirst: boolean
  isLast: boolean
  depth?: number
}>()

const emit = defineEmits<{
  update: [field: Field]
  remove: [id: string]
  moveUp: [id: string]
  moveDown: [id: string]
  addChild: [parentId: string]
}>()

const depth = computed(() => props.depth ?? 0)

function update(patch: Partial<Field>) {
  emit('update', { ...props.field, ...patch } as Field)
}

function onTypeChange(newType: FieldType) {
  const base = {
    id: props.field.id,
    name: props.field.name,
    type: newType,
    nullable: props.field.nullable,
    description: props.field.description,
  }
  switch (newType) {
    case 'enum':
      emit('update', { ...base, type: 'enum', values: [] } as Field)
      break
    case 'object':
      emit('update', { ...base, type: 'object', fields: [] } as Field)
      break
    case 'array':
      emit('update', {
        ...base,
        type: 'array',
        items: { id: newId(), name: 'item', type: 'string', nullable: false },
      } as Field)
      break
    default:
      emit('update', { ...base, type: newType } as Field)
  }
}

function updateChild(child: Field) {
  if (props.field.type !== 'object') return
  const fields = (props.field as ObjectField).fields.map((f) =>
    f.id === child.id ? child : f
  )
  emit('update', { ...props.field, fields } as Field)
}

function removeChild(id: string) {
  if (props.field.type !== 'object') return
  const fields = (props.field as ObjectField).fields.filter((f) => f.id !== id)
  emit('update', { ...props.field, fields } as Field)
}

function moveChildUp(id: string) {
  if (props.field.type !== 'object') return
  const fields = [...(props.field as ObjectField).fields]
  const idx = fields.findIndex((f) => f.id === id)
  if (idx <= 0) return
  ;[fields[idx - 1], fields[idx]] = [fields[idx], fields[idx - 1]]
  emit('update', { ...props.field, fields } as Field)
}

function moveChildDown(id: string) {
  if (props.field.type !== 'object') return
  const fields = [...(props.field as ObjectField).fields]
  const idx = fields.findIndex((f) => f.id === id)
  if (idx === -1 || idx >= fields.length - 1) return
  ;[fields[idx], fields[idx + 1]] = [fields[idx + 1], fields[idx]]
  emit('update', { ...props.field, fields } as Field)
}

function addChildField() {
  if (props.field.type !== 'object') return
  const newField: Field = {
    id: newId(),
    name: '',
    type: 'string',
    nullable: false,
  }
  emit('update', {
    ...props.field,
    fields: [...(props.field as ObjectField).fields, newField],
  } as Field)
}

function updateItemsType(newType: FieldType) {
  if (props.field.type !== 'array') return
  const currentItems = (props.field as ArrayField).items
  let newItems: Field
  switch (newType) {
    case 'enum':
      newItems = { ...currentItems, type: 'enum', values: [] } as Field
      break
    case 'object':
      newItems = { ...currentItems, type: 'object', fields: [] } as Field
      break
    case 'array':
      newItems = {
        ...currentItems,
        type: 'array',
        items: { id: newId(), name: 'item', type: 'string', nullable: false },
      } as Field
      break
    default:
      newItems = {
        id: currentItems.id,
        name: currentItems.name,
        type: newType,
        nullable: currentItems.nullable,
      } as Field
  }
  emit('update', { ...props.field, items: newItems } as Field)
}
</script>

<template>
  <div
    :class="[
      'rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 p-3 space-y-2',
      depth > 0 ? 'ml-4 border-l-2 border-l-accent-600/40' : '',
    ]"
  >
    <!-- Row header -->
    <div class="flex items-center gap-2">
      <!-- Drag handle placeholder (not implemented — reorder via buttons) -->
      <div class="flex flex-col gap-0.5">
        <IconButton
          size="sm"
          title="Move up"
          variant="ghost"
          :class="{ invisible: isFirst }"
          @click="emit('moveUp', field.id)"
        >
          <ChevronUp class="w-3 h-3" />
        </IconButton>
        <IconButton
          size="sm"
          title="Move down"
          variant="ghost"
          :class="{ invisible: isLast }"
          @click="emit('moveDown', field.id)"
        >
          <ChevronDown class="w-3 h-3" />
        </IconButton>
      </div>

      <input
        :value="field.name"
        type="text"
        placeholder="field name"
        class="flex-1 min-w-0 text-sm bg-white border border-neutral-300 text-neutral-900 rounded-sm px-2 py-1 focus:outline-hidden focus:ring-1 focus:ring-accent-400 placeholder:text-neutral-400 font-mono dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100 dark:placeholder:text-neutral-500"
        @input="update({ name: ($event.target as HTMLInputElement).value })"
      />

      <SchemaTypePicker
        :model-value="field.type"
        @update:model-value="onTypeChange"
      />

      <label
        class="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 cursor-pointer select-none"
      >
        <input
          type="checkbox"
          :checked="field.nullable"
          class="rounded-sm border-neutral-300 bg-white text-accent-500 focus:ring-accent-400 dark:border-neutral-600 dark:bg-neutral-800"
          @change="
            update({ nullable: ($event.target as HTMLInputElement).checked })
          "
        />
        nullable
      </label>

      <label
        class="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 cursor-pointer select-none"
      >
        <input
          type="checkbox"
          :checked="field.unique ?? false"
          class="rounded-sm border-neutral-300 bg-white text-accent-500 focus:ring-accent-400 dark:border-neutral-600 dark:bg-neutral-800"
          @change="
            update({ unique: ($event.target as HTMLInputElement).checked || undefined })
          "
        />
        unique
      </label>

      <IconButton
        size="sm"
        title="Remove field"
        variant="danger"
        @click="emit('remove', field.id)"
      >
        <Trash2 class="w-3.5 h-3.5" />
      </IconButton>
    </div>

    <!-- Description -->
    <input
      :value="field.description ?? ''"
      type="text"
      placeholder="description (optional)"
      class="w-full text-xs bg-neutral-50 border border-neutral-200 text-neutral-500 rounded-sm px-2 py-1 focus:outline-hidden focus:ring-1 focus:ring-accent-400 placeholder:text-neutral-400 dark:bg-neutral-800/50 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder:text-neutral-600"
      @input="
        update({
          description: ($event.target as HTMLInputElement).value || undefined,
        })
      "
    />

    <!-- Enum values -->
    <div v-if="field.type === 'enum'">
      <p class="text-xs text-neutral-500 dark:text-neutral-500 mb-1">Values:</p>
      <SchemaEnumEditor
        :values="(field as EnumField).values"
        @update:values="update({ values: $event })"
      />
    </div>

    <!-- Number extras -->
    <div
      v-if="field.type === 'number'"
      class="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400"
    >
      <label class="flex items-center gap-1 cursor-pointer">
        <input
          type="checkbox"
          :checked="
            (field as import('@/lib/schema/types').NumberField).integer ?? false
          "
          class="rounded-sm border-neutral-300 bg-white text-accent-500 dark:border-neutral-600 dark:bg-neutral-800"
          @change="
            update({ integer: ($event.target as HTMLInputElement).checked })
          "
        />
        integer only
      </label>
      <label class="flex items-center gap-1">
        min:
        <input
          type="number"
          :value="(field as import('@/lib/schema/types').NumberField).min ?? ''"
          class="w-16 bg-white border border-neutral-300 text-neutral-800 rounded-sm px-1.5 py-0.5 focus:outline-hidden focus:ring-1 focus:ring-accent-400 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-200"
          @input="
            update({
              min: ($event.target as HTMLInputElement).value
                ? Number(($event.target as HTMLInputElement).value)
                : undefined,
            })
          "
        />
      </label>
      <label class="flex items-center gap-1">
        max:
        <input
          type="number"
          :value="(field as import('@/lib/schema/types').NumberField).max ?? ''"
          class="w-16 bg-white border border-neutral-300 text-neutral-800 rounded-sm px-1.5 py-0.5 focus:outline-hidden focus:ring-1 focus:ring-accent-400 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-200"
          @input="
            update({
              max: ($event.target as HTMLInputElement).value
                ? Number(($event.target as HTMLInputElement).value)
                : undefined,
            })
          "
        />
      </label>
    </div>

    <!-- String extras -->
    <div
      v-if="field.type === 'string'"
      class="text-xs text-neutral-500 dark:text-neutral-400"
    >
      <label class="flex items-center gap-1 cursor-pointer">
        <input
          type="checkbox"
          :checked="
            (field as import('@/lib/schema/types').StringField).multiline ??
            false
          "
          class="rounded-sm border-neutral-300 bg-white text-accent-500 dark:border-neutral-600 dark:bg-neutral-800"
          @change="
            update({ multiline: ($event.target as HTMLInputElement).checked })
          "
        />
        multiline
      </label>
    </div>

    <!-- Array items type -->
    <div
      v-if="field.type === 'array'"
      class="space-y-2"
    >
      <div
        class="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400"
      >
        <span>Items type:</span>
        <SchemaTypePicker
          :model-value="(field as ArrayField).items.type"
          @update:model-value="updateItemsType"
        />
      </div>
      <!-- If items is an object, recurse -->
      <div
        v-if="(field as ArrayField).items.type === 'object'"
        class="ml-2"
      >
        <SchemaFieldRow
          v-for="(child, idx) in ((field as ArrayField).items as ObjectField)
            .fields"
          :key="child.id"
          :field="child"
          :is-first="idx === 0"
          :is-last="
            idx ===
            ((field as ArrayField).items as ObjectField).fields.length - 1
          "
          :depth="(depth ?? 0) + 1"
          @update="
            (updated) => {
              const items = (field as ArrayField).items as ObjectField
              const fields = items.fields.map((f) =>
                f.id === updated.id ? updated : f
              )
              emit('update', { ...field, items: { ...items, fields } } as Field)
            }
          "
          @remove="
            (id) => {
              const items = (field as ArrayField).items as ObjectField
              const fields = items.fields.filter((f) => f.id !== id)
              emit('update', { ...field, items: { ...items, fields } } as Field)
            }
          "
          @move-up="
            (id) => {
              const items = (field as ArrayField).items as ObjectField
              const fields = [...items.fields]
              const i = fields.findIndex((f) => f.id === id)
              if (i > 0) {
                ;[fields[i - 1], fields[i]] = [fields[i], fields[i - 1]]
              }
              emit('update', { ...field, items: { ...items, fields } } as Field)
            }
          "
          @move-down="
            (id) => {
              const items = (field as ArrayField).items as ObjectField
              const fields = [...items.fields]
              const i = fields.findIndex((f) => f.id === id)
              if (i < fields.length - 1) {
                ;[fields[i], fields[i + 1]] = [fields[i + 1], fields[i]]
              }
              emit('update', { ...field, items: { ...items, fields } } as Field)
            }
          "
          @add-child="
            () => {
              const items = (field as ArrayField).items as ObjectField
              const newF: Field = {
                id: newId(),
                name: '',
                type: 'string',
                nullable: false,
              }
              emit('update', {
                ...field,
                items: { ...items, fields: [...items.fields, newF] },
              } as Field)
            }
          "
        />
        <button
          class="mt-2 text-xs text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300 flex items-center gap-1"
          @click="
            () => {
              const items = (field as ArrayField).items as ObjectField
              const newF: Field = {
                id: newId(),
                name: '',
                type: 'string',
                nullable: false,
              }
              emit('update', {
                ...field,
                items: { ...items, fields: [...items.fields, newF] },
              } as Field)
            }
          "
        >
          <Plus class="w-3 h-3" />
          Add item field
        </button>
      </div>
    </div>

    <!-- Object children (recursive) -->
    <div
      v-if="field.type === 'object'"
      class="space-y-2"
    >
      <SchemaFieldRow
        v-for="(child, idx) in (field as ObjectField).fields"
        :key="child.id"
        :field="child"
        :is-first="idx === 0"
        :is-last="idx === (field as ObjectField).fields.length - 1"
        :depth="(depth ?? 0) + 1"
        @update="updateChild"
        @remove="removeChild"
        @move-up="moveChildUp"
        @move-down="moveChildDown"
        @add-child="addChildField"
      />
      <button
        class="text-xs text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300 flex items-center gap-1"
        @click="addChildField"
      >
        <Plus class="w-3 h-3" />
        Add subfield
      </button>
    </div>
  </div>
</template>
