<script setup lang="ts">
import { computed } from 'vue'
import { useEntriesStore } from '@/stores/entries'

const entriesStore = useEntriesStore()
const entryCount = computed(() => entriesStore.entries.length)
</script>

<template>
  <header class="bg-white border-b border-neutral-200 sticky top-0 z-40">
    <div class="max-w-content mx-auto px-4 h-14 flex items-center justify-between">
      <RouterLink to="/" class="font-semibold text-lg tracking-tight text-neutral-900 hover:text-accent-700">
        Data Curata
      </RouterLink>
      <nav class="flex items-center gap-6">
        <RouterLink
          to="/"
          class="text-sm font-medium text-neutral-600 hover:text-neutral-900"
          active-class="text-accent-700"
          exact-active-class="text-accent-700"
        >
          Collect
        </RouterLink>
        <RouterLink
          to="/data"
          class="text-sm font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5"
          active-class="text-accent-700"
        >
          Data
          <span
            v-if="entryCount > 0"
            class="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-accent-600 text-white text-xs font-medium"
          >
            {{ entryCount }}
          </span>
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
