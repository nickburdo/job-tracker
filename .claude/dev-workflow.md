---
# Language for questions, reports, plans and docs written by the dev-workflow skills and agents.
language: ru
# Branch that new task branches start from and that PRs target.
mainBranch: develop
# Branches where the hook blocks Edit/Write/NotebookEdit on project files that git does not ignore (including new files).
protectedBranches: [develop, main, master]
# Branch / task types. "code" types change app behaviour and get a plan file;
# "chore" types (tooling, docs, config) get a chat plan unless postponed.
branchTypes:
  code: [feat, fix]
  chore: [chore, docs]
# Folder for plan files, one per task.
plansDir: docs/plans
# Optional. Roadmap file with per-step checklists; omit to skip roadmap updates.
roadmapFile: docs/plans/next-update.md
# Optional. Stage plan with a done-log of finished items; omit to skip done-log updates.
doneLogFile:
# Optional. Backlog of postponed items; omit to skip backlog checks.
backlogFile: docs/plans/next-update.md
# Commands that must pass before a task is closed.
checkCommands:
  [npm run format:check, npm run lint, npm run typecheck, npm run build]
# Globs of files whose changes need a browser check; leave empty to never run one.
uiPaths: ['app/**/*.vue', 'app/**/*.css']
# Dev server used by the browser-checker agent.
devServer:
  command: npm run dev
  port: 3000
# Viewport widths (px) the browser-checker agent always checks.
viewportWidths: [390, 768, 1024, 1280]
# Level passed to the code-review skill from finish-task (low | medium | high | xhigh | max).
codeReviewLevel: medium
# When the workflow commits: manual (never; the user commits after finish-task),
# per-step (one commit after each plan task), at-end (one commit at the end of finish-task).
# The skills never push or create PRs.
commitMode: per-step
---

# Project notes for dev-workflow

- Rendering: client-only SPA (`ssr: false`). All data lives in the browser's IndexedDB (Dexie.js);
  on first start an empty database is seeded from `public/data/demo.json`, so wait for the job list to render.
- Styling: Nuxt UI 4 components and Tailwind utility classes.
- Themes: Nuxt UI color mode (light/dark).
- Backlog: the `## Backlog` section of `docs/plans/next-update.md`.
