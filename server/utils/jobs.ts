import { JobApplicationStatus } from '../../generated/prisma/client';

const jobStatuses = new Set(Object.values(JobApplicationStatus));

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

const requiredString = (value: unknown, field: string) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: `${field} is required`,
    });
  }

  return value.trim();
};

const optionalString = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Expected a string value',
    });
  }

  return value.trim();
};

const optionalNumber = (value: unknown, field: string) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `${field} must be a positive integer`,
    });
  }

  return numberValue;
};

const optionalDate = (value: unknown, field: string) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: `${field} must be an ISO date string`,
    });
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw createError({
      statusCode: 400,
      statusMessage: `${field} must be a valid date`,
    });
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
    throw createError({
      statusCode: 400,
      statusMessage: 'status is invalid',
    });
  }

  return value as JobApplicationStatus;
};

const parseOptionalStatus = (value: unknown) => {
  if (
    typeof value !== 'string' ||
    !jobStatuses.has(value as JobApplicationStatus)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'status is invalid',
    });
  }

  return value as JobApplicationStatus;
};

const hasField = (payload: JobPayload, field: keyof JobPayload) =>
  Object.prototype.hasOwnProperty.call(payload, field);

export const parseJobPayload = (payload: JobPayload) => {
  const salaryMin = optionalNumber(payload.salaryMin, 'salaryMin');
  const salaryMax = optionalNumber(payload.salaryMax, 'salaryMax');

  if (salaryMin !== null && salaryMax !== null && salaryMin > salaryMax) {
    throw createError({
      statusCode: 400,
      statusMessage: 'salaryMin cannot be greater than salaryMax',
    });
  }

  return {
    company: requiredString(payload.company, 'company'),
    position: requiredString(payload.position, 'position'),
    vacancyUrl: requiredString(payload.vacancyUrl, 'vacancyUrl'),
    status: parseStatus(payload.status),
    source: requiredString(payload.source, 'source'),
    salaryMin,
    salaryMax,
    currency: optionalString(payload.currency),
    location: optionalString(payload.location),
    remoteType: optionalString(payload.remoteType),
    notes: optionalString(payload.notes),
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
    throw createError({
      statusCode: 400,
      statusMessage: 'salaryMin cannot be greater than salaryMax',
    });
  }

  if (hasField(payload, 'currency')) {
    data.currency = optionalString(payload.currency);
  }

  if (hasField(payload, 'location')) {
    data.location = optionalString(payload.location);
  }

  if (hasField(payload, 'remoteType')) {
    data.remoteType = optionalString(payload.remoteType);
  }

  if (hasField(payload, 'notes')) {
    data.notes = optionalString(payload.notes);
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
      statusCode: 400,
      statusMessage: 'No fields to update',
    });
  }

  return data;
};

export const getJobId = (event: Parameters<typeof getRouterParam>[0]) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'id is required',
    });
  }

  return id;
};
