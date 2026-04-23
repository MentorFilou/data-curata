<script setup lang="ts">
import { computed } from 'vue'
import { Plus, Trash2 } from 'lucide-vue-next'
import type { ArrayField as ArrayFieldType, EntryValue } from '@/lib/schema/types'
import { defaultValueForField } from '@/lib/schema/defaults'
import EntryField from '../EntryField.vue'

const props = defineProps<{
  field: ArrayFieldType
  modelValue: EntryValue[] | null
  errors?: Record<string, string>
  variant?: 'full' | 'compact'
}>()

const emit = defineEmits<{ 'update:modelValue': [value: EntryValue[] | null] }>()

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
    <div v-if="items.length === 0 && field.nullable" class="text-sm text-neutral-400 italic">
      Empty (nullable)
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
      <button
        class="mt-1 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
        @click="removeItem(i)"
        title="Remove item"
      >
        <Trash2 class="w-3.5 h-3.5" />
      </button>
    </div>

    <button
      class="flex items-center gap-1.5 text-sm text-accent-600 hover:text-accent-700 font-medium"
      @click="addItem"
    >
      <Plus class="w-4 h-4" />
      Add item
    </button>
  </div>
</template>
