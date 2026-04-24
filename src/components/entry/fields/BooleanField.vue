<script setup lang="ts">
import type { BooleanField as BooleanFieldType } from '@/lib/schema/types'

defineProps<{
  field: BooleanFieldType
  modelValue: boolean | null
  error?: string
  variant?: 'full' | 'compact'
}>()

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<template>
  <div>
    <label class="inline-flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        :checked="modelValue ?? false"
        class="w-4 h-4 rounded border-neutral-300 text-accent-600 focus:ring-accent-500 dark:border-neutral-600 dark:bg-neutral-800"
        @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      >
      <span :class="['text-neutral-700 dark:text-neutral-300', variant === 'compact' ? 'text-xs' : 'text-sm']">
        {{ modelValue ? 'Yes' : 'No' }}
      </span>
    </label>
    <p
      v-if="error"
      class="mt-1 text-xs text-red-600 dark:text-red-400"
    >
      {{ error }}
    </p>
  </div>
</template>
