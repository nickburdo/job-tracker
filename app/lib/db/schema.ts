import Dexie, { type Table } from 'dexie';
import type { JobApplication } from '~/utils/job-applications';

export class JobTrackerDatabase extends Dexie {
  jobApplication!: Table<JobApplication, string>;

  constructor() {
    super('job-tracker');

    this.version(1).stores({
      jobApplication: 'id, status, company, createdAt, vacancyUrl',
    });
  }
}

export const jobTrackerDb = new JobTrackerDatabase();
