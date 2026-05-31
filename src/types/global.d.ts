/// <reference types="vite/client" />

declare module 'markdown-it-front-matter' {
  import type MarkdownIt from 'markdown-it'
  function markdownItFrontMatter(md: MarkdownIt, cb: (fm: string) => void): void
  export default markdownItFrontMatter
}
