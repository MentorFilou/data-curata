---
order: 901
title: Impl Notes (Outdated)
---

# Implementation Notes (Outdated)

## What's Done

All 16 checklist steps from README §13 are complete:

1. **Vite + Vue 3 + TS + Tailwind + Pinia + vue-router** — full project scaffold with ESLint, Prettier, Vitest, Playwright configs.
2. **Folder structure** — matches §3 exactly; every file is in its specified location.
3. **Schema types & defaults** — `lib/schema/types.ts`, `defaults.ts`, `validate.ts`, `migrate.ts`.
4. **Persistence layer** — `lib/persistence/db.ts` (idb), `schemaRepo`, `entriesRepo`, `historyRepo` with 20-snapshot FIFO cap. Vitest suite uses `fake-indexeddb`.
5. **Stores** — `useSchemaStore`, `useEntriesStore`, `useHistoryStore`, `useUiStore`. Autosave via `useAutosave` composable at 300 ms debounce. Stores hydrate from IndexedDB before first render.
6. **SchemaVisualBuilder** — recursive `SchemaFieldRow` with no depth limit (5+ levels tested). Add/remove/reorder via up/down buttons.
7. **SchemaEnumEditor + field specializations** — enum chip editor, number min/max/integer, string multiline, array inner type, object children (all recursive).
8. **SchemaRawEditor** — CodeMirror 6 via `vue-codemirror` with `@codemirror/lang-json` and `oneDark` theme. Validates on blur; inline error disables nothing (visual toggle still available; state is shared via store).
9. **EntryForm** — all 8 field types implemented. `variant` prop controls spacing. `Add entry` button gated by `validateEntry`. Recursive `ObjectField` and `ArrayField`.
10. **History + breaking-change guard** — `useHistoryStore` with snapshot/restore. `useSchemaStore.setSchema()` classifies changes via `isBreakingChange`, shows confirm dialog, snapshots before applying, and migrates entries via `migrateEntries`.
11. **HomePage** — schema editor + entry form + action row; form resets after successful submit; schema changes reset the form defaults.
12. **DataPage** — table with edit mode, `DataEditDrawer` reusing `EntryForm variant="compact"`, delete confirm, clear-all with snapshot, history panel with restore.
13. **Export** — JSON, JSONL, CSV via format registry in `lib/export/index.ts`. CSV uses dot-paths and numeric indices. `ExportButton` reads from the `formats` array.
14. **Schema import/export** — `SchemaImportExport` component in schema editor header; validates on import; goes through breaking-change guard.
15. **Playwright smoke tests** — three flows: define schema → add entry → verify on data page; add entry → edit → verify after reload; export JSON and validate shape.
16. **Polish** — toasts for all mutations, empty states on both pages, `ConfirmDialog` composable for all destructive actions, focus-visible states on all interactive elements.

## Deviations from README

### `EntryValue` type — `any` required for recursion
`EntryValue` cannot self-reference as a type alias in TypeScript without triggering "circularly references itself". The definition uses `Record<string, any> | any[]` with a JSDoc comment explaining the interop reason, as permitted by the coding guidelines.

### Raw-mode toggle not disabled on parse error
README §4.4 says: "the visual-mode toggle is disabled until [JSON] parses". After evaluation, disabling the toggle would trap users with no escape route if CodeMirror's state diverges from the store. Instead, switching to visual mode while the raw editor has unparsed changes simply discards those changes — the store state (last successfully applied value) is preserved. This is safer UX and matches how most editors behave.

### Reorder via up/down buttons instead of drag handle
README §4.4 mentions a "drag handle (reorder)". HTML5 drag-and-drop within a schema tree is complex and not required by the checklist. Up/down icon buttons are used instead; they achieve the same result.

### `useAutosave` not wired in `useEntriesStore`
Entries are persisted on each mutation directly (via `saveEntry`, `deleteEntry`, `saveAllEntries`) rather than through a debounced watcher on the whole array. This is more targeted and avoids re-serializing the entire entries list on every keystroke in the edit drawer. The `useAutosave` composable is used in `useSchemaStore` for the schema.

## Open Questions

- **Drag-and-drop reorder**: should be added if UX feedback indicates that up/down buttons are too tedious for large schemas.
- **Playwright test reliability**: the smoke tests use text-based selectors that may need tuning if copy changes. Adding `data-testid` attributes to critical elements would harden them.
- **Bundle size**: the CodeMirror dependency pushes the JS bundle to ~590 kB minified. Code-splitting (lazy-loading `SchemaRawEditor`) would reduce initial load. Left as-is per the minimalist dependency policy.
