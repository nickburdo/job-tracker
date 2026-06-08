import type { JobApplicationStatus } from '~/utils/job-statuses';

export type JobApplication = {
  id: string;
  company: string;
  position: string;
  vacancyUrl: string;
  status: JobApplicationStatus;
  source: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  location: string | null;
  remoteType: string | null;
  notes: string | null;
  appliedAt: string | null;
  nextFollowUpAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type JobApplicationsResponse = {
  items: JobApplication[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export type JobMetaResponse = {
  companies: string[];
  statuses: JobApplicationStatus[];
  stats: {
    total: number;
    interviews: number;
    offers: number;
    rejections: number;
  };
};

export const formatJobDate = (value: string | null) => {
  if (!value) {
    return 'Not set';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
};

export const formatJobDateTime = (value: string) =>
  new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

export const formatJobSalary = (job: JobApplication) => {
  if (!job.salaryMin && !job.salaryMax) {
    return 'Salary not listed';
  }

  const formatter = new Intl.NumberFormat('en', {
    style: 'currency',
    currency: job.currency ?? 'USD',
    maximumFractionDigits: 0,
  });

  if (job.salaryMin && job.salaryMax) {
    return `${formatter.format(job.salaryMin)} - ${formatter.format(job.salaryMax)}`;
  }

  return formatter.format(job.salaryMin ?? job.salaryMax ?? 0);
};

export const isFollowUpOverdue = (value: string | null) => {
  if (!value) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return new Date(value) < today;
};

export const formatAppliedDate = (value: string | null) => {
  if (!value) {
    return 'Applied date not set';
  }

  return `Applied ${formatJobDate(value)}`;
};

export const toDateInput = (value: string | null) => {
  if (!value) {
    return '';
  }

  return value.slice(0, 10);
};
