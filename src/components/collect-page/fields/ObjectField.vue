<script setup lang="ts">
import type {
  ObjectField as ObjectFieldType,
  EntryObject,
} from '@/lib/schema/types'
import EntryForm from '../EntryForm.vue'

defineProps<{
  field: ObjectFieldType
  modelValue: EntryObject | null
  errors?: Record<string, string>
  variant?: 'full' | 'compact'
  pathPrefix?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: EntryObject | null] }>()
</script>

<template>
  <div
    :class="[
      'rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50',
      variant === 'compact' ? 'p-2' : 'p-4',
    ]"
  >
    <div
      v-if="field.nullable && modelValue === null"
      class="flex items-center gap-2"
    >
      <span class="text-sm text-neutral-500 italic">null</span>
      <button
        class="text-xs text-accent-600 hover:underline dark:text-accent-400"
        @click="emit('update:modelValue', {})"
      >
        Set value
      </button>
    </div>
    <template v-else>
      <EntryForm
        :fields="field.fields"
        :model-value="modelValue ?? {}"
        :errors="errors"
        :variant="variant"
        :path-prefix="pathPrefix"
        @update:model-value="emit('update:modelValue', $event)"
      />
      <button
        v-if="field.nullable"
        class="mt-2 text-xs text-neutral-400 hover:text-red-500 dark:hover:text-red-400"
        @click="emit('update:modelValue', null)"
      >
        Clear (set null)
      </button>
    </template>
  </div>
</template>
