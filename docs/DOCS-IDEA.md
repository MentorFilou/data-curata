# Idea Notes: Repository Structure, Architecture & Documentation

> **Status:** Pre-spec / idea collection. Intended as the basis for later formal requirements.
> **Scope:** Vue application, but most ideas are general and applicable beyond Vue.
> **Audience:** Future-me + team members who will turn this into formal specs.

---

## 1. Goals

- Define a **repository structure** that makes the project future-proof.
- Define a **software architecture** approach with clear, traceable decisions.
- Define a **documentation strategy** that is rendered in-app and serves both end users and developers.
- Establish **two complementary requirements-engineering tracks** (ADRs + OpenFastTrace) with clearly separated use cases.

---

## 2. In-App Documentation (`docs/`)

### 2.1 Concept

- A `docs/` folder exists in the repository.
- Its content is **actively rendered as in-app documentation**, accessible from within the running application.
- Rendering is done via a Markdown rendering tool such as `markdown-it` (or similar).
- Generation of this in-app documentation is **already implemented** in the current codebase.

### 2.2 Folder layout

```
docs/
├── index.md
├── getting-started.md
├── ...                  # other root-level docs
├── usage/               # end-user-facing documentation
└── development/         # developer-facing documentation
```

- Root-level files (`index.md`, `getting-started.md`, and similar) live directly under `docs/`.
- All other content is split clearly into:
  - **`usage/`** — for end users of the application.
  - **`development/`** — for developers working on the application.

### 2.3 Reserved section: requirements for the in-app docs generator

- The in-app documentation generator itself needs **clear requirements**.
- A dedicated section / file shall be reserved for these requirements.
- This section will be **filled out later** — for now we only reserve the slot.

> **Open Question (TBD):** Exact location of this reserved section (e.g. `docs/development/in-app-docs-generator.md` vs. a subfolder).

---

## 3. Requirements Documentation: Two Complementary Approaches

We deliberately use **two different mechanisms**, split by use case:

| Approach | Use case |
|---|---|
| **(1) ADRs (MADR)** | Major architectural decisions that affect the repository broadly and cannot be cleanly localized. |
| **(2) OpenFastTrace (OFT)** | Clearly identifiable pieces of the codebase, even if they appear in multiple places, as long as the affected scope is well-defined. |

The split must be **clear per use case** — not mixed.

---

## 4. Approach (1): ADRs via MADR

### 4.1 Location & naming

- An `adr/` folder, located somewhere in the docs tree.
  > **Open Question (TBD):** Most likely under `docs/development/adr/`, but to be confirmed.
- Files use the **MADR** template.
- Filenames are **indexed** and use **kebab-case**:
  ```
  000-name-of-the-architecture-decision.md
  001-using-vue-with-vue-router.md
  002-using-madr-4-0-0-for-major-architectural-decisions.md
  ```

### 4.2 What belongs in an ADR

- **Major architectural decisions** that:
  - Do **not** affect a clearly markable part of the application, but rather are spread across the repository.
  - Are touched by essentially every MR.
- Examples:
  - "Using Vue with vue-router"
  - "Using MADR 4.0.0 for major architectural decisions"
- Detail lives inside each ADR file itself.

### 4.3 Why ADRs (and not OFT) for these

- These decisions are part of nearly every MR.
- We do **not** want to update tracing (see Section 5) every time for everything.
- Instead, ADRs are respected through **manual elaboration in every MR**.

### 4.4 Enforcement: CI check on MR description

A CI workflow/job enforces ADR acknowledgement via the MR description:

- The MR description must contain a **checkbox per ADR**, labeled with the ADR title:
  ```
  [x] Using MADR 4.0.0 for major architectural decisions
  ```
- The job **fails and blocks the merge** in two distinguishable cases:
  1. **Missing entirely** — the MR description does not contain the ADR section/checkboxes at all.
  2. **Present but unchecked** — e.g. `[ ] Using MADR 4.0.0 for major architectural decisions`.
- The two failure cases must be **differentiated** in the CI output to help debugging.

### 4.5 Bot behavior on failure

When the check fails, a bot should:

1. Add a message to the MR explaining that **all ADRs need to be checked off**.
2. *If possible*, automatically **prepend the MR description** with a section:
   ```markdown
   # This MR respects Architectural Decisions
   [ ] <ADR title 1>
   [ ] <ADR title 2>
   ...
   ```
   — listing all ADRs as **unchecked**.
3. Editing the MR description might re-trigger the workflow automatically — that is acceptable.
4. If editing the MR description is **not possible or too fragile**, the bot just notifies the user and lets them add the section themselves.

> **Open Question (TBD):** Whether the bot can/should edit MR descriptions in our chosen forge (GitHub/GitLab/...). Fallback path is the notify-only behavior.

### 4.6 Per-ADR additional checks

- Each ADR **may define additional required CI checks** of its own.
- These per-ADR checks **may use OFT tracing** (see Section 5).
- Example: ADR "Using Vue with vue-router" might specify a CI job that:
  - Blocks the merge if the MR introduces `.tsx` files.
  - Blocks the merge if Nuxt is added as a dependency.
  - Etc.
- That CI job is then added as part of adopting the ADR.

---

## 5. Approach (2): OpenFastTrace (OFT)

### 5.1 When to use OFT

- For **clearly identifiable pieces** inside the codebase.
- Acceptable even if a piece occurs in multiple places — as long as it does **not** have a very generalised effect that uncontrollably affects an unidentifiable set of MRs.
- If the affected scope is unclear/broad → use an **ADR** instead (Section 4).

### 5.2 CI enforcement

- A CI job runs OFT.
- The job **fails if OFT is not satisfied**.

### 5.3 Where OFT items live

OFT items will mostly live in Markdown files under `development/`, clearly identified in a dedicated section as OFT itself recommends.

Placement rules:

- **In `development/` files:** OFT requirements are **always stated outside the front-matter**, so they are clearly part of the **visible** documentation a developer might read (in-app rendering is just a more comfortable way to read them).
- **In `usage/` files:** *if possible*, high-level OFT items (typically **use cases**) may be specified inside the **front-matter**, so they are **invisible to the end user** but still tracked.

### 5.4 Trace structure

The intended trace flow:

```
usecase [usecase] (optional)
   │
   ▼
requirement [req]
   │
   ▼
design [dsn]  /  architecture [arch]
   │
   ▼
implementation [impl]
unit test       [utest]
integration test[itest]
system test     [stest]
user docs       [udoc]
dev docs        [ddoc]
```

- Some artifact types are **optional**, e.g.:
  - `usecase`
  - Certain types of tests
  - Certain types of docs

> **Open Question (TBD):** Concrete rules for which artifact types are mandatory vs. optional per requirement category.

---

## 6. Summary: When to use which

| Situation | Mechanism |
|---|---|
| Decision spans the whole repo, touched by ~every MR | **ADR** + MR-description checkbox CI |
| Decision is localized (even if multi-site) and traceable | **OFT** + OFT CI |
| Per-ADR localized rule that *can* be checked mechanically | **ADR** + dedicated CI job, optionally backed by **OFT** |
| End-user-facing use cases worth tracking invisibly | **OFT in `usage/` front-matter** |
| Developer-facing requirements | **OFT in `development/` outside front-matter** |

---

## 7. Open Questions / TBD (consolidated)

1. Exact location of the reserved "in-app docs generator requirements" section.
2. Confirm `adr/` lives under `docs/development/adr/`.
3. Whether the bot can edit MR descriptions on the chosen forge; otherwise notify-only fallback.
4. Concrete mandatory/optional matrix for the OFT trace artifact types.
5. Naming/location convention for per-ADR CI jobs and how they reference their parent ADR.
