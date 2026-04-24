<script setup lang="ts">
defineProps<{
  modelValue: boolean
  label: string
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <button
    :aria-pressed="modelValue"
    :class="[
      'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
      modelValue
        ? 'bg-accent-600 border-accent-600 text-white hover:bg-accent-700 hover:border-accent-700 dark:bg-accent-500 dark:border-accent-500 dark:hover:bg-accent-600 dark:hover:border-accent-600'
        : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800',
    ]"
    @click="$emit('update:modelValue', !modelValue)"
  >
    {{ label }}
  </button>
</template>
