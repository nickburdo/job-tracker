# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Node `>=24 <25` (see `.nvmrc`), npm. No environment variables are needed.

```bash
npm run dev            # dev server at http://localhost:3000
npm run build          # client-only bundle
npm run lint           # ESLint (lint:fix to autofix)
npm run typecheck      # nuxt typecheck
npm run format:check   # Prettier (format to write)
npm run demo:generate  # regenerate public/data/demo.json from scripts/generate-demo-data.mjs
```

The `dev-workflow` Claude Code plugin is enabled in `.claude/settings.json` (its config is `.claude/dev-workflow.md`); in a fresh clone, install it once with `claude plugin install dev-workflow@nickburdo-plugins --scope project`. `.claude/settings.local.json` holds personal settings and is gitignored.

There is no automated test suite; the pre-push checks are `format:check`, `lint`, `typecheck`, `build`. `typecheck` has known pre-existing errors in `UButton` `@click` handlers (`app/components/jobs/DeleteJob.vue`, `app/pages/jobs/index.vue`).

## Architecture

Nuxt 4 + Vue 3 + Nuxt UI 4 + Pinia, running **client-only** (`ssr: false`). The app is local-first: all data lives in the browser's IndexedDB via Dexie.js. There is no server API, no auth, and one dataset per browser. The former Prisma/Postgres/Supabase backend and `server/` directory were removed (see `docs/plans/step-1-local-first-plan.md`); `export.js`/`import.js` in the root are leftover Prisma scripts that no longer run.

Data layer (`app/lib/db/`):

- `schema.ts` — the Dexie database (`job-tracker`) with a single `jobApplication` table. Changing indexes requires a new `this.version(n)`.
- `repositories/jobApplicationRepository.ts` — the only place that reads/writes job applications. It plays the role the old REST API had: list (filter/search/sort/paginate in memory), meta/stats, get, create, update, delete. It validates payloads (via `validation.ts` and limits/messages in `shared/job-validation-messages.ts`), enforces unique `vacancyUrl` (normalized), and stores dates as ISO strings.
- `errors.ts` — `RepositoryError` carries `data.fieldErrors`, the same shape `app/utils/form-errors.ts` extracts to show per-field errors in `JobForm.vue`.
- `seed.ts` + `app/plugins/seed-demo-data.client.ts` — on startup, if the table is empty, fetches `public/data/demo.json` and resolves relative `daysAgo`/`daysFromNow` fixtures to real timestamps.
- `export-import.ts` — whole-table JSON export (versioned format `version: 1`) and import that **replaces** all data in a transaction; used on the `/jobs` page.

Domain definitions:

- `app/utils/job-statuses.ts` — the single source of the status enum, labels, colors, options, and `interviewStatuses` grouping (also used for the `INTERVIEWS` pseudo-filter). Status changes must also be reflected in `scripts/generate-demo-data.mjs` fixtures. Status meanings: `docs/job-application-statuses.md`.
- `app/utils/job-applications.ts` — the `JobApplication` type and formatters (dates, salary, follow-up state).
- `shared/` is imported via the `#shared/` alias.

Routes: `/` (dashboard), `/jobs` (list with filters, stat cards, export/import), `/jobs/new`, `/jobs/[id]` (detail with quick status change), `/jobs/[id]/edit`.

Project docs live in `docs/` (`project-state.md` is the handoff summary; `project-structure.md` still describes the removed Prisma/server layout).

## Development Process Rules

These rules override default behavior for this project. Follow them exactly.

### General

- Write user questions and work reports in Russian.
- Do not use screenshots to verify visual changes.

### Planning

- **Maximum decomposition.** Break work into the smallest sensible, concrete steps — in plans, in tasks, in discussion. Avoid vague or bundled items.
- **No implementation without an approved plan.** Every version/feature gets a written plan (see `docs/plans/`) before any code is written. Do not start implementation on an unapproved plan, and do not implement anything the approved plan doesn't cover.
- **Do not deviate from an approved plan during implementation.** If reality forces a deviation, stop and go back to plan revision (see below) instead of silently improvising.
- **Plans can be revised when needed** — but a revision is itself a planning change: propose it, discuss it, get it approved, then continue. Never patch an approved plan silently.

### Discussion

- **Every unclear, undocumented, or debatable point must be discussed and resolved explicitly before proceeding.** Never silently assume, guess, or pick a default on the user's behalf for anything ambiguous or consequential. Surface it and ask.
- Purely mechanical/low-stakes technical details may be proposed with a clear rationale (not silently applied) so the user can object — but genuine product/architecture decisions always require an explicit answer, not just a proposal.

### Source of truth

- `docs/` holds the living project documentation (project state, structure, statuses, etc.).
- `docs/plans/next-update.md` is the roadmap index: one section per step (`Step 1`, `Step 2`, ...) with its checklist and a link to the step's plan.
- `docs/plans/` holds one implementation plan per step (`step-1-local-first-plan.md`, ...). Decisions confirmed by the user are recorded in the plan itself (e.g. its constraints section).
- Documentation is written/updated before implementation, not after.

### Implementation Loop

- Follow the approved plan in `docs/plans/` one smallest step at a time.
- After each completed plan step, perform a code review of the change.
- After each completed plan step, update `docs/project-state.md` with the outcome.
- After each completed plan step, create a commit before starting the next step.
- Do not combine multiple plan steps into one implementation cycle.
