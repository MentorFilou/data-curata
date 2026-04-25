<script setup lang="ts">
import type { EnumField as EnumFieldType } from '@/lib/schema/types'

defineProps<{
  field: EnumFieldType
  modelValue: string | null
  error?: string
  variant?: 'full' | 'compact'
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()
</script>

<template>
  <div>
    <select
      :value="modelValue ?? ''"
      :class="[
        'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 dark:text-neutral-100',
        variant === 'compact' ? 'py-1.5 text-xs' : '',
        error
          ? 'border-red-400 bg-red-50 dark:bg-red-950/40 dark:border-red-700'
          : 'border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-800',
      ]"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value || null)"
    >
      <option v-if="field.nullable" value="">— select —</option>
      <option v-for="v in field.values" :key="v" :value="v">
        {{ v }}
      </option>
    </select>
    <p v-if="error" class="mt-1 text-xs text-red-600 dark:text-red-400">
      {{ error }}
    </p>
  </div>
</template>
