import { jobTrackerDb } from '~/lib/db/schema';
import type { JobApplication } from '~/utils/job-applications';

export type JobApplicationsExport = {
  version: 1;
  exportedAt: string;
  data: {
    jobApplications: JobApplication[];
  };
};

export async function exportJobApplicationsData(): Promise<JobApplicationsExport> {
  const jobApplications = await jobTrackerDb.jobApplication.toArray();

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: { jobApplications },
  };
}

export function downloadJobApplicationsExport(
  exportData: JobApplicationsExport,
): void {
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `job-applications-export-${exportData.exportedAt.slice(0, 10)}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

export async function importJobApplicationsData(file: File): Promise<void> {
  const text = await file.text();
  const parsed = JSON.parse(text) as JobApplicationsExport;

  if (parsed.version !== 1 || !parsed.data?.jobApplications) {
    throw new Error('Unsupported export file format');
  }

  await jobTrackerDb.transaction(
    'rw',
    jobTrackerDb.jobApplication,
    async () => {
      await jobTrackerDb.jobApplication.clear();
      await jobTrackerDb.jobApplication.bulkAdd(parsed.data.jobApplications);
    },
  );
}
