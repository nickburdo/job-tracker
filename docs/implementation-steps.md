# Job Tracker Implementation Steps

## Overview

Implementation will be done step by step. Each step should end with a verifiable result before moving to the next one.

Estimated total:

- Pragmatic MVP: 10-14 hours
- Realistic full MVP: 14-22 hours
- Portfolio-quality MVP: 20-28 hours

## 1. Scaffold Project

Estimate: 30-45 minutes

Result: Nuxt 4 + TypeScript project runs locally.

Includes:

- Initialize Nuxt in the current folder.
- Create the basic project structure.
- Verify `npm run dev`.
- Clean up the starter template.

## 2. UI Base and Dependencies

Estimate: 30-60 minutes

Result: Nuxt UI, Pinia, and the base layout are connected.

Includes:

- Install Nuxt UI 4.
- Connect Pinia.
- Add a shared app layout using the Nuxt 4 `app/` directory structure.
- Add basic navigation.
- Prepare the visual style for a work-focused dashboard/list UI.

## 3. Prisma + SQLite

Estimate: 45-75 minutes

Result: Database is created and the `JobApplication` model exists.

Includes:

- Install Prisma.
- Add `schema.prisma`.
- Configure SQLite datasource.
- Decide enum/status representation.
- Run the first migration.
- Set up Prisma Client.

## 4. Demo Seed

Estimate: 30-45 minutes

Result: Seed command fills the database with realistic job applications.

Includes:

- Add 10-20 demo job applications.
- Use different statuses.
- Add applied and follow-up dates.
- Add salary, location, and source examples.

## 5. Backend CRUD API

Estimate: 1.5-2.5 hours

Result: Server API can create, read, update, and delete job applications.

Includes:

- `GET /api/jobs`
- `POST /api/jobs`
- `GET /api/jobs/:id`
- `PUT` or `PATCH /api/jobs/:id`
- `DELETE /api/jobs/:id`
- Basic input validation.
- Not found and error handling.

## 6. Filters, Search, and Stats API

Estimate: 1-1.5 hours

Result: API supports filters, search, and basic statistics.

Includes:

- Filter by status.
- Filter by company.
- Keyword search.
- Total, interviews, offers, and rejections.
- Conversion rates.

## 7. Main Jobs List

Estimate: 2-3 hours

Result: `/jobs` becomes the main application screen.

Includes:

- Job applications list.
- Search input.
- Status and company filters.
- Stat cards.
- Status badges.
- Overdue and upcoming follow-up indication.
- Empty state.

## 8. Create/Edit Form

Estimate: 2-3 hours

Result: Users can create and edit a job application through the UI.

Includes:

- Reusable `JobForm`.
- Fields from the core model.
- Status select.
- Date inputs.
- Salary, location, and source fields.
- Submit, loading, and error states.

## 9. Detail Page

Estimate: 1-1.5 hours

Result: `/jobs/[id]` displays full job application details.

Includes:

- Company and position header.
- Metadata.
- Notes.
- Vacancy URL.
- Follow-up status.
- Edit and delete actions.

## 10. Delete Flow

Estimate: 30-45 minutes

Result: Deletion works carefully and cannot be triggered accidentally.

Includes:

- Confirmation modal.
- Loading state.
- Redirect after delete.
- API error handling.

## 11. Responsive Polish

Estimate: 1.5-2.5 hours

Result: The application works well on desktop and mobile.

Includes:

- Mobile layout for the list and forms.
- Spacing and typography cleanup.
- Buttons, badges, and empty states polish.
- Check that text does not break cards or tables.

## 12. Testing and Verification

Estimate: 1.5-3 hours

Result: Basic confidence that the MVP works correctly.

Includes:

- Build check.
- Lint check.
- Manual browser walkthrough.
- CRUD scenario.
- Filter and search scenario.
- Seed scenario.
- Mobile viewport check.

## 13. README / Portfolio Notes

Estimate: 45-75 minutes

Result: The project can be shown or started from scratch.

Includes:

- Install and run commands.
- Database setup.
- Seed command.
- Feature list.
- Stack description.
- Future improvements.
