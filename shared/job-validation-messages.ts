const fieldLabels: Record<string, string> = {
  company: 'Company',
  position: 'Position',
  vacancyUrl: 'Vacancy URL',
  status: 'Status',
  source: 'Source',
  salaryMin: 'Salary min',
  salaryMax: 'Salary max',
  currency: 'Currency',
  location: 'Location',
  remoteType: 'Remote type',
  notes: 'Notes',
  appliedAt: 'Applied date',
  nextFollowUpAt: 'Next follow-up',
  id: 'Id',
};

const formatField = (field: string) => fieldLabels[field] ?? field;

export const jobTextFieldLimits = {
  company: 50,
  position: 100,
  vacancyUrl: 200,
  location: 100,
  currency: 20,
  notes: 500,
} as const;

export type JobTextField = keyof typeof jobTextFieldLimits;

export const jobValidationMessages = {
  required: (field: string) => `${formatField(field)} is required`,
  maxLength: (field: JobTextField) =>
    `${formatField(field)} must be at most ${jobTextFieldLimits[field]} characters`,
  stringExpected: (field: string) => `${formatField(field)} must be a string`,
  positiveInteger: (field: string) =>
    `${formatField(field)} must be a positive integer`,
  validDate: (field: string) => `${formatField(field)} must be a valid date`,
  isoDateString: (field: string) =>
    `${formatField(field)} must be an ISO date string`,
  invalidStatus: 'Status is invalid',
  noFieldsToUpdate: 'No fields to update',
  salaryMinTooHigh: 'Salary min cannot be greater than salary max',
  salaryMaxTooLow: 'Salary max cannot be lower than salary min',
  vacancyUrlInvalid: (field: string) =>
    `${formatField(field)} must be a valid http or https URL`,
  vacancyUrlExists: 'Vacancy URL already exists',
} as const;

export const normalizeVacancyUrl = (value: string) => value.split('?')[0];
