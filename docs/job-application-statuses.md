# Job Application Statuses

Job applications use these statuses:

- `SAVED`: vacancy saved, not applied yet.
- `APPLIED`: application sent.
- `SCREENING`: recruiter or HR screening is active.
- `TECHNICAL_INTERVIEW`: technical interview stage.
- `FINAL_INTERVIEW`: final interview or late-stage loop.
- `OFFER`: offer received.
- `REJECTED`: company rejected the application or process ended negatively.
- `WITHDRAWN`: application withdrawn by the applicant.
- `ARCHIVED`: old or inactive application kept for history.

## Quick Status Change

Open an application detail page at `/jobs/:id` and use the status selector in the page header. It sends `PATCH /api/jobs/:id` with only the new `status`.

## Where Statuses Live

There are two places because statuses are both database data and UI metadata:

- Database enum: `prisma/schema.prisma`, enum `JobApplicationStatus`.
- UI labels, colors, and select options: `app/utils/job-statuses.ts`.

For normal UI changes like label text, color, or grouping, edit only `app/utils/job-statuses.ts`.

For adding, removing, or renaming a status:

1. Update enum `JobApplicationStatus` in `prisma/schema.prisma`.
2. Update `app/utils/job-statuses.ts`.
3. Update seed examples in `prisma/seed.ts` if needed.
4. Create/apply a Prisma migration.
5. Run:

```bash
npm run prisma:generate
npm run format
npm run lint
npm run build
```

The UI should import status labels/options from `app/utils/job-statuses.ts`, not define them inline in pages.
