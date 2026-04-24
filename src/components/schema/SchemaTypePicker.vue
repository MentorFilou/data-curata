<script setup lang="ts">
import type { FieldType } from '@/lib/schema/types'

defineProps<{ modelValue: FieldType }>()
const emit = defineEmits<{ 'update:modelValue': [value: FieldType] }>()

const types: { value: FieldType; label: string }[] = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'date', label: 'Date' },
  { value: 'url', label: 'URL' },
  { value: 'enum', label: 'Enum' },
  { value: 'object', label: 'Object' },
  { value: 'array', label: 'Array' },
]
</script>

<template>
  <select
    :value="modelValue"
    class="text-xs bg-white border border-neutral-300 text-neutral-900 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-accent-400 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-200"
    @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value as FieldType)"
  >
    <option v-for="t in types" :key="t.value" :value="t.value">{{ t.label }}</option>
  </select>
</template>
