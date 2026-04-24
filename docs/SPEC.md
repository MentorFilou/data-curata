# Data Collection SPA

A local-first, single-user web application for structured data collection. Users define a custom data model, fill in entries matching that model, and export the resulting dataset in their format of choice. All state persists locally in the browser — no backend, no accounts, no network calls.

---

## 1. Purpose & Scope

The application is used internally to let employees work through a data source (documents, websites, lists, etc.) and capture structured records from it. Each employee works independently in their own browser; there is no shared state, no real-time collaboration, and no authentication.

The product has three concerns, in order of prominence on the landing page:

1. **Define** the shape of the data (the *data model* / schema).
2. **Enter** records that conform to that shape.
3. **Review and export** the collected records.

Everything else in this document supports those three concerns.

---

## 2. Tech Stack

- **Framework:** Vue 3 (Composition API, `<script setup>`). **No Nuxt.**
- **Build tool:** Vite.
- **Language:** TypeScript.
- **Routing:** `vue-router` (two routes — see §5).
- **Styling:** Tailwind CSS. No component library; styling is hand-rolled with Tailwind utilities.
- **State:** Pinia (one store per domain concern — see §7).
- **Persistence:** IndexedDB via `idb` (thin typed wrapper). `localStorage` is **not** used — IndexedDB handles larger datasets cleanly and keeps the persistence layer uniform.
- **Code editor component:** CodeMirror 6 (via `vue-codemirror`) for the raw-JSON schema editor.
- **Icons:** `lucide-vue-next`.
- **Testing:** Vitest for unit tests; Playwright for a small smoke-test suite covering the critical flows (define schema → add entry → export).
- **Lint/format:** ESLint + Prettier.

Dependencies are kept minimal and explicit. Anything not listed above should not be added without revisiting this document.

---

## 3. Repository Structure

A flat, conventional Vue 3 + Vite layout. Each page is one `.vue` file that composes components; components are grouped by feature, not by type.

```
.
├── README.md                    ← this document
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── .eslintrc.cjs
├── .prettierrc
├── public/
└── src/
    ├── main.ts                  ← app bootstrap, router + pinia registration
    ├── App.vue                  ← router-view + global layout (header/nav)
    ├── router/
    │   └── index.ts             ← route definitions
    ├── pages/
    │   ├── HomePage.vue         ← "/"  — schema editor + entry form + actions
    │   └── DataPage.vue         ← "/data" — table view, edit mode, clear-all
    ├── components/
    │   ├── layout/
    │   │   ├── AppHeader.vue
    │   │   └── AppFooter.vue
    │   ├── schema/
    │   │   ├── SchemaEditor.vue          ← collapsible shell, mode toggle
    │   │   ├── SchemaVisualBuilder.vue   ← default view: tree of fields
    │   │   ├── SchemaRawEditor.vue       ← CodeMirror JSON view
    │   │   ├── SchemaFieldRow.vue        ← one field (recursive for object/array)
    │   │   ├── SchemaTypePicker.vue      ← dropdown of allowed types
    │   │   ├── SchemaEnumEditor.vue      ← inline enum-values editor
    │   │   └── SchemaImportExport.vue    ← import/export schema as JSON file
    │   ├── entry/
    │   │   ├── EntryForm.vue             ← renders form from schema (recursive)
    │   │   ├── EntryField.vue            ← dispatcher by field type
    │   │   ├── fields/
    │   │   │   ├── StringField.vue
    │   │   │   ├── NumberField.vue
    │   │   │   ├── BooleanField.vue
    │   │   │   ├── DateField.vue
    │   │   │   ├── UrlField.vue
    │   │   │   ├── EnumField.vue
    │   │   │   ├── ObjectField.vue       ← recurses into EntryForm
    │   │   │   └── ArrayField.vue        ← repeatable rows of EntryField
    │   │   └── EntryActions.vue          ← "Add entry" / "Reset" buttons
    │   ├── actions/
    │   │   ├── ViewDataButton.vue
    │   │   └── ExportButton.vue          ← button + format dropdown
    │   ├── data/
    │   │   ├── DataTable.vue             ← flattened view of entries
    │   │   ├── DataTableRow.vue
    │   │   ├── DataEditDrawer.vue        ← compact form-reuse for edits
    │   │   └── ClearAllButton.vue
    │   └── common/
    │       ├── ConfirmDialog.vue         ← reusable confirm prompt
    │       ├── CollapsibleSection.vue
    │       ├── IconButton.vue
    │       └── Toast.vue
    ├── stores/
    │   ├── schema.ts             ← current schema + validation
    │   ├── entries.ts            ← records matching the schema
    │   ├── history.ts            ← snapshots (schema + data)
    │   └── ui.ts                 ← transient UI state (edit mode, toasts)
    ├── composables/
    │   ├── useAutosave.ts        ← debounced persistence
    │   ├── useConfirm.ts         ← programmatic confirm dialogs
    │   └── useDownload.ts        ← trigger file downloads
    ├── lib/
    │   ├── schema/
    │   │   ├── types.ts          ← FieldType union, SchemaNode types
    │   │   ├── validate.ts       ← schema & entry validation
    │   │   ├── defaults.ts       ← default value per type
    │   │   └── migrate.ts        ← best-effort entry migration on schema change
    │   ├── persistence/
    │   │   ├── db.ts             ← IndexedDB setup (idb)
    │   │   ├── schemaRepo.ts
    │   │   ├── entriesRepo.ts
    │   │   └── historyRepo.ts
    │   └── export/
    │       ├── index.ts          ← format registry
    │       ├── json.ts
    │       ├── jsonl.ts
    │       └── csv.ts            ← flattens nested fields with dot-paths
    ├── styles/
    │   └── main.css              ← Tailwind entry + a handful of base styles
    └── types/
        └── global.d.ts
```

**Rules of thumb enforced by the structure:**

- Every page file is a thin composition of components and store wiring — no business logic lives in `pages/`.
- Anything that might change frequently (allowed field types, export formats, validation rules) lives in `src/lib/` behind a small interface, so it can be edited in isolation.
- Adding a new field type is a four-file change: `lib/schema/types.ts`, `lib/schema/defaults.ts`, `lib/schema/validate.ts`, and a new `components/entry/fields/*.vue`. Adding a new export format is a one-file change plus a registry entry.

---

## 4. The Data Model

The data model — henceforth **schema** — is a tree of **fields**. The schema is what the user defines at the top of the home page; every entry is an object whose shape matches the schema.

### 4.1 Allowed field types

| Type      | Input control                              | Notes                                                           |
|-----------|--------------------------------------------|-----------------------------------------------------------------|
| `string`  | `<input type="text">` / `<textarea>`       | Optional `multiline` flag on the field.                         |
| `number`  | `<input type="number">`                    | Optional `integer` flag, optional `min` / `max`.                |
| `boolean` | checkbox or toggle                          |                                                                 |
| `date`    | `<input type="date">`                      | Stored as ISO 8601 (`YYYY-MM-DD`).                              |
| `url`     | `<input type="url">`                       | Validated as a parseable URL on entry.                          |
| `enum`    | `<select>`                                 | Requires a non-empty `values: string[]` on the field.           |
| `object`  | nested group (recursive `EntryForm`)       | Has its own `fields` array. Used for nesting.                   |
| `array`   | repeatable rows of a single inner type     | Has an `items` field definition (any type, including `object`). |

**Nesting depth:** minimum of 5 levels must be supported. The implementation should have no hard-coded depth limit beyond performance considerations; depth is bounded only by what `object` and `array` can recursively express.

### 4.2 Field definition

Every field, regardless of type, has this core shape:

```ts
interface FieldBase {
  id: string;              // stable uuid — survives renames, used as object key
  name: string;            // user-facing name; also the JSON key on export
  type: FieldType;         // one of the types above
  nullable: boolean;       // default: false
  description?: string;    // optional helper text shown under the input
}
```

Type-specific extensions:

- `StringField extends FieldBase { type: 'string'; multiline?: boolean }`
- `NumberField extends FieldBase { type: 'number'; integer?: boolean; min?: number; max?: number }`
- `DateField extends FieldBase { type: 'date' }`
- `UrlField extends FieldBase { type: 'url' }`
- `BooleanField extends FieldBase { type: 'boolean' }`
- `EnumField extends FieldBase { type: 'enum'; values: string[] }` — at least one value required.
- `ObjectField extends FieldBase { type: 'object'; fields: Field[] }`
- `ArrayField extends FieldBase { type: 'array'; items: Field }` — `items` is a full field definition (its own `name` is ignored on export; the array key is the `ArrayField`'s name).

The root schema is modeled as an implicit `ObjectField` — i.e. the user is always editing the list of top-level fields.

### 4.3 Nullability

- `nullable: false` (the default) — the entry form requires the field to be filled before "Add entry" is enabled.
- `nullable: true` — the field may be left blank; it is stored as `null` in the entry. The form shows a small "optional" hint.
- For `object` fields, `nullable: true` means the whole sub-object may be omitted (stored as `null`); otherwise the nested fields are validated recursively.
- For `array` fields, nullability is distinct from emptiness: a non-nullable array must have at least one item; a nullable array may be `null` or `[]`.

### 4.4 Schema editor — UX

The schema editor sits at the top of the home page, styled as a **dark, codeblock-like panel** (monospace accent, rounded, subtle border). It is **collapsed by default**, showing only a one-line summary: `Schema: 4 fields · click to edit`. When expanded it offers two interchangeable modes via a toggle in its header:

- **Visual mode (default):** a tree of `SchemaFieldRow` components. Each row has: drag handle (reorder), name input, type dropdown, nullable toggle, type-specific extras (enum values, array inner type, object children), and a delete button. An "+ Add field" button appears at each object level. Enum values are edited inline as a chip-style list with add/remove controls — no separate modal.
- **Raw mode:** a CodeMirror 6 editor containing the schema as pretty-printed JSON. Edits are validated on blur; invalid JSON is surfaced as an inline error and the visual-mode toggle is disabled until it parses.

Both modes are two views onto the same underlying `schema` store state — switching modes never loses work.

The editor header also contains:
- **Import schema** — reads a `.json` file, validates, and replaces the current schema (goes through the breaking-change flow in §6 if entries exist).
- **Export schema** — downloads the current schema as `schema.json`.

### 4.5 Schema file format

Exported/imported schemas are plain JSON:

```json
{
  "version": 1,
  "fields": [
    { "id": "…", "name": "title", "type": "string", "nullable": false },
    {
      "id": "…",
      "name": "author",
      "type": "object",
      "nullable": false,
      "fields": [
        { "id": "…", "name": "name", "type": "string", "nullable": false },
        { "id": "…", "name": "homepage", "type": "url", "nullable": true }
      ]
    }
  ]
}
```

The `version` field is reserved for future schema-format migrations.

---

## 5. Pages & Routing

Two routes, both registered in `src/router/index.ts`:

| Path     | File            | Purpose                                                       |
|----------|-----------------|---------------------------------------------------------------|
| `/`      | `HomePage.vue`  | Schema editor, entry form, and action buttons.                |
| `/data`  | `DataPage.vue`  | Table of entries, edit mode, clear-all.                       |

Global layout (`App.vue`) renders `AppHeader` (app name + nav links + entry count badge) and `<router-view />`.

### 5.1 HomePage (`/`)

Vertical layout, top to bottom:

1. **`SchemaEditor`** — collapsible codeblock-style panel described in §4.4.
2. **`EntryForm`** — a polished, spacious form rendered from the current schema. Empty schema shows a friendly empty state pointing users at the editor above. Labels use the field `name`; optional fields are marked with a subtle "optional" pill. Nested objects render as indented, visually grouped sub-sections; arrays render with an "+ Add item" button and per-item remove controls. The "Add entry" button at the bottom is disabled until all non-nullable fields validate.
3. **Action row** — `ViewDataButton` (→ `/data`) and `ExportButton` with format dropdown (see §8).

### 5.2 DataPage (`/data`)

1. Header row: "Entries (N)", an **Edit mode** toggle in the top-right, and a **Clear all data** button.
2. **`DataTable`** — one row per entry. Columns are the top-level field names; nested objects show as a compact summary (`{…}` with tooltip/expand); arrays show as `[n items]`. Column order matches schema order.
3. In **edit mode**: each row gets pencil and trash icons at the right. Pencil opens `DataEditDrawer` (a side drawer reusing `EntryForm` with a simpler, denser visual style — see §9). Trash triggers a `ConfirmDialog` ("Delete this entry? This cannot be undone.") before removing.
4. **Clear all data** also goes through `ConfirmDialog` and snapshots before wiping.
5. A "History" affordance (small link in the header) lists snapshots and allows restoring (§6.3).

---

## 6. Schema Changes, History & Safety

### 6.1 Autosave

The `schema` and `entries` stores persist to IndexedDB on every mutation via the `useAutosave` composable, debounced at ~300 ms. On app start, both stores hydrate from IndexedDB before the first render of the form. The user never has to save manually.

### 6.2 Breaking-change guard

A schema change is considered **breaking** if entries exist AND the change is not purely additive (nullable fields can be added freely; anything else — removing a field, renaming, changing type, changing nullability on an existing field, reordering that affects identity — is breaking).

When the user attempts a breaking change and entries exist:

1. A `ConfirmDialog` appears: *"You have N saved entries. Editing the schema this way may alter or drop data in existing entries. A snapshot will be saved so you can restore. Continue?"*
2. On **OK**: the current `{ schema, entries }` pair is written as a snapshot (§6.3), the schema change is applied, and entries are migrated best-effort by `lib/schema/migrate.ts`:
   - Added nullable fields → `null`.
   - Removed fields → dropped from each entry.
   - Type changes → attempt coercion (e.g. `number` ↔ `string`); on failure, set to `null` if nullable, otherwise to the type's default.
   - Renames (same `id`, new `name`) → key renamed in each entry.
3. On **Cancel**: the schema reverts.

Purely additive nullable-field additions skip the dialog but still snapshot silently.

### 6.3 History / snapshots

- Stored in IndexedDB in a separate `snapshots` object store.
- Each snapshot: `{ id, createdAt, reason: 'schema-change' | 'clear-all' | 'import', schema, entries }`.
- Rolling cap of **20 snapshots**, FIFO eviction. The cap is a constant in `lib/persistence/historyRepo.ts` and is easy to change.
- Accessible from the `DataPage` header; each snapshot can be previewed (entry count, timestamp, reason) and restored. Restoring itself takes a snapshot first (so "undo restore" works).

### 6.4 Clear-all

The **Clear all data** button on the data page:

1. Opens `ConfirmDialog`: *"Delete all N entries? A snapshot will be saved so you can restore."*
2. On OK: snapshots current state (reason: `clear-all`), then empties the entries store. The schema is untouched.

---

## 7. State Management (Pinia)

Four stores, each with a narrow surface:

- **`useSchemaStore`** — `schema: Schema`, `setSchema()`, `addField()`, `updateField()`, `removeField()`, `moveField()`. All mutations route through a single `applyChange(change)` method that: (a) classifies the change as breaking or additive, (b) triggers the guard if breaking, (c) persists, (d) migrates entries.
- **`useEntriesStore`** — `entries: Entry[]`, `addEntry()`, `updateEntry(id, patch)`, `removeEntry(id)`, `clearAll()`. Does not know about the schema directly; migration is driven by the schema store calling into it.
- **`useHistoryStore`** — `snapshots: Snapshot[]`, `snapshot(reason)`, `restore(id)`, `list()`, cap enforcement.
- **`useUiStore`** — `editMode: boolean`, `schemaEditorMode: 'visual' | 'raw'`, `schemaEditorExpanded: boolean`, toast queue.

Stores are thin; the heavy logic (validation, migration, exports) lives in `src/lib/` and is imported where needed. This keeps stores testable and replaceable.

---

## 8. Export

Triggered by `ExportButton` on the home page. The button itself triggers the default format; the dropdown arrow opens a menu of alternatives.

- **Default:** JSON — a pretty-printed array of entry objects.
- **JSONL** — one entry per line, no surrounding array.
- **CSV** — nested fields flattened with dot-paths (`author.name`, `tags.0`, `tags.1`, …). Columns are the union of all paths present in the data. Values are escaped per RFC 4180. Arrays of objects expand to numbered-path columns; if this produces a jagged table, missing cells are left empty.

Formats live in `src/lib/export/`. Each format exports:

```ts
interface ExportFormat {
  id: string;                       // 'json' | 'jsonl' | 'csv' | …
  label: string;                    // "JSON"
  extension: string;                // 'json'
  mimeType: string;                 // 'application/json'
  serialize(entries: Entry[], schema: Schema): string | Blob;
}
```

A `formats` array in `lib/export/index.ts` is the single registration point. Adding a new format is: create the file, append to the array. The dropdown reads from this array.

Exported filenames are `entries-<yyyy-mm-dd>.<ext>`.

---

## 9. Entry form reuse on DataPage

`EntryForm` is used in two places with a `variant` prop:

- `variant="full"` — spacious, labels above inputs, helper text visible, used on the home page.
- `variant="compact"` — denser, labels inline, helper text on hover, used inside `DataEditDrawer`.

Both variants share the same field dispatcher (`EntryField`) and the same validation. Only spacing/typography differ, controlled by a handful of Tailwind class branches. Nested objects and arrays work identically in both.

Edits in the drawer are staged — the drawer has explicit **Save** and **Cancel** buttons; closing without saving discards changes.

---

## 10. Validation

Validation is centralized in `src/lib/schema/validate.ts` and exposes two functions:

- `validateSchema(schema): SchemaValidationResult` — used by the schema editor (especially raw mode). Checks: unique field names per object level, non-empty names, enum values non-empty, array `items` present, no cycles (shouldn't be possible via the editor, but checked in raw mode).
- `validateEntry(entry, schema): EntryValidationResult` — used by the entry form to gate "Add entry" and by migration to detect which entries became invalid after a schema change. Returns a map of `fieldPath → error` so the form can surface errors inline.

URL validation uses the `URL` constructor. Date validation checks ISO format and a valid calendar date.

---

## 11. Styling Conventions

- Tailwind utilities only; no component library, no ad-hoc CSS beyond `styles/main.css` (Tailwind entry + two or three base rules for scrollbar and selection color).
- Neutral palette with a single accent color defined in `tailwind.config.js` so rebranding is a one-line change.
- Dark surface for the schema editor panel to reinforce its "code" feel; the rest of the app is light. (A full dark-mode theme is out of scope for v1 but the single-accent approach keeps the door open.)
- Icon buttons get hover + focus-visible states; all interactive elements are keyboard-reachable.
- Layout max-width ~1100 px, centered, comfortable vertical rhythm.

---

## 12. Non-Goals (v1)

Explicitly out of scope to keep the build clean:

- Authentication, multi-user, sync, or any backend.
- Real-time collaboration.
- Rich-text fields, file upload fields, image fields.
- Search / filter in the data table (can be added later — table component is isolated).
- Schema versioning beyond the `version: 1` marker.
- Full dark mode across the app.
- i18n.

These are all easy to bolt on later because of the structure in §3; listing them here prevents accidental scope creep during implementation.

---

## 13. Implementation Checklist (for the coding agent)

A suggested order of work. Each step is independently runnable and testable.

1. Scaffold Vite + Vue 3 + TS + Tailwind + Pinia + vue-router. Configure ESLint, Prettier, Vitest.
2. Create the folder structure in §3 with empty files and a minimal `App.vue` + two placeholder pages.
3. Implement `src/lib/schema/types.ts` and `defaults.ts`. No UI yet.
4. Implement `src/lib/persistence/db.ts` and the three repos. Write a Vitest suite against an in-memory IndexedDB shim.
5. Implement `useSchemaStore` and `useEntriesStore` with autosave. Verify round-trip through IndexedDB.
6. Build `SchemaVisualBuilder` with add/remove/reorder and the type picker. Hard-code nesting via recursion; confirm 5+ levels work.
7. Add `SchemaEnumEditor` and `SchemaFieldRow` specializations for enum/array/object.
8. Build `SchemaRawEditor` with CodeMirror 6 and the mode toggle in `SchemaEditor`.
9. Build `EntryForm` + all `fields/*.vue` components. Wire validation. Implement `variant` prop but only use `full` for now.
10. Implement `useHistoryStore` and the breaking-change guard in the schema store. Add the confirm dialog.
11. Build `HomePage.vue` composing schema editor + entry form + action row.
12. Build `DataTable`, `DataPage`, edit mode, `DataEditDrawer` (uses `EntryForm variant="compact"`), delete confirm, clear-all.
13. Implement `lib/export/` with JSON, JSONL, CSV. Wire `ExportButton` + dropdown.
14. Implement schema import/export (`SchemaImportExport`).
15. Add Playwright smoke tests for the three critical flows.
16. Polish: empty states, toasts, focus states, keyboard navigation on the schema builder.

---

## 14. Glossary

- **Schema / data model** — the user-defined tree of fields that describes the shape of entries.
- **Field** — one node in the schema (e.g. `title: string`, `author: object`).
- **Entry / record** — one user-submitted object conforming to the schema.
- **Snapshot** — a point-in-time `{ schema, entries }` pair saved to IndexedDB, used for recovery from breaking changes and clear-all.
- **Breaking change** — a schema edit that is not purely the addition of nullable fields.
- **Additive change** — a schema edit that only adds nullable fields; entries remain valid without migration.