<script setup lang="ts">
import pkg from '../../../package.json'

const repoUrl = 'https://github.com/MentorFilou/data-curata'
const version = pkg.version
</script>

<template>
  <footer
    class="max-w-content mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500 dark:text-neutral-500 border-t border-neutral-200 dark:border-neutral-800"
  >
    <span>Open source · v{{ version }}</span>
    <a
      :href="repoUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
      aria-label="View on GitHub"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="w-4 h-4"
        aria-hidden="true"
      >
        <path
          d="M12 .5C5.73.5.78 5.45.78 11.72c0 4.96 3.22 9.16 7.69 10.65.56.1.77-.24.77-.54 0-.27-.01-1.16-.02-2.1-3.13.68-3.79-1.34-3.79-1.34-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.57 0-1.23.44-2.24 1.16-3.03-.12-.29-.5-1.43.11-2.99 0 0 .95-.3 3.1 1.16.9-.25 1.86-.38 2.82-.38.96 0 1.92.13 2.82.38 2.15-1.46 3.1-1.16 3.1-1.16.61 1.56.23 2.7.11 2.99.72.79 1.16 1.8 1.16 3.03 0 4.33-2.64 5.29-5.15 5.57.4.35.76 1.03.76 2.08 0 1.5-.01 2.71-.01 3.08 0 .3.2.65.78.54 4.47-1.49 7.69-5.69 7.69-10.65C23.22 5.45 18.27.5 12 .5z"
        />
      </svg>
      MentorFilou/data-curata
    </a>
  </footer>
</template>
