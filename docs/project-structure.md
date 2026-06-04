# Project Structure

This document describes the current project layout and the purpose of each tracked folder and file.

## Root

- `.env.example`: example environment variables. Currently contains `DATABASE_URL` for local SQLite.
- `.gitignore`: excludes generated files, local database files, dependencies, IDE files, env files, and local agent rules.
- `.nvmrc`: Node version hint. Project targets Node 24.
- `.prettierignore`: files and folders ignored by Prettier.
- `.prettierrc`: Prettier formatting rules.
- `eslint.config.mjs`: ESLint configuration generated for Nuxt.
- `nuxt.config.ts`: Nuxt app configuration. Registers Nuxt UI, Pinia, CSS, and compatibility settings.
- `package.json`: project metadata, scripts, runtime engines, dependencies, and Prisma seed config.
- `package-lock.json`: npm lockfile for reproducible installs.
- `prisma.config.ts`: Prisma 7 configuration. Loads `.env`, sets schema path, migration folder, and SQLite datasource URL.
- `README.md`: basic Nuxt project commands and setup notes.
- `tsconfig.json`: TypeScript configuration extending Nuxt-generated settings.

## `app/`

Nuxt 4 application source. Contains frontend pages, layout, components, stores, styles, and frontend utilities.

### `app/app.vue`

Root Vue app component. Wraps the app in `NuxtLayout`.

### `app/app.config.ts`

Nuxt UI theme configuration. Defines primary and neutral color palettes.

### `app/assets/`

Static source assets processed by the build pipeline.

- `app/assets/css/main.css`: global CSS entrypoint. Imports Tailwind CSS and Nuxt UI styles.

### `app/components/`

Reusable Vue components.

- `app/components/jobs/JobForm.vue`: shared create/edit job application form. Handles local validation, required fields, salary range checks, status selection, and submit payload shaping.

### `app/layouts/`

Nuxt layouts.

- `app/layouts/default.vue`: main shell layout. Provides header, navigation, and primary app actions.

### `app/pages/`

File-based Nuxt routes.

- `app/pages/index.vue`: overview/home page with project entry actions.
- `app/pages/jobs/index.vue`: applications list page. Fetches jobs, filters/searches locally, shows stat filters, and links each row to details.
- `app/pages/jobs/new.vue`: create application page. Uses `JobsJobForm` and redirects to the new detail page after creation.
- `app/pages/jobs/[id]/index.vue`: application detail page. Shows full application data, quick status selector, edit/delete actions, and metadata.
- `app/pages/jobs/[id]/edit.vue`: edit application page. Loads an application, maps date values into input format, saves updates, and supports delete.

### `app/stores/`

Pinia stores.

- `app/stores/navigation.ts`: navigation store with primary app links.

### `app/utils/`

Frontend/shared application helpers.

- `app/utils/job-applications.ts`: shared `JobApplication` type and job formatting helpers for dates, date-times, salary, follow-up state, applied date labels, and date input conversion.
- `app/utils/job-statuses.ts`: UI-level status definitions: status type, select options, interview grouping, labels, and Nuxt UI colors.

## `server/`

Nuxt server API and backend utilities.

### `server/api/`

Nuxt server routes.

- `server/api/jobs/index.get.ts`: `GET /api/jobs`. Returns job applications with optional server-side `status`, `company`, and `search` query support.
- `server/api/jobs/index.post.ts`: `POST /api/jobs`. Creates a job application after strict payload validation.
- `server/api/jobs/[id].get.ts`: `GET /api/jobs/:id`. Returns one job application or `404`.
- `server/api/jobs/[id].patch.ts`: `PATCH /api/jobs/:id`. Partially updates a job application after validating provided fields.
- `server/api/jobs/[id].delete.ts`: `DELETE /api/jobs/:id`. Deletes one job application after existence check.

### `server/utils/`

Backend helper modules auto-imported by Nuxt server.

- `server/utils/jobs.ts`: request payload parsing and validation for create/update operations, status validation, salary/date parsing, and route id extraction.
- `server/utils/prisma.ts`: Prisma client singleton using the Better SQLite3 adapter.

## `prisma/`

Database schema, migrations, and seed data.

- `prisma/schema.prisma`: Prisma schema. Defines SQLite datasource, generated client location, `JobApplicationStatus` enum, and `JobApplication` model.
- `prisma/seed.ts`: demo seed script. Inserts representative job applications across statuses.
- `prisma/migrations/migration_lock.toml`: Prisma migration provider lock.
- `prisma/migrations/20260603163910_init/migration.sql`: initial SQLite migration creating the job application table, enum check constraint, and indexes.

## `docs/`

Project documentation.

- `docs/implementation-steps.md`: step-by-step implementation plan with rough time estimates.
- `docs/job-application-statuses.md`: status reference, meanings, quick status change behavior, and how to update statuses in code/database.
- `docs/job-tracker-mvp-plan.md`: MVP plan and stack notes.
- `docs/job-tracker-summary.md`: high-level project summary.
- `docs/project-structure.md`: this file.

## `public/`

Static files served directly by Nuxt.

- `public/favicon.ico`: browser favicon.
- `public/robots.txt`: crawler rules.

## Generated And Local Files

These are intentionally not documented file-by-file because they are generated, local, or ignored by git.

- `.nuxt/`: Nuxt development/build metadata.
- `.output/`: Nuxt production build output.
- `generated/`: generated Prisma client output.
- `node_modules/`: npm dependencies.
- `dev.db`: local SQLite database.
- `.env`: local environment variables.
- `.idea/`: local IDE metadata.
- `AGENTS.md`: local agent rules, intentionally ignored.
