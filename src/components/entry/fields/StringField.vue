<script setup lang="ts">
import type { StringField as StringFieldType } from '@/lib/schema/types'

const props = defineProps<{
  field: StringFieldType
  modelValue: string | null
  error?: string
  variant?: 'full' | 'compact'
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()

function onInput(e: Event) {
  const v = (e.target as HTMLTextAreaElement | HTMLInputElement).value
  emit('update:modelValue', v || (props.field.nullable ? null : v))
}
</script>

<template>
  <div>
    <textarea
      v-if="field.multiline"
      :value="modelValue ?? ''"
      :placeholder="field.nullable ? 'optional' : ''"
      :class="[
        'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 resize-y dark:text-neutral-100 dark:placeholder:text-neutral-500',
        variant === 'compact' ? 'min-h-[60px] text-xs' : 'min-h-[80px]',
        error
          ? 'border-red-400 bg-red-50 dark:bg-red-950/40 dark:border-red-700'
          : 'border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-800',
      ]"
      @input="onInput"
    />
    <input
      v-else
      type="text"
      :value="modelValue ?? ''"
      :placeholder="field.nullable ? 'optional' : ''"
      :class="[
        'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 dark:text-neutral-100 dark:placeholder:text-neutral-500',
        variant === 'compact' ? 'py-1.5 text-xs' : '',
        error
          ? 'border-red-400 bg-red-50 dark:bg-red-950/40 dark:border-red-700'
          : 'border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-800',
      ]"
      @input="onInput"
    />
    <p v-if="error" class="mt-1 text-xs text-red-600 dark:text-red-400">
      {{ error }}
    </p>
  </div>
</template>
