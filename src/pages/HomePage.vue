<script setup lang="ts">
import { computed } from 'vue'
import { Sparkles, FileCode, ListPlus, Download, ArrowRight, BookOpen } from '@lucide/vue'
import { useSchemaStore } from '@/stores/schema'
import { useEntriesStore } from '@/stores/entries'

const readmeUrl = 'https://github.com/MentorFilou/data-curata/blob/main/README.md'

const schemaStore = useSchemaStore()
const entriesStore = useEntriesStore()

const hasSchema = computed(() => schemaStore.fieldCount > 0)
const hasEntries = computed(() => entriesStore.entries.length > 0)

const primaryCta = computed(() => {
  if (!hasSchema.value) {
    return {
      to: '/define',
      label: 'Define your schema',
      hint: 'Start by describing the shape of your data.',
    }
  }
  if (!hasEntries.value) {
    return {
      to: '/collect',
      label: 'Collect your first entry',
      hint: 'Your schema is ready — start filling it in.',
    }
  }
  return {
    to: '/collect',
    label: 'Continue collecting',
    hint: `You have ${entriesStore.entries.length} entr${entriesStore.entries.length === 1 ? 'y' : 'ies'} so far.`,
  }
})

const steps = [
  {
    icon: FileCode,
    to: '/define',
    title: '1. Define',
    body: 'Build a schema visually or paste JSON. Add fields, mark required, set enums and nested objects.',
  },
  {
    icon: ListPlus,
    to: '/collect',
    title: '2. Collect',
    body: 'Fill out a form generated from your schema. Validation is inline; nothing is saved until it conforms.',
  },
  {
    icon: Download,
    to: '/review',
    title: '3. Review',
    body: 'Browse, edit, and export your entries to JSON, JSONL, or CSV — with the schema attached.',
  },
]
</script>

<template>
  <div class="space-y-10 pt-6 pb-12">
    <section class="text-center space-y-4">
      <div
        class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-50 text-accent-700 text-xs font-medium dark:bg-accent-900/30 dark:text-accent-300"
      >
        <Sparkles class="w-3.5 h-3.5" />
        Welcome to Data Curata
      </div>
      <h1 class="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        Schema-driven data collection, without the spreadsheet sprawl.
      </h1>
      <p class="max-w-xl mx-auto text-sm text-neutral-600 dark:text-neutral-400">
        Define a schema, collect entries that conform to it, then export in whatever format suits
        you next — without losing a single field along the way.
      </p>

      <div class="flex flex-col items-center gap-2 pt-2">
        <RouterLink
          :to="primaryCta.to"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent-600 hover:bg-accent-700 text-white text-sm font-medium transition-colors"
        >
          {{ primaryCta.label }}
          <ArrowRight class="w-4 h-4" />
        </RouterLink>
        <p class="text-xs text-neutral-500 dark:text-neutral-500">
          {{ primaryCta.hint }}
        </p>
      </div>
    </section>

    <section class="grid gap-4 sm:grid-cols-3">
      <RouterLink
        v-for="step in steps"
        :key="step.title"
        :to="step.to"
        class="group block p-4 rounded-lg border border-neutral-200 bg-white hover:border-accent-400 hover:shadow-sm transition-all dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-accent-500"
      >
        <div
          class="inline-flex items-center justify-center w-9 h-9 rounded-md bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300 mb-3"
        >
          <component
            :is="step.icon"
            class="w-5 h-5"
          />
        </div>
        <h2 class="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
          {{ step.title }}
        </h2>
        <p class="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {{ step.body }}
        </p>
      </RouterLink>
    </section>

    <section
      class="p-4 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/40 flex items-start gap-3"
    >
      <BookOpen class="w-4 h-4 mt-0.5 text-neutral-500 dark:text-neutral-400 shrink-0" />
      <div class="text-xs text-neutral-600 dark:text-neutral-400">
        <span class="font-medium text-neutral-700 dark:text-neutral-300">In-app documentation</span>
        is on its way. Until then, hover over field controls for tooltips, or
        <a
          :href="readmeUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="font-medium text-accent-700 hover:text-accent-800 underline underline-offset-2 dark:text-accent-400 dark:hover:text-accent-300"
        >check the README on GitHub</a>.
      </div>
    </section>
  </div>
</template>
