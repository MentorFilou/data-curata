---
order: 900
title: Development
---

## Repository root-level structure

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