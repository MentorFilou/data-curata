<script setup lang="ts">
import { computed } from 'vue'
import { useSchemaStore } from '@/stores/schema'
import { useUiStore } from '@/stores/ui'
import SchemaVisualBuilder from './SchemaVisualBuilder.vue'
import SchemaRawEditor from './SchemaRawEditor.vue'
import SchemaImportExport from './SchemaImportExport.vue'

const schemaStore = useSchemaStore()
const uiStore = useUiStore()

const fieldCount = computed(() => schemaStore.schema.fields.length)
const mode = computed(() => uiStore.schemaEditorMode)

function setMode(m: 'visual' | 'raw') {
  uiStore.setSchemaEditorMode(m)
}
</script>

<template>
  <div
    class="rounded-xl bg-white border border-neutral-200 overflow-hidden font-mono text-sm dark:bg-neutral-800 dark:border-neutral-700"
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-700"
    >
      <div class="flex items-center gap-3">
        <span class="text-accent-600 dark:text-accent-400">Schema</span>
        <span class="text-neutral-500 font-sans text-xs">
          {{ fieldCount }} {{ fieldCount === 1 ? 'field' : 'fields' }}
        </span>
      </div>

      <div class="flex items-center gap-4">
        <!-- Mode toggle -->
        <div class="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-700 rounded-md p-0.5">
          <button
            :class="[
              'px-3 py-1 text-xs rounded-sm transition-colors',
              mode === 'visual'
                ? 'bg-white text-neutral-900 dark:bg-neutral-600 dark:text-white'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200',
            ]"
            @click="setMode('visual')"
          >
            Visual
          </button>
          <button
            :class="[
              'px-3 py-1 text-xs rounded-sm transition-colors',
              mode === 'raw'
                ? 'bg-white text-neutral-900 dark:bg-neutral-600 dark:text-white'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200',
            ]"
            @click="setMode('raw')"
          >
            Raw
          </button>
        </div>
        <SchemaImportExport />
      </div>
    </div>

    <!-- Body -->
    <div class="schema-editor-body">
      <SchemaVisualBuilder v-if="mode === 'visual'" />
      <SchemaRawEditor v-else />
    </div>
  </div>
</template>

<style scoped>
.schema-editor-body {
  background-image: radial-gradient(circle, #e4e4e7 0.1px, transparent 1px);
  background-size: 15px 15px;
  background-position: 0 0;
}

:global(.dark) .schema-editor-body {
  background-image: radial-gradient(circle, #52525b 1px, transparent 1px);
}
</style>
