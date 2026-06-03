# Job Tracker MVP Product Plan

## Summary

Build a personal job application tracker that is practical for daily job search and polished enough for a portfolio demo. The MVP opens on a dense, searchable applications list and uses English UI copy. No authentication in v1.

## Key Product Decisions

- Primary user: one person managing their own job search.
- First screen: job applications list with search, status filter, company filter, quick status visibility, and links to create/edit/detail views.
- Statuses: fixed list from the summary: `Saved`, `Applied`, `Screening`, `Technical Interview`, `Final Interview`, `Offer`, `Rejected`, `Archived`.
- Contacts/recruiters: no separate contact model in MVP; store relevant communication details in `notes`.
- Follow-ups: one `nextFollowUpAt` date per application; show overdue/upcoming state in list and dashboard.
- Demo mode: add Prisma seed data with realistic sample applications for portfolio presentation.
- Analytics: basic stat cards only: total applications, interviews, offers, rejections, and conversion rates.

## Implementation Shape

- Use Nuxt 4, TypeScript, Pinia, Nuxt UI 4, Nitro server API, Prisma, and SQLite.
- Core model remains `JobApplication` with company, position, vacancy URL, status, source, optional salary range/currency, location, remote type, notes, applied date, follow-up date, and timestamps.
- Pages:
  - `/jobs`: main list, filters, search, stats summary.
  - `/jobs/new`: create form.
  - `/jobs/[id]`: detail view.
  - `/jobs/[id]/edit`: edit form.
- API:
  - CRUD endpoints for job applications.
  - List endpoint supports status filter, company filter, and keyword search.
  - Statistics can be computed server-side from applications for consistency.
- Empty state should support both real usage and portfolio: clear create action, and seeded data available through development setup.

## Test Plan

- CRUD: create, edit, delete, and view a job application.
- Filtering/search: by status, company, and keyword.
- Status analytics: interviews count includes screening/interview stages; offers and rejections count only their matching statuses.
- Follow-ups: overdue and upcoming dates render correctly.
- Seed: demo data loads into SQLite and produces non-empty list/stat cards.
- UI: check desktop and mobile layouts for list, form, detail, and dashboard/stat area.

## Assumptions

- MVP is single-user and local-first; no auth, roles, or multi-tenant data separation.
- English interface and fixed English status labels are acceptable for v1.
- Follow-up reminders are passive UI indicators only; no email, calendar, or notifications.
- Recruiter/contact history, AI features, imports, charts, and PostgreSQL migration remain future improvements.
