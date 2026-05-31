<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { X } from '@lucide/vue'
import type { Entry, EntryObject } from '@/lib/schema/types'
import { useSchemaStore } from '@/stores/schema'
import { useEntriesStore } from '@/stores/entries'
import { validateEntry } from '@/lib/schema/validate'
import EntryForm from '@/components/collect-page/EntryForm.vue'
import EntryActions from '@/components/collect-page/EntryActions.vue'

const props = defineProps<{
  entry: Entry | null
}>()

const emit = defineEmits<{ save: [data: EntryObject]; close: [] }>()

const schemaStore = useSchemaStore()
const entriesStore = useEntriesStore()
const staged = ref<EntryObject>({})

watch(
  () => props.entry,
  (e) => {
    staged.value = e ? { ...e.data } : {}
  },
  { immediate: true }
)

const validationResult = computed(() =>
  validateEntry(staged.value, schemaStore.schema, {
    existingEntries: entriesStore.entries,
    excludeId: props.entry?.id,
  })
)
const canSubmit = computed(() => validationResult.value.valid)

function onSave() {
  if (!canSubmit.value) return
  emit('save', { ...staged.value })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="slide">
      <div
        v-if="entry"
        class="fixed inset-0 z-40 flex justify-end"
      >
        <div
          class="absolute inset-0 bg-black/30"
          @click="emit('close')"
        />
        <div
          class="relative w-full max-w-md bg-white dark:bg-neutral-800 shadow-2xl flex flex-col h-full"
        >
          <div
            class="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-700"
          >
            <h2
              class="text-sm font-semibold text-neutral-900 dark:text-neutral-100"
            >
              Edit Entry
            </h2>
            <button
              class="p-1 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
              @click="emit('close')"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
          <div class="flex-1 overflow-y-auto px-5 py-4">
            <EntryForm
              :fields="schemaStore.schema.fields"
              :model-value="staged"
              :errors="validationResult.errors"
              variant="compact"
              @update:model-value="staged = $event"
            />
          </div>
          <div
            class="px-5 py-4 border-t border-neutral-200 dark:border-neutral-700"
          >
            <EntryActions
              :can-submit="canSubmit"
              variant="compact"
              @submit="onSave"
              @reset="staged = entry ? { ...entry.data } : {}"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
