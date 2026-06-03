# Job Tracker (MVP)

## Goal

A personal web application for tracking job applications, interviews, offers, and communication with recruiters.

The project serves both as a practical tool during a job search and as a portfolio project demonstrating full-stack development skills.

---

## Technology Stack

### Frontend

- Nuxt 4
- TypeScript
- Pinia
- Nuxt UI 4

### Backend

- Nitro Server API (built into Nuxt)
- Prisma ORM

### Database

- SQLite (MVP)
- PostgreSQL (future upgrade)

---

## Core Entity

### JobApplication

```ts
{
  id: string;
  company: string;
  position: string;
  vacancyUrl: string;
  status: string;

  source: string;

  salaryMin?: number;
  salaryMax?: number;
  currency?: string;

  location?: string;
  remoteType?: string;

  notes?: string;

  appliedAt?: Date;
  nextFollowUpAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
```

---

## Application Statuses

- Saved
- Applied
- Screening
- Technical Interview
- Final Interview
- Offer
- Rejected
- Archived

---

## MVP Features

### Job Management

- Create application
- Edit application
- Delete application
- View application details

### Tracking

- Status management
- Notes
- Application date
- Follow-up reminders

### Filtering

- Filter by status
- Filter by company
- Search by keyword

### Statistics

- Total applications
- Interviews
- Offers
- Rejections
- Conversion rates

---

## Suggested Structure

```txt
app/
  pages/
    jobs/
      index.vue
      new.vue
      [id].vue
      [id]/edit.vue

  components/
    jobs/
      JobCard.vue
      JobForm.vue
      JobStatusBadge.vue

  layouts/
    default.vue

server/
  api/
    jobs/

prisma/
  schema.prisma
```

---

## Future Improvements

### AI Features

- Vacancy analysis
- Resume matching
- Cover letter generation
- Interview preparation tips

### Automation

- Import vacancy from URL
- Email tracking
- Calendar integration
- Recruiter contact management

### Analytics

- Funnel visualization
- Time-to-offer metrics
- Salary analytics
- Company statistics

---

## Development Order

1. Nuxt project setup
2. Prisma + SQLite
3. CRUD for applications
4. Status workflow
5. Filters and search
6. Dashboard and statistics
7. AI integrations
