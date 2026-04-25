<script setup lang="ts">
import { ref } from 'vue'
import { X, Plus } from '@lucide/vue'

const props = defineProps<{ values: string[] }>()
const emit = defineEmits<{ 'update:values': [values: string[]] }>()

const newValue = ref('')

function add() {
  const v = newValue.value.trim()
  if (!v || props.values.includes(v)) return
  emit('update:values', [...props.values, v])
  newValue.value = ''
}

function remove(idx: number) {
  emit(
    'update:values',
    props.values.filter((_, i) => i !== idx)
  )
}
</script>

<template>
  <div class="space-y-1">
    <div class="flex flex-wrap gap-1">
      <span
        v-for="(v, i) in values"
        :key="v"
        class="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded text-xs dark:bg-neutral-700 dark:text-neutral-200"
      >
        {{ v }}
        <button class="hover:text-red-500 dark:hover:text-red-400" @click="remove(i)">
          <X class="w-3 h-3" />
        </button>
      </span>
    </div>
    <div class="flex gap-1">
      <input
        v-model="newValue"
        type="text"
        placeholder="Add value…"
        class="flex-1 text-xs bg-white border border-neutral-300 text-neutral-900 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-accent-400 placeholder:text-neutral-400 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-200 dark:placeholder:text-neutral-500"
        @keydown.enter.prevent="add"
      />
      <button
        class="p-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-300"
        @click="add"
      >
        <Plus class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
</template>
