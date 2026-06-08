export type JobApplicationStatus =
  | 'SAVED'
  | 'APPLIED'
  | 'SCREENING'
  | 'TECHNICAL_INTERVIEW'
  | 'FINAL_INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'ARCHIVED';

export type JobStatusColor =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error';

export const jobStatusOptions = [
  { label: 'Saved', value: 'SAVED' },
  { label: 'Applied', value: 'APPLIED' },
  { label: 'Screening', value: 'SCREENING' },
  { label: 'Technical Interview', value: 'TECHNICAL_INTERVIEW' },
  { label: 'Final Interview', value: 'FINAL_INTERVIEW' },
  { label: 'Offer', value: 'OFFER' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Withdrawn', value: 'WITHDRAWN' },
  { label: 'Archived', value: 'ARCHIVED' },
] satisfies Array<{ label: string; value: JobApplicationStatus }>;

export const interviewStatuses = new Set<JobApplicationStatus>([
  'SCREENING',
  'TECHNICAL_INTERVIEW',
  'FINAL_INTERVIEW',
]);

export const jobStatusLabels: Record<JobApplicationStatus, string> = {
  SAVED: 'Saved',
  APPLIED: 'Applied',
  SCREENING: 'Screening',
  TECHNICAL_INTERVIEW: 'Technical Interview',
  FINAL_INTERVIEW: 'Final Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
  ARCHIVED: 'Archived',
};

export const jobStatusColors: Record<JobApplicationStatus, JobStatusColor> = {
  SAVED: 'neutral',
  APPLIED: 'primary',
  SCREENING: 'secondary',
  TECHNICAL_INTERVIEW: 'warning',
  FINAL_INTERVIEW: 'warning',
  OFFER: 'success',
  REJECTED: 'error',
  WITHDRAWN: 'error',
  ARCHIVED: 'neutral',
};
