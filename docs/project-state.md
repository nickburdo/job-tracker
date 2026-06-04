# Project State

## Project Overview

Job Tracker is a Nuxt 4 application for tracking job applications end to end. It stores applications in a local SQLite database through Prisma, and the UI lets you create, edit, filter, search, inspect, update status, and delete entries.

Current stack:

- Nuxt 4
- Vue 3
- Nuxt UI 4
- Pinia
- Prisma 7
- SQLite
- TypeScript
- ESLint
- Prettier

## Completed Work

- Scaffolded the Nuxt project and moved it to Node 24.
- Added Nuxt UI, Pinia, Prisma, SQLite, ESLint, and Prettier.
- Set up local Prisma config, schema, migration, seed data, and Prisma client.
- Seeded the database with demo job applications.
- Implemented backend CRUD APIs for job applications.
- Built the list page with local filtering, search, and status/company stat filters.
- Added create, edit, detail, and delete UI flows.
- Added quick status updates directly from the detail page.
- Extracted shared job status definitions into a single frontend helper file.
- Extracted shared job application types and formatters into a single frontend helper file.
- Wrote project docs for implementation steps, status meanings, project structure, and this handoff summary.
- Rewrote `README.md` so the repository is ready for GitHub.

## Current State

- The worktree is clean.
- The app is functional and buildable.
- Main pages exist:
  - `/`
  - `/jobs`
  - `/jobs/new`
  - `/jobs/:id`
  - `/jobs/:id/edit`
- The list page filters locally after one API fetch.
- Statuses are editable from the detail page without leaving the page.
- GitHub-facing docs are in place.

## Important Decisions

- Node target is fixed to `>=24 <25`.
- SQLite is the local database backend.
- Prisma 7 is used with the generated client output in `generated/prisma`.
- UI job status labels, colors, and options live in `app/utils/job-statuses.ts`.
- Shared job application types and formatters live in `app/utils/job-applications.ts`.
- The database enum still lives in `prisma/schema.prisma`, so adding/removing statuses requires both Prisma and UI updates.
- The list page uses client-side filtering/searching so typing does not trigger loading churn.
- The status selector on the detail page replaces the duplicate badge.

## Known Issues

- There are build warnings from external dependencies during `npm run build`:
  - Tailwind sourcemap warnings
  - `@vueuse/core` `#__PURE__` comment warnings
  - Node deprecation warnings from package export mappings
    These do not fail the build.
- Status changes still require coordination across Prisma enum, frontend status helper, and seed data.
- The app currently has no automated test suite beyond format/lint/build checks.

## Next Steps

1. Add test coverage for API and critical UI behavior.
2. Decide whether status data should stay split between Prisma enum and frontend helper or be moved behind a single source of truth pattern.
3. Add deploy instructions if this is going to be published.
4. Polish any remaining UI details after manual review in the browser.
