<script setup lang="ts">
import { computed } from 'vue'
import { Sun, Moon } from '@lucide/vue'
import { useEntriesStore } from '@/stores/entries'
import { useUiStore } from '@/stores/ui'

const entriesStore = useEntriesStore()
const uiStore = useUiStore()
const entryCount = computed(() => entriesStore.entries.length)
</script>

<template>
  <header class="bg-white border-b border-neutral-200 sticky top-0 z-40 dark:bg-neutral-900 dark:border-neutral-700">
    <div class="max-w-content mx-auto px-4 h-14 flex items-center justify-between">
      <RouterLink
        to="/"
        class="font-semibold text-lg tracking-tight text-neutral-900 hover:text-accent-700 dark:text-neutral-100 dark:hover:text-accent-400"
      >
        Data Curata
      </RouterLink>
      <nav class="flex items-center gap-4">
        <RouterLink
          to="/"
          class="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
          active-class="text-accent-700 dark:text-accent-400"
          exact-active-class="text-accent-700 dark:text-accent-400"
        >
          Collect
        </RouterLink>
        <RouterLink
          to="/data"
          class="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white flex items-center gap-1.5"
          active-class="text-accent-700 dark:text-accent-400"
        >
          Data
          <span
            v-if="entryCount > 0"
            class="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-accent-600 text-white text-xs font-medium"
          >
            {{ entryCount }}
          </span>
        </RouterLink>
        <button
          class="p-2 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800 transition-colors"
          :title="uiStore.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="uiStore.toggleTheme()"
        >
          <Sun
            v-if="uiStore.theme === 'dark'"
            class="w-4 h-4"
          />
          <Moon
            v-else
            class="w-4 h-4"
          />
        </button>
      </nav>
    </div>
  </header>
</template>
