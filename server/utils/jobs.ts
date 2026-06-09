import { createError, getRouterParam } from 'h3';
import { JobApplicationStatus } from '../../generated/prisma/client';
import {
  jobValidationMessages,
  jobTextFieldLimits,
  type JobTextField,
} from '../../shared/job-validation-messages';

const jobStatuses = new Set(Object.values(JobApplicationStatus));

type FieldError = {
  fieldErrors: Record<string, string>;
};

const throwFieldError = (field: string, message: string): never => {
  throw createError({
    statusCode: 422,
    message,
    data: {
      fieldErrors: {
        [field]: message,
      } satisfies FieldError['fieldErrors'],
    },
  });
};

const throwFieldErrors = (
  fieldErrors: Record<string, string>,
  statusMessage: string,
): never => {
  throw createError({
    statusCode: 422,
    message: statusMessage,
    data: {
      fieldErrors,
    },
  });
};

type JobPayload = {
  company?: unknown;
  position?: unknown;
  vacancyUrl?: unknown;
  status?: unknown;
  source?: unknown;
  salaryMin?: unknown;
  salaryMax?: unknown;
  currency?: unknown;
  location?: unknown;
  remoteType?: unknown;
  notes?: unknown;
  appliedAt?: unknown;
  nextFollowUpAt?: unknown;
};

const hasTextLimit = (field: string): field is JobTextField =>
  field in jobTextFieldLimits;

const requiredString = (value: unknown, field: string) => {
  if (typeof value !== 'string' || !value.trim()) {
    throwFieldError(field, jobValidationMessages.required(field));
  }

  const stringValue = value as string;
  const trimmed = stringValue.trim();

  if (hasTextLimit(field) && trimmed.length > jobTextFieldLimits[field]) {
    throwFieldError(field, jobValidationMessages.maxLength(field));
  }

  return trimmed;
};

const optionalString = (value: unknown, field: string) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    throwFieldError(field, jobValidationMessages.stringExpected(field));
  }

  const stringValue = value as string;
  const trimmed = stringValue.trim();

  if (hasTextLimit(field) && trimmed.length > jobTextFieldLimits[field]) {
    throwFieldError(field, jobValidationMessages.maxLength(field));
  }

  return trimmed;
};

const optionalNumber = (value: unknown, field: string) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue < 0) {
    throwFieldError(field, jobValidationMessages.positiveInteger(field));
  }

  return numberValue;
};

const optionalDate = (value: unknown, field: string) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    throwFieldError(field, jobValidationMessages.isoDateString(field));
  }

  const date = new Date(value as string);

  if (Number.isNaN(date.getTime())) {
    throwFieldError(field, jobValidationMessages.validDate(field));
  }

  return date;
};

const parseStatus = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return JobApplicationStatus.SAVED;
  }

  if (
    typeof value !== 'string' ||
    !jobStatuses.has(value as JobApplicationStatus)
  ) {
    throwFieldError('status', jobValidationMessages.invalidStatus);
  }

  return value as JobApplicationStatus;
};

const parseOptionalStatus = (value: unknown) => {
  if (
    typeof value !== 'string' ||
    !jobStatuses.has(value as JobApplicationStatus)
  ) {
    throwFieldError('status', jobValidationMessages.invalidStatus);
  }

  return value as JobApplicationStatus;
};

const hasField = (payload: JobPayload, field: keyof JobPayload) =>
  Object.prototype.hasOwnProperty.call(payload, field);

export const parseJobPayload = (payload: JobPayload) => {
  const salaryMin = optionalNumber(payload.salaryMin, 'salaryMin');
  const salaryMax = optionalNumber(payload.salaryMax, 'salaryMax');

  if (salaryMin !== null && salaryMax !== null && salaryMin > salaryMax) {
    throwFieldErrors(
      {
        salaryMin: jobValidationMessages.salaryMinTooHigh,
        salaryMax: jobValidationMessages.salaryMaxTooLow,
      },
      jobValidationMessages.salaryMinTooHigh,
    );
  }

  return {
    company: requiredString(payload.company, 'company'),
    position: requiredString(payload.position, 'position'),
    vacancyUrl: requiredString(payload.vacancyUrl, 'vacancyUrl'),
    status: parseStatus(payload.status),
    source: requiredString(payload.source, 'source'),
    salaryMin,
    salaryMax,
    currency: optionalString(payload.currency, 'currency'),
    location: optionalString(payload.location, 'location'),
    remoteType: optionalString(payload.remoteType, 'remoteType'),
    notes: optionalString(payload.notes, 'notes'),
    appliedAt: optionalDate(payload.appliedAt, 'appliedAt'),
    nextFollowUpAt: optionalDate(payload.nextFollowUpAt, 'nextFollowUpAt'),
  };
};

export const parseJobUpdatePayload = (payload: JobPayload) => {
  const data: Partial<ReturnType<typeof parseJobPayload>> = {};

  if (hasField(payload, 'company')) {
    data.company = requiredString(payload.company, 'company');
  }

  if (hasField(payload, 'position')) {
    data.position = requiredString(payload.position, 'position');
  }

  if (hasField(payload, 'vacancyUrl')) {
    data.vacancyUrl = requiredString(payload.vacancyUrl, 'vacancyUrl');
  }

  if (hasField(payload, 'status')) {
    data.status = parseOptionalStatus(payload.status);
  }

  if (hasField(payload, 'source')) {
    data.source = requiredString(payload.source, 'source');
  }

  if (hasField(payload, 'salaryMin')) {
    data.salaryMin = optionalNumber(payload.salaryMin, 'salaryMin');
  }

  if (hasField(payload, 'salaryMax')) {
    data.salaryMax = optionalNumber(payload.salaryMax, 'salaryMax');
  }

  if (
    data.salaryMin !== undefined &&
    data.salaryMax !== undefined &&
    data.salaryMin !== null &&
    data.salaryMax !== null &&
    data.salaryMin > data.salaryMax
  ) {
    throwFieldErrors(
      {
        salaryMin: 'salaryMin cannot be greater than salaryMax',
        salaryMax: 'salaryMax cannot be lower than salaryMin',
      },
      'salaryMin cannot be greater than salaryMax',
    );
  }

  if (hasField(payload, 'currency')) {
    data.currency = optionalString(payload.currency, 'currency');
  }

  if (hasField(payload, 'location')) {
    data.location = optionalString(payload.location, 'location');
  }

  if (hasField(payload, 'remoteType')) {
    data.remoteType = optionalString(payload.remoteType, 'remoteType');
  }

  if (hasField(payload, 'notes')) {
    data.notes = optionalString(payload.notes, 'notes');
  }

  if (hasField(payload, 'appliedAt')) {
    data.appliedAt = optionalDate(payload.appliedAt, 'appliedAt');
  }

  if (hasField(payload, 'nextFollowUpAt')) {
    data.nextFollowUpAt = optionalDate(
      payload.nextFollowUpAt,
      'nextFollowUpAt',
    );
  }

  if (Object.keys(data).length === 0) {
    throw createError({
      statusCode: 422,
      message: jobValidationMessages.noFieldsToUpdate,
    });
  }

  return data;
};

export const getJobId = (event: Parameters<typeof getRouterParam>[0]): string => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throwFieldError('id', jobValidationMessages.required('id'));
  }

  return id as string;
};
