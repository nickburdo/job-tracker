import { jobTrackerDb } from '~/lib/db/schema';
import type { JobApplication } from '~/utils/job-applications';
import type { JobApplicationStatus } from '~/utils/job-statuses';

type DemoJobApplication = {
  company: string;
  position: string;
  vacancyUrl: string;
  status: JobApplicationStatus;
  source: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  location?: string;
  remoteType?: string;
  notes?: string;
  daysAgo?: number;
  nextFollowUpDaysFromNow?: number;
  nextFollowUpDaysAgo?: number;
};

type DemoDataFile = {
  jobApplications: DemoJobApplication[];
};

function resolveDaysAgo(days: number): string {
  const date = new Date();
  date.setHours(9, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function resolveDaysFromNow(days: number): string {
  const date = new Date();
  date.setHours(10, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export async function seedDemoDataIfEmpty(): Promise<void> {
  const count = await jobTrackerDb.jobApplication.count();

  if (count > 0) {
    return;
  }

  const demoData = await $fetch<DemoDataFile>('/data/demo.json');
  const now = new Date().toISOString();

  const records: JobApplication[] = demoData.jobApplications.map((entry) => ({
    id: crypto.randomUUID(),
    company: entry.company,
    position: entry.position,
    vacancyUrl: entry.vacancyUrl,
    status: entry.status,
    source: entry.source,
    salaryMin: entry.salaryMin ?? null,
    salaryMax: entry.salaryMax ?? null,
    currency: entry.currency ?? null,
    location: entry.location ?? null,
    remoteType: entry.remoteType ?? null,
    notes: entry.notes ?? null,
    appliedAt:
      entry.daysAgo !== undefined ? resolveDaysAgo(entry.daysAgo) : null,
    nextFollowUpAt:
      entry.nextFollowUpDaysFromNow !== undefined
        ? resolveDaysFromNow(entry.nextFollowUpDaysFromNow)
        : entry.nextFollowUpDaysAgo !== undefined
          ? resolveDaysAgo(entry.nextFollowUpDaysAgo)
          : null,
    createdAt: now,
    updatedAt: now,
  }));

  await jobTrackerDb.jobApplication.bulkAdd(records);
}
