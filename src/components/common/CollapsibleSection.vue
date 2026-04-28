<script setup lang="ts">
defineProps<{ open: boolean; title: string }>()
defineEmits<{ toggle: [] }>()
</script>

<template>
  <div
    class="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
  >
    <button
      class="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-colors"
      @click="$emit('toggle')"
    >
      <span>{{ title }}</span>
      <svg
        :class="['w-4 h-4 transition-transform', open ? 'rotate-180' : '']"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
    <div v-show="open">
      <slot />
    </div>
  </div>
</template>
