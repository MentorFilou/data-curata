<script setup lang="ts">
import type { NumberField as NumberFieldType } from '@/lib/schema/types'

defineProps<{
  field: NumberFieldType
  modelValue: number | null
  error?: string
  variant?: 'full' | 'compact'
}>()

const emit = defineEmits<{ 'update:modelValue': [value: number | null] }>()

function onInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  if (raw === '') {
    emit('update:modelValue', null)
    return
  }
  const n = Number(raw)
  emit('update:modelValue', isNaN(n) ? null : n)
}
</script>

<template>
  <div>
    <input
      type="number"
      :value="modelValue ?? ''"
      :step="field.integer ? 1 : 'any'"
      :min="field.min"
      :max="field.max"
      :class="[
        'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500',
        variant === 'compact' ? 'py-1.5 text-xs' : '',
        error ? 'border-red-400 bg-red-50' : 'border-neutral-300 bg-white',
      ]"
      @input="onInput"
    />
    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </div>
</template>
