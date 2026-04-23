<script setup lang="ts">
import type { DateField as DateFieldType } from '@/lib/schema/types'

defineProps<{
  field: DateFieldType
  modelValue: string | null
  error?: string
  variant?: 'full' | 'compact'
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()
</script>

<template>
  <div>
    <input
      type="date"
      :value="modelValue ?? ''"
      :class="[
        'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500',
        variant === 'compact' ? 'py-1.5 text-xs' : '',
        error ? 'border-red-400 bg-red-50' : 'border-neutral-300 bg-white',
      ]"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).value || null)"
    />
    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </div>
</template>
