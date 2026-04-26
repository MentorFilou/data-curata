<script setup lang="ts">
import { BarChart2 } from '@lucide/vue'
import { useEntriesStore } from '@/stores/entries'
import { computed } from 'vue'

const entriesStore = useEntriesStore()
const count = computed(() => entriesStore.entries.length)
</script>

<template>
  <RouterLink
    to="/review"
    class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
  >
    <BarChart2 class="w-4 h-4" />
    View data
    <span
      v-if="count > 0"
      class="px-1.5 py-0.5 bg-neutral-100 rounded text-xs text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400"
    >
      {{ count }}
    </span>
  </RouterLink>
</template>
