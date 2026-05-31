<script setup lang="ts">
import { computed, inject } from 'vue'
import type { Ref } from 'vue'
import { ChevronRight } from '@lucide/vue'
import { useRoute } from 'vue-router'
import type { NavNode } from './types'

const props = defineProps<{ node: NavNode }>()

const openFolders = inject<Ref<Set<string>>>('docs:openFolders')!
const toggleFolder = inject<(path: string) => void>('docs:toggleFolder')!
const docTitle = inject<(key: string) => string>('docs:docTitle')!

const route = useRoute()

const activeInFolder = computed(() => {
  if (props.node.type !== 'folder') return false
  const match = route.params.pathMatch
  const current = Array.isArray(match) ? match.join('/') : (match ?? '')
  return current.startsWith(`${props.node.path}/`)
})

function folderLabel(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ')
}

function docPath(key: string): string {
  if (key === 'index') return '/docs'
  if (key.endsWith('/index')) return `/docs/${key.slice(0, -6)}`
  return `/docs/${key}`
}
</script>

<template>
  <!-- File -->
  <RouterLink
    v-if="node.type === 'file'"
    :to="docPath(node.key)"
    class="text-sm px-2 py-1 rounded-md text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white transition-colors"
    active-class="bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400 font-medium"
  >
    {{ docTitle(node.key) }}
  </RouterLink>

  <!-- Folder -->
  <template v-else>
    <div class="flex items-center gap-0.5">
      <RouterLink
        v-if="node.indexKey"
        :to="docPath(node.indexKey!)"
        class="flex-1 text-sm px-2 py-1 rounded-md text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white transition-colors"
        active-class="bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400 font-medium"
      >
        {{ docTitle(node.indexKey) }}
      </RouterLink>
      <span
        v-else
        class="flex-1 text-sm px-2 py-1 text-neutral-600 dark:text-neutral-400 cursor-default select-none"
      >
        {{ folderLabel(node.name) }}
      </span>
      <button
        v-if="node.children.length > 0"
        class="p-1 rounded-md shrink-0 transition-colors"
        :class="
          activeInFolder
            ? 'text-neutral-400 dark:text-neutral-600 cursor-default'
            : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300'
        "
        :title="
          activeInFolder
            ? 'Cannot collapse — you are inside this folder'
            : openFolders.has(node.path)
              ? 'Collapse'
              : 'Expand'
        "
        :disabled="activeInFolder"
        @click="!activeInFolder && toggleFolder(node.path)"
      >
        <ChevronRight
          :class="[
            'w-4 h-4 transition-transform',
            openFolders.has(node.path) ? 'rotate-90' : '',
            activeInFolder ? 'opacity-30' : '',
          ]"
        />
      </button>
    </div>
    <div
      v-show="openFolders.has(node.path)"
      class="flex flex-col gap-0.5 pl-3"
    >
      <DocsNavNode
        v-for="child in node.children"
        :key="child.type === 'file' ? child.key : child.path"
        :node="child"
      />
    </div>
  </template>
</template>
