<script setup lang="ts">
import { computed, provide, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import MarkdownIt from 'markdown-it'
import markdownItFrontMatter from 'markdown-it-front-matter'
import DocsNavNode from './DocsNavNode.vue'
import type { NavNode } from './types'

// Strip front matter from rendered HTML; the callback is a no-op here
// because we parse front matter separately below via regex.
const md = new MarkdownIt()
md.use(markdownItFrontMatter, () => {})

const rawModules = import.meta.glob('../../../docs/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const docsMap: Record<string, string> = {}
const frontMatterMap: Record<string, { order?: number; title?: string }> = {}

function parseFrontMatter(raw: string): { order?: number; title?: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}
  const fm = match[1]
  const orderMatch = fm.match(/^order:\s*(\d+)/m)
  const titleMatch = fm.match(/^title:\s*(.+)/m)
  return {
    order: orderMatch ? parseInt(orderMatch[1], 10) : undefined,
    title: titleMatch ? titleMatch[1].trim() : undefined,
  }
}

for (const fullPath in rawModules) {
  const key = fullPath.replace(/^.*\/docs\//, '').replace(/\.md$/, '')
  const raw = rawModules[fullPath] as string
  docsMap[key] = raw
  frontMatterMap[key] = parseFrontMatter(raw)
}

function docTitle(key: string): string {
  const fmTitle = frontMatterMap[key]?.title
  if (fmTitle) return fmTitle
  const raw = docsMap[key] ?? ''
  const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
  const firstLine = body.trimStart().split('\n')[0] ?? ''
  const fromHeading = firstLine.match(/^#\s+(.+)/)
  if (fromHeading) return fromHeading[1].trim()
  const segment = key.split('/').pop() ?? key
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
}



function nodeOrder(node: NavNode): number | undefined {
  if (node.type === 'file') return frontMatterMap[node.key]?.order
  return node.indexKey != null ? frontMatterMap[node.indexKey]?.order : undefined
}

function nodeName(node: NavNode): string {
  return node.type === 'file' ? (node.key.split('/').pop() ?? node.key) : node.name
}

function sortNodes(nodes: NavNode[]): NavNode[] {
  return [...nodes].sort((a, b) => {
    const oa = nodeOrder(a)
    const ob = nodeOrder(b)
    if (oa !== undefined && ob !== undefined) return oa - ob
    if (oa !== undefined) return -1
    if (ob !== undefined) return 1
    return nodeName(a).localeCompare(nodeName(b))
  })
}

function buildTree(relativeKeys: string[], prefix: string): NavNode[] {
  const folders: Record<string, string[]> = {}
  const roots: NavNode[] = []

  for (const key of relativeKeys) {
    const slash = key.indexOf('/')
    if (slash === -1) {
      roots.push({ type: 'file', key: prefix ? `${prefix}/${key}` : key })
    } else {
      const segment = key.slice(0, slash)
      ;(folders[segment] ??= []).push(key.slice(slash + 1))
    }
  }

  for (const [segment, children] of Object.entries(folders)) {
    const path = prefix ? `${prefix}/${segment}` : segment
    const hasIndex = children.includes('index')
    roots.push({
      type: 'folder',
      name: segment,
      path,
      indexKey: hasIndex ? `${path}/index` : null,
      children: sortNodes(buildTree(hasIndex ? children.filter((c) => c !== 'index') : children, path)),
    })
  }

  return sortNodes(roots)
}

const navTree = computed<NavNode[]>(() => buildTree(Object.keys(docsMap), ''))

const openFolders = ref<Set<string>>(new Set())

function toggleFolder(path: string) {
  const next = new Set(openFolders.value)
  if (next.has(path)) next.delete(path)
  else next.add(path)
  openFolders.value = next
}

provide('docs:openFolders', openFolders)
provide('docs:toggleFolder', toggleFolder)
provide('docs:docTitle', docTitle)

const route = useRoute()

const currentKey = computed(() => {
  const match = route.params.pathMatch
  const joined = Array.isArray(match) ? match.join('/') : (match ?? '')
  return joined || 'index'
})

watchEffect(() => {
  // Auto-open every ancestor folder of the active page
  const parts = currentKey.value.split('/')
  parts.pop()
  let path = ''
  for (const part of parts) {
    path = path ? `${path}/${part}` : part
    if (!openFolders.value.has(path)) {
      openFolders.value = new Set([...openFolders.value, path])
    }
  }
})

const resolvedKey = computed(() => {
  if (docsMap[currentKey.value] !== undefined) return currentKey.value
  const withIndex = `${currentKey.value}/index`
  if (docsMap[withIndex] !== undefined) return withIndex
  return currentKey.value
})

const renderedHtml = computed(() => {
  const raw = docsMap[resolvedKey.value]
  return raw != null ? md.render(raw) : null
})

const breadcrumb = computed(() => {
  const parts = currentKey.value.split('/')
  const trimmed = parts.at(-1) === 'index' ? parts.slice(0, -1) : parts
  return trimmed.map((s) => s.replace(/-/g, ' ')).join(' / ')
})
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <aside
      class="w-44 sm:w-56 flex-shrink-0 border-r border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 p-4"
    >
      <p class="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
        Pages
      </p>
      <nav class="flex flex-col gap-0.5">
        <DocsNavNode
          v-for="node in navTree"
          :key="node.type === 'file' ? node.key : node.path"
          :node="node"
        />
      </nav>
    </aside>

    <!-- Main -->
    <div class="flex-1 min-w-0 p-8">
      <!-- Breadcrumb -->
      <div class="text-xs text-neutral-400 dark:text-neutral-500 mb-6">
        <RouterLink to="/docs" class="hover:text-neutral-600 dark:hover:text-neutral-300">docs</RouterLink>
        <span v-if="currentKey !== 'index'"> / {{ breadcrumb }}</span>
      </div>

      <!-- Content -->
      <div
        v-if="renderedHtml !== null"
        class="docs-content prose max-w-3xl text-neutral-800 dark:text-neutral-200"
        v-html="renderedHtml"
      />
      <div v-else class="text-neutral-500 dark:text-neutral-400">
        Page not found: <code class="font-mono text-sm">{{ resolvedKey }}</code>
      </div>
    </div>
  </div>
</template>

<style scoped>
.docs-content :deep(h1) {
  @apply text-2xl font-bold mb-4 text-neutral-900 dark:text-neutral-100;
}
.docs-content :deep(h2) {
  @apply text-xl font-semibold mt-8 mb-3 text-neutral-900 dark:text-neutral-100;
}
.docs-content :deep(h3) {
  @apply text-base font-semibold mt-6 mb-2 text-neutral-900 dark:text-neutral-100;
}
.docs-content :deep(p) {
  @apply mb-3 leading-relaxed;
}
.docs-content :deep(ul),
.docs-content :deep(ol) {
  @apply pl-5 mb-3;
}
.docs-content :deep(li) {
  @apply mb-1;
}
.docs-content :deep(pre) {
  @apply bg-neutral-100 dark:bg-neutral-800 rounded-md p-4 overflow-x-auto text-sm mb-4;
}
.docs-content :deep(code) {
  @apply bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-sm font-mono;
}
.docs-content :deep(pre) :deep(code) {
  @apply bg-transparent p-0;
}
.docs-content :deep(blockquote) {
  @apply border-l-4 border-neutral-300 dark:border-neutral-600 pl-4 text-neutral-500 dark:text-neutral-400 my-4;
}
.docs-content :deep(a) {
  @apply text-accent-700 dark:text-accent-400 hover:underline;
}
.docs-content :deep(hr) {
  @apply border-neutral-200 dark:border-neutral-700 my-6;
}
.docs-content :deep(table) {
  @apply w-full text-sm border-collapse mb-4;
}
.docs-content :deep(th) {
  @apply bg-neutral-100 dark:bg-neutral-800 font-semibold text-left px-3 py-2 border border-neutral-200 dark:border-neutral-700;
}
.docs-content :deep(td) {
  @apply px-3 py-2 border border-neutral-200 dark:border-neutral-700;
}
</style>
