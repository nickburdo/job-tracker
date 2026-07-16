# Job Tracker

Small Nuxt app for tracking job applications, interview stages, offers, rejections, notes, salaries, and follow-ups.

It is fully client-side and local-first: all data lives in IndexedDB in your browser (via Dexie.js). There is no server API and no authentication — one local dataset per browser.

## Stack

- Nuxt 4 (client-only, `ssr: false`)
- Vue 3
- Nuxt UI 4
- Pinia
- Dexie.js (IndexedDB)
- TypeScript
- ESLint
- Prettier

## Requirements

- Node `>=24 <25`
- npm

If you use `nvm`, run:

```bash
nvm use
```

The expected Node version is stored in `.nvmrc`.

## Setup

Install dependencies:

```bash
npm install
```

No environment variables are required — there is no server, database, or auth to configure.

## Development

Start the dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

On first run, the app seeds itself with demo job applications (see [Demo data](#demo-data)). Everything you create, edit, or delete afterwards is stored only in your browser's IndexedDB — clearing site data resets it back to empty.

## Checks

Format files:

```bash
npm run format
```

Check formatting:

```bash
npm run format:check
```

Lint:

```bash
npm run lint
```

Type-check:

```bash
npm run typecheck
```

Build:

```bash
npm run build
```

## Demo data

The demo dataset (`public/data/demo.json`) is generated from fixtures in `scripts/generate-demo-data.mjs`:

```bash
npm run demo:generate
```

It seeds an empty local database once, on first run (`app/lib/db/seed.ts`). Dates in the fixtures are relative (`daysAgo`/`daysFromNow`) and are resolved to real timestamps at seed time, so the demo data always looks current.

## Export / Import

The `/jobs` page has **Export JSON** and **Import JSON** buttons for the whole job applications table:

- Export downloads every local record as a single JSON file.
- Import **replaces** all local data with the contents of the chosen file, after a confirmation prompt.

## Project Structure

Detailed structure is documented in:

```text
docs/project-structure.md
```

Status meanings and how to change them are documented in:

```text
docs/job-application-statuses.md
```

The local-first migration (removal of the old Prisma/Postgres/Supabase backend) is documented in:

```text
docs/plans/step-1-local-first-plan.md
```

## Git Notes

Local/generated files are ignored:

- `.nuxt/`
- `.output/`
- `.cache/`
- `node_modules/`
- IDE metadata

Before pushing to GitHub, run:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run build
git status
```

Only source files, docs, and lockfiles should be committed.
