<script setup lang="ts">
import { inject, computed } from 'vue'
import type { Ref } from 'vue'
import type { Field, EntryObject, EntryValue } from '@/lib/schema/types'
import EntryField from './EntryField.vue'

const props = defineProps<{
  fields: Field[]
  modelValue: EntryObject
  errors?: Record<string, string>
  variant?: 'full' | 'compact'
  pathPrefix?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: EntryObject] }>()

const insideArrayItem = inject('insideArrayItem', false)
const pinnedPaths = inject<Ref<Set<string>>>('pinnedPaths')
const togglePin = inject<(path: string) => void>('togglePin')

function currentPath(fieldId: string): string {
  return (props.pathPrefix ?? '') + fieldId
}

function isPinned(fieldId: string): boolean {
  return pinnedPaths?.value.has(currentPath(fieldId)) ?? false
}

function childPrefix(field: Field): string {
  return currentPath(field.id) + '.'
}

// True when a parent object is already pinned — children are implicitly kept
const ancestorPinned = computed(() => {
  const prefix = props.pathPrefix ?? ''
  if (!prefix) return false
  let i = prefix.indexOf('.')
  while (i !== -1) {
    if (pinnedPaths?.value.has(prefix.slice(0, i))) return true
    i = prefix.indexOf('.', i + 1)
  }
  return false
})

function updateField(field: Field, value: EntryValue) {
  emit('update:modelValue', { ...props.modelValue, [field.id]: value })
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
  <div
    :class="['space-y-4', variant === 'compact' ? 'space-y-2' : 'space-y-5']"
  >
    <div
      v-for="field in fields"
      :key="field.id"
    >
      <div
        :class="[
          'flex items-center gap-2',
          variant === 'compact' ? 'mb-0.5' : 'mb-1.5',
        ]"
      >
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
          class="text-xs text-neutral-400 font-normal px-1 py-0.5 bg-neutral-100 rounded-sm dark:bg-neutral-700 dark:text-neutral-500"
        >
          optional
        </span>
        <span
          v-if="field.unique"
          class="text-xs text-neutral-400 font-normal px-1 py-0.5 bg-neutral-100 rounded-sm dark:bg-neutral-700 dark:text-neutral-500"
        >
          unique
        </span>
        <label
          v-if="
            variant !== 'compact' &&
            !insideArrayItem &&
            pinnedPaths !== undefined
          "
          :class="[
            'ml-auto flex items-center gap-1.5 select-none',
            ancestorPinned ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
          ]"
          :title="
            ancestorPinned
              ? 'Kept by parent'
              : isPinned(field.id)
                ? 'Value will be kept after submitting'
                : 'Keep this value after submitting'
          "
        >
          <input
            type="checkbox"
            :checked="isPinned(field.id) || ancestorPinned"
            :disabled="ancestorPinned"
            class="w-3.5 h-3.5 rounded-sm accent-neutral-500"
            :class="ancestorPinned ? 'cursor-not-allowed' : 'cursor-pointer'"
            @change="togglePin?.(currentPath(field.id))"
          />
          <span class="text-xs text-neutral-400 dark:text-neutral-500">
            keep
          </span>
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
        :path-prefix="childPrefix(field)"
        @update:model-value="updateField(field, $event)"
      />
    </div>
  </div>
</template>
