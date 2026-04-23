<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEntriesStore } from '@/stores/entries'
import { useHistoryStore } from '@/stores/history'
import { useSchemaStore } from '@/stores/schema'
import { useUiStore } from '@/stores/ui'
import { useConfirm } from '@/composables/useConfirm'
import DataTable from '@/components/data/DataTable.vue'
import DataEditDrawer from '@/components/data/DataEditDrawer.vue'
import ClearAllButton from '@/components/data/ClearAllButton.vue'
import type { Entry, EntryObject } from '@/lib/schema/types'

const entriesStore = useEntriesStore()
const historyStore = useHistoryStore()
const schemaStore = useSchemaStore()
const uiStore = useUiStore()
const { confirm } = useConfirm()

const editMode = computed({
  get: () => uiStore.editMode,
  set: (v) => (uiStore.editMode = v),
})

const editingEntry = ref<Entry | null>(null)
const showHistory = ref(false)

function openEdit(id: string) {
  editingEntry.value = entriesStore.entries.find((e) => e.id === id) ?? null
}

function closeEdit() {
  editingEntry.value = null
}

function onSave(data: EntryObject) {
  if (!editingEntry.value) return
  entriesStore.updateEntry(editingEntry.value.id, data)
  editingEntry.value = null
  uiStore.addToast('Entry updated', 'success')
}

async function onRemove(id: string) {
  const ok = await confirm({
    title: 'Delete entry',
    message: 'Delete this entry? This cannot be undone.',
    confirmLabel: 'Delete',
    danger: true,
  })
  if (ok) {
    entriesStore.removeEntry(id)
    uiStore.addToast('Entry deleted', 'info')
  }
}

async function restoreSnapshot(id: string) {
  const snap = historyStore.snapshots.find((s) => s.id === id)
  if (!snap) return
  const ok = await confirm({
    title: 'Restore snapshot',
    message: `Restore snapshot from ${new Date(snap.createdAt).toLocaleString()}? This will replace your current schema and data. A snapshot of the current state will be saved first.`,
    confirmLabel: 'Restore',
    danger: true,
  })
  if (!ok) return
  await historyStore.snapshot('restore', schemaStore.schema, entriesStore.entries)
  schemaStore._applySchema(snap.schema)
  await entriesStore.replaceAll(snap.entries)
  uiStore.addToast('Snapshot restored', 'success')
  showHistory.value = false
}

const sortedSnapshots = computed(() =>
  [...historyStore.snapshots].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
)
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-baseline gap-3">
        <h1 class="text-xl font-semibold text-neutral-900">
          Entries ({{ entriesStore.entries.length }})
        </h1>
        <button
          class="text-xs text-neutral-400 hover:text-accent-600 underline"
          @click="showHistory = !showHistory"
        >
          History
        </button>
      </div>
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer select-none">
          <input
            type="checkbox"
            :checked="editMode"
            class="rounded border-neutral-300 text-accent-600 focus:ring-accent-500"
            @change="editMode = ($event.target as HTMLInputElement).checked"
          />
          Edit mode
        </label>
        <ClearAllButton />
      </div>
    </div>

    <!-- History panel -->
    <div
      v-if="showHistory"
      class="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm"
    >
      <h2 class="text-sm font-semibold text-neutral-800 mb-3">Snapshots</h2>
      <div v-if="sortedSnapshots.length === 0" class="text-sm text-neutral-400">No snapshots yet.</div>
      <ul v-else class="space-y-2">
        <li
          v-for="snap in sortedSnapshots"
          :key="snap.id"
          class="flex items-center justify-between text-sm text-neutral-700"
        >
          <div>
            <span class="font-medium">{{ snap.reason }}</span>
            <span class="text-neutral-400 ml-2">{{ new Date(snap.createdAt).toLocaleString() }}</span>
            <span class="text-neutral-400 ml-2">·</span>
            <span class="text-neutral-400 ml-2">{{ snap.entries.length }} entries</span>
          </div>
          <button
            class="text-xs text-accent-600 hover:text-accent-800 underline"
            @click="restoreSnapshot(snap.id)"
          >
            Restore
          </button>
        </li>
      </ul>
    </div>

    <!-- Empty state -->
    <div
      v-if="entriesStore.entries.length === 0"
      class="text-center py-16 text-neutral-500"
    >
      <p class="text-base">No entries yet.</p>
      <p class="text-sm mt-1">
        <RouterLink to="/" class="text-accent-600 hover:underline">Go to the home page</RouterLink>
        to define a schema and add entries.
      </p>
    </div>

    <DataTable
      v-else
      :entries="entriesStore.entries"
      :fields="schemaStore.schema.fields"
      :edit-mode="editMode"
      @edit="openEdit"
      @remove="onRemove"
    />

    <DataEditDrawer
      :entry="editingEntry"
      @save="onSave"
      @close="closeEdit"
    />
  </div>
</template>
