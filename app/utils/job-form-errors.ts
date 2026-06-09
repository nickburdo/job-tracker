import type { FormFieldErrors } from './form-errors';

export type JobFormField =
  | 'company'
  | 'position'
  | 'vacancyUrl'
  | 'status'
  | 'source'
  | 'salaryMin'
  | 'salaryMax'
  | 'currency'
  | 'location'
  | 'remoteType'
  | 'notes'
  | 'appliedAt'
  | 'nextFollowUpAt';

export const jobFormFields = [
  'company',
  'position',
  'vacancyUrl',
  'status',
  'source',
  'salaryMin',
  'salaryMax',
  'currency',
  'location',
  'remoteType',
  'notes',
  'appliedAt',
  'nextFollowUpAt',
] as const satisfies readonly JobFormField[];

export type JobFormServerErrors = FormFieldErrors<JobFormField>;
