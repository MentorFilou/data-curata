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
    class="text-xs bg-neutral-800 border border-neutral-600 text-neutral-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-accent-400"
    @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value as FieldType)"
  >
    <option v-for="t in types" :key="t.value" :value="t.value">{{ t.label }}</option>
  </select>
</template>
