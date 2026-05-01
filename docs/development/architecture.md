---
order: 901
title: Architecture
---
## Root-level structure

### Folders

| Path | Purpose |
|---|---|
| `.github/` | GitHub-specific config: CI workflows, issue templates, PR templates |
| `docs/` | In-app documentation source — Markdown files rendered automatically inside the running app |
| `public/` | Static assets served as-is (not processed by Vite): images, `CNAME` for the custom domain |
| `src/` | Full application source — see [Src-level folder structure](#src-level-structure) |
| `tests/` | Static correctness checks: unit tests (Vitest) and end-to-end smoke tests (Playwright) |

### Files

| File | Purpose |
|---|---|
| `.gitattributes` / `.gitignore` | Git line-ending normalization and untracked-file exclusions |
| `.prettierrc` | Prettier formatting rules |
| `eslint.config.js` | ESLint rule set |
| `tsconfig.json` / `tsconfig.e2e.json` | TypeScript compiler config — base for `src/`, extended for Playwright tests |
| `vite.config.js` | Vite bundler config: aliases, plugins, build output |
| `playwright.config.ts` | Playwright runner config: browsers, base URL, test directory |
| `postcss.config.js` | PostCSS pipeline — currently only wires in Tailwind CSS |
| `package.json` | Project manifest: name, version, scripts, dependencies |
| `pnpm-lock.yaml` | Locked dependency graph |
| `index.html` | Vite HTML entry point; Vue mounts into `#app` |
| `AGENTS.md` / `CLAUDE.md` | AI-agent context: repo conventions, commands, architecture summary |

## Test-level structure

| Path | Purpose |
|---|---|
| `unit/export.test.ts` | Export format correctness (JSON, JSONL, CSV) |
| `unit/migrate.test.ts` | Schema migration across versions |
| `unit/persistence.test.ts` | IndexedDB repository layer (schema, entries, history) |
| `unit/validate.test.ts` | Schema and entry validation rules |
| `e2e/smoke.spec.ts` | Full app smoke test — boots the app and exercises the core user flows |

## Src-level structure

### Root files

| File | Purpose |
|---|---|
| `main.ts` | App entry point — hydrates all stores, then mounts Vue |
| `App.vue` | Root component: router outlet and global overlays (Toast, ConfirmDialog) |
| `router.ts` | Vue Router config — one route per page |
| `styles.css` | Global CSS: Tailwind base imports and a handful of overrides |

### Folders

| Path | Purpose |
|---|---|
| `lib/` | Pure TypeScript logic — no Vue, no stores. Importable and testable in isolation |
| `lib/schema/` | Core schema domain: `types.ts` (shared type definitions), `defaults.ts`, `validate.ts`, `migrate.ts` |
| `lib/persistence/` | IndexedDB access via `db.ts` (connection) and three repo modules — `schemaRepo`, `entriesRepo`, `historyRepo` |
| `lib/export/` | Format registry (`index.ts`) and one file per format: `json.ts`, `jsonl.ts`, `csv.ts`, `remap.ts` (field flattening) |
| `stores/` | Pinia stores, one concern each: `schema.ts`, `entries.ts`, `history.ts`, `ui.ts` |
| `composables/` | Reusable Vue composition functions: `useAutosave.ts`, `useConfirm.ts`, `useDownload.ts` |
| `pages/` | Page-level components — store wiring only, no business logic: `DefinePage`, `CollectPage`, `ReviewPage`, `DocsPage`, `HomePage` |
| `components/define-page/` | Schema editor shell (`SchemaEditor`) → visual builder (`SchemaVisualBuilder`) or raw JSON editor (`SchemaRawEditor`), plus supporting field-level components |
| `components/collect-page/` | Entry form (`EntryForm`) → `EntryField` → `fields/*.vue` (one component per field type, recursive for object/array) |
| `components/review-page/` | Data table (`DataTable` + `DataTableRow`), inline edit drawer (`DataEditDrawer`), bulk clear action (`ClearAllButton`) |
| `components/docs-page/` | Documentation renderer (`DocsView`) with tree navigation (`DocsNavNode`) |
| `components/actions/` | Toolbar-level actions: `ExportButton`, `ImportButton`, `ViewDataButton` |
| `components/common/` | Shared primitives: `ConfirmDialog`, `Toast`, `IconButton`, `CollapsibleSection`, `PrimaryToggle` |
| `components/layout/` | Chrome: `AppHeader`, `AppFooter` |
| `types/` | Global TypeScript ambient declarations (`global.d.ts`) |
