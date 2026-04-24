<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { useSchemaStore } from '@/stores/schema'
import { useUiStore } from '@/stores/ui'
import { validateSchema } from '@/lib/schema/validate'
import type { Schema } from '@/lib/schema/types'

const schemaStore = useSchemaStore()
const uiStore = useUiStore()

const rawText = ref(JSON.stringify(schemaStore.schema, null, 2))
const parseError = ref<string | null>(null)

// Keep raw text in sync when schema changes externally (e.g. from visual mode)
watch(
  () => schemaStore.schema,
  (schema) => {
    const pretty = JSON.stringify(schema, null, 2)
    if (rawText.value !== pretty) {
      rawText.value = pretty
      parseError.value = null
    }
  },
  { deep: true }
)

const extensions = computed(() =>
  uiStore.theme === 'dark' ? [json(), oneDark] : [json()]
)

function onBlur() {
  try {
    const parsed = JSON.parse(rawText.value) as Schema
    const validation = validateSchema(parsed)
    if (!validation.valid) {
      parseError.value = validation.errors.join('; ')
      return
    }
    parseError.value = null
    schemaStore.setSchema(parsed)
  } catch (e) {
    parseError.value = e instanceof Error ? e.message : 'Invalid JSON'
  }
}
</script>

<template>
  <div class="flex flex-col">
    <Codemirror
      v-model="rawText"
      :extensions="extensions"
      :style="{ minHeight: '200px', fontSize: '13px' }"
      @blur="onBlur"
    />
    <p v-if="parseError" class="text-xs text-red-600 px-3 py-2 bg-red-50 border-t border-red-200 dark:text-red-400 dark:bg-red-950/40 dark:border-red-800">
      {{ parseError }}
    </p>
  </div>
</template>
