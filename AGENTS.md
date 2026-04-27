# AGENTS.md — Data Curata

> (Partly Outdated) Full spec: `docs/SPEC.md` · (Partly Outdated) Implementation notes & deviations: `docs/NOTES.md`

## Commands

```bash
pnpm dev             # dev server at localhost:5173
pnpm build           # production build (must pass before committing)
pnpm typecheck       # vue-tsc --noEmit (strict, no any without comment)
pnpm test            # Vitest unit tests (tests/unit/**/*.test.ts)
pnpm test:e2e        # Playwright smoke tests (tests/e2e/smoke.spec.ts)
pnpm lint            # ESLint static code analysis (eslint.config.js)
pnpm format          # Prettier code style enforcement (.prettierrc)
```

All four of `build`, `typecheck`, `test`, and `test:e2e` must pass before a task is done.

## Architecture in 60 seconds

```
src/
  lib/            ← pure logic, no Vue
    schema/       types · defaults · validate · migrate
    persistence/  db (idb) · schemaRepo · entriesRepo · historyRepo
    export/       index (format registry) · json · jsonl · csv
  stores/         schema · entries · history · ui   (Pinia, one concern each)
  composables/    useAutosave · useConfirm · useDownload
  components/
    schema/       SchemaEditor (shell) → SchemaVisualBuilder / SchemaRawEditor
    entry/        EntryForm → EntryField → fields/*.vue  (all recursive)
    data/         DataTable · DataEditDrawer · ClearAllButton
    actions/      ExportButton · ViewDataButton
    common/       ConfirmDialog · Toast · IconButton · CollapsibleSection
    layout/       AppHeader
  pages/          wiring only, no logic
```

**Key invariants:**
- Field identity = `id` (UUID). Never key on `name`.
- `useSchemaStore.setSchema()` is the single gate for all schema mutations — it runs the breaking-change guard, snapshots, and migrates entries.
- Validation lives only in `lib/schema/validate.ts`. Components call it; they never re-implement rules.
- Export formats: add one file in `lib/export/` + one entry in `lib/export/index.ts`. Never touch the component.
- Dark mode is class-based (`html.dark`). Toggle via `uiStore.toggleTheme()`. All Tailwind dark variants are already in place.

## Dark mode & theming

Tailwind `darkMode: 'class'` — the `dark` class lives on `<html>`. `uiStore.theme` persists to `localStorage`. Use `dark:*` variants in all new UI; never hardcode light-only colours.

## Persistence flow

App boots → `main.ts` awaits `schemaStore.hydrate()`, `entriesStore.hydrate()`, `historyStore.hydrate()` → then mounts. Schema is autosaved via `useAutosave` (300 ms debounce). Entries persist on each mutation directly (not debounced). Snapshots cap at 20 (FIFO, constant in `historyRepo.ts`).

## Engineering defaults

- **Read before editing.** Check the file first; don't guess at existing structure or blindly trust documentation files.
- **Typecheck after every non-trivial change.** `pnpm typecheck` catches Vue template errors that the editor misses.
- **No new dependencies** without checking docs/SPEC.md §2. If a library feels missing, ask first.
- **Commits after each logical unit** — conventional-commit prefix (`feat:`, `fix:`, `chore:`, `test:`, `docs:`).
- **No comments explaining what the code does.** Only comment *why* — hidden constraints, non-obvious invariants, workarounds.
- **No `any` without a JSDoc comment** explaining the interop reason (one exception: `EntryValue` recursive type).
- **Components > 200 lines → split.** Pages contain only store wiring; business logic belongs in `lib/` or stores.
- **One confirm dialog path.** All destructive actions go through `useConfirm()`. No `window.confirm`.
- **Errors surface inline**, not as alerts. Use `uiStore.addToast()` for operation feedback.
- **Linting and Formatting before committing** every change should be verified with the `pnpm lint` and `pnpm format`
