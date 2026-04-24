<script setup lang="ts">
import { computed, provide, inject } from 'vue'
import type { Ref } from 'vue'
import { Plus, Trash2 } from 'lucide-vue-next'
import type { ArrayField as ArrayFieldType, EntryValue } from '@/lib/schema/types'
import { defaultValueForField } from '@/lib/schema/defaults'
import EntryField from '../EntryField.vue'

const props = defineProps<{
  field: ArrayFieldType
  modelValue: EntryValue[] | null
  errors?: Record<string, string>
  variant?: 'full' | 'compact'
  pathPrefix?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: EntryValue[] | null] }>()

provide('insideArrayItem', true)

const pinnedPaths = inject<Ref<Set<string>>>('pinnedPaths')
const togglePin = inject<(path: string) => void>('togglePin')

// pathPrefix is "fieldId." — strip the trailing dot to get the array's own path
const arrayOwnPath = computed(() => {
  const p = props.pathPrefix ?? ''
  return p.endsWith('.') ? p.slice(0, -1) : p
})

// True when the array itself or any ancestor is pinned — items are implicitly kept
const implicitlyKept = computed(() => {
  const own = arrayOwnPath.value
  if (!own) return false
  if (pinnedPaths?.value.has(own)) return true
  let i = own.indexOf('.')
  while (i !== -1) {
    if (pinnedPaths?.value.has(own.slice(0, i))) return true
    i = own.indexOf('.', i + 1)
  }
  return false
})

function itemPath(i: number): string {
  return (props.pathPrefix ?? '') + i
}

function isItemPinned(i: number): boolean {
  return pinnedPaths?.value.has(itemPath(i)) ?? false
}

const items = computed(() => props.modelValue ?? [])

function addItem() {
  const def = defaultValueForField(props.field.items)
  emit('update:modelValue', [...items.value, def])
}

function removeItem(i: number) {
  emit('update:modelValue', items.value.filter((_, idx) => idx !== i))
}

function updateItem(i: number, value: EntryValue) {
  const arr = [...items.value]
  arr[i] = value
  emit('update:modelValue', arr)
}

function errorForIndex(i: number): string | undefined {
  return props.errors?.[`${i}`]
}

function errorsForIndex(i: number): Record<string, string> | undefined {
  if (!props.errors) return undefined
  const prefix = `${i}.`
  const sub: Record<string, string> = {}
  for (const [k, v] of Object.entries(props.errors)) {
    if (k.startsWith(prefix)) sub[k.slice(prefix.length)] = v
  }
  return Object.keys(sub).length > 0 ? sub : undefined
}
</script>

<template>
  <div class="space-y-2">
    <div v-if="items.length === 0" class="text-sm text-neutral-400 dark:text-neutral-500 italic">
      Empty
    </div>

    <div
      v-for="(item, i) in items"
      :key="i"
      class="flex items-start gap-2"
    >
      <EntryField
        :field="field.items"
        :model-value="item"
        :error="errorForIndex(i)"
        :errors="errorsForIndex(i)"
        :variant="variant"
        class="flex-1"
        @update:model-value="updateItem(i, $event)"
      />
      <label
        v-if="pinnedPaths !== undefined && variant !== 'compact'"
        :class="['mt-1 flex items-center gap-1 select-none', implicitlyKept ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer']"
        :title="implicitlyKept ? 'Kept by array' : isItemPinned(i) ? 'Item will be kept after submitting' : 'Keep this item after submitting'"
      >
        <input
          type="checkbox"
          :checked="isItemPinned(i) || implicitlyKept"
          :disabled="implicitlyKept"
          :class="['w-3.5 h-3.5 rounded accent-neutral-500', implicitlyKept ? 'cursor-not-allowed' : 'cursor-pointer']"
          @change="togglePin?.(itemPath(i))"
        />
        <span class="text-xs text-neutral-400 dark:text-neutral-500">keep</span>
      </label>
      <button
        class="mt-1 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
        @click="removeItem(i)"
        title="Remove item"
      >
        <Trash2 class="w-3.5 h-3.5" />
      </button>
    </div>

    <button
      class="flex items-center gap-1.5 text-sm text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300 font-medium"
      @click="addItem"
    >
      <Plus class="w-4 h-4" />
      Add item
    </button>
  </div>
</template>
