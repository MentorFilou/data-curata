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
const expanded = computed(() => uiStore.schemaEditorExpanded)
const mode = computed(() => uiStore.schemaEditorMode)

function toggleExpanded() {
  uiStore.toggleSchemaEditor()
}

function setMode(m: 'visual' | 'raw') {
  uiStore.setSchemaEditorMode(m)
}
</script>

<template>
  <div class="rounded-xl bg-neutral-900 border border-neutral-700 overflow-hidden font-mono text-sm">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-neutral-700">
      <button
        class="flex-1 text-left flex items-center gap-3 text-neutral-300 hover:text-white transition-colors"
        @click="toggleExpanded"
        :aria-expanded="expanded"
      >
        <svg
          :class="['w-4 h-4 transition-transform text-neutral-500', expanded ? 'rotate-90' : '']"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span class="text-accent-400">Schema</span>
        <span class="text-neutral-500 font-sans text-xs">
          {{ fieldCount }} {{ fieldCount === 1 ? 'field' : 'fields' }} · click to {{ expanded ? 'collapse' : 'edit' }}
        </span>
      </button>

      <div v-if="expanded" class="flex items-center gap-4">
        <!-- Mode toggle -->
        <div class="flex items-center gap-1 bg-neutral-800 rounded-md p-0.5">
          <button
            :class="['px-3 py-1 text-xs rounded transition-colors', mode === 'visual' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-neutral-200']"
            @click="setMode('visual')"
          >
            Visual
          </button>
          <button
            :class="['px-3 py-1 text-xs rounded transition-colors', mode === 'raw' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-neutral-200']"
            @click="setMode('raw')"
          >
            Raw
          </button>
        </div>
        <SchemaImportExport />
      </div>
    </div>

    <!-- Body -->
    <div v-if="expanded">
      <SchemaVisualBuilder v-if="mode === 'visual'" />
      <SchemaRawEditor v-else />
    </div>
  </div>
</template>
