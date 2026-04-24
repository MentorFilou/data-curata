<script setup lang="ts">
import type { Field, EntryObject, EntryValue } from '@/lib/schema/types'
import EntryField from './EntryField.vue'

const props = defineProps<{
  fields: Field[]
  modelValue: EntryObject
  errors?: Record<string, string>
  variant?: 'full' | 'compact'
  pinnedFields?: Set<string>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: EntryObject]
  'update:pinnedFields': [value: Set<string>]
}>()

function updateField(field: Field, value: EntryValue) {
  emit('update:modelValue', { ...props.modelValue, [field.id]: value })
}

function togglePin(fieldId: string) {
  const next = new Set(props.pinnedFields ?? [])
  if (next.has(fieldId)) next.delete(fieldId)
  else next.add(fieldId)
  emit('update:pinnedFields', next)
}

function subErrors(field: Field): Record<string, string> | undefined {
  if (!props.errors) return undefined
  const prefix = `${field.id}.`
  const sub: Record<string, string> = {}
  for (const [k, v] of Object.entries(props.errors)) {
    if (k.startsWith(prefix)) sub[k.slice(prefix.length)] = v
  }
  return Object.keys(sub).length > 0 ? sub : undefined
}
</script>

<template>
  <div :class="['space-y-4', variant === 'compact' ? 'space-y-2' : 'space-y-5']">
    <div v-for="field in fields" :key="field.id">
      <div :class="['flex items-center gap-2', variant === 'compact' ? 'mb-0.5' : 'mb-1.5']">
        <label
          :class="[
            'font-medium text-neutral-800 dark:text-neutral-200',
            variant === 'compact' ? 'text-xs' : 'text-sm',
          ]"
        >
          {{ field.name }}
        </label>
        <span
          v-if="field.nullable"
          class="text-xs text-neutral-400 font-normal px-1 py-0.5 bg-neutral-100 rounded dark:bg-neutral-700 dark:text-neutral-500"
        >
          optional
        </span>
        <label
          v-if="variant !== 'compact'"
          class="ml-auto flex items-center gap-1.5 cursor-pointer select-none"
          :title="pinnedFields?.has(field.id) ? 'Value will be kept after submitting' : 'Keep this value after submitting'"
        >
          <input
            type="checkbox"
            :checked="pinnedFields?.has(field.id) ?? false"
            class="w-3.5 h-3.5 rounded accent-neutral-500 cursor-pointer"
            @change="togglePin(field.id)"
          />
          <span class="text-xs text-neutral-400 dark:text-neutral-500">keep</span>
        </label>
      </div>
      <p
        v-if="field.description && variant !== 'compact'"
        class="text-xs text-neutral-500 dark:text-neutral-400 mb-1.5"
      >
        {{ field.description }}
      </p>

      <EntryField
        :field="field"
        :model-value="modelValue[field.id] ?? (field.nullable ? null : '')"
        :error="errors?.[field.id]"
        :errors="subErrors(field)"
        :variant="variant"
        @update:model-value="updateField(field, $event)"
      />
    </div>
  </div>
</template>
