# Job Tracker

Small Nuxt app for tracking job applications, interview stages, offers, rejections, notes, salaries, and follow-ups.

## Stack

- Nuxt 4
- Vue 3
- Nuxt UI 4
- Pinia
- Prisma 7
- SQLite
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

Create local env file:

```bash
cp .env.example .env
```

Generate Prisma client:

```bash
npm run prisma:generate
```

Create/update the local SQLite database:

```bash
npm run prisma:migrate
```

Optional demo data:

```bash
npm run prisma:seed
```

## Development

Start the dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

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

Build:

```bash
npm run build
```

## Prisma

Generate client:

```bash
npm run prisma:generate
```

Create a migration and apply it locally:

```bash
npm run prisma:migrate
```

Seed demo data:

```bash
npm run prisma:seed
```

Open Prisma Studio:

```bash
npm run prisma:studio
```

## Project Structure

Detailed structure is documented in:

```text
docs/project-structure.md
```

Status meanings and how to change them are documented in:

```text
docs/job-application-statuses.md
```

## Git Notes

Local/generated files are ignored:

- `.env`
- `dev.db`
- `generated/`
- `.nuxt/`
- `.output/`
- `node_modules/`
- IDE metadata

Before pushing to GitHub, run:

```bash
npm run format:check
npm run lint
npm run build
git status
```

Only source files, docs, migrations, and lockfiles should be committed.
