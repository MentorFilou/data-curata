<script setup lang="ts">
defineProps<{
  canSubmit: boolean
  variant?: 'full' | 'compact'
}>()

const emit = defineEmits<{ submit: []; reset: [] }>()
</script>

<template>
  <div
    :class="[
      'flex items-center gap-3',
      variant === 'compact' ? 'pt-2' : 'pt-4',
    ]"
  >
    <button
      :disabled="!canSubmit"
      :class="[
        'px-5 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-500',
        canSubmit
          ? 'bg-accent-600 text-white hover:bg-accent-700'
          : 'bg-neutral-200 text-neutral-400 cursor-not-allowed dark:bg-neutral-700 dark:text-neutral-500',
      ]"
      @click="emit('submit')"
    >
      {{ variant === 'compact' ? 'Save changes' : 'Add entry' }}
    </button>
    <button
      class="px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-500"
      @click="emit('reset')"
    >
      Reset
    </button>
  </div>
</template>
