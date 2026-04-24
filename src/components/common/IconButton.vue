<script setup lang="ts">
defineProps<{
  title: string
  variant?: 'default' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
}>()
</script>

<template>
  <button
    :title="title"
    :aria-label="title"
    :class="[
      'inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
      size === 'sm' ? 'w-7 h-7' : 'w-8 h-8',
      variant === 'danger'
        ? 'text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/40 dark:hover:text-red-400'
        : variant === 'ghost'
          ? 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200'
          : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-700 dark:hover:text-neutral-200',
    ]"
  >
    <slot />
  </button>
</template>
