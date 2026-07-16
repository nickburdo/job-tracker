import {
  jobValidationMessages,
  jobTextFieldLimits,
  type JobTextField,
} from '#shared/job-validation-messages';
import { RepositoryError } from '~/lib/db/errors';

const hasTextLimit = (field: string): field is JobTextField =>
  field in jobTextFieldLimits;

export function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new RepositoryError(jobValidationMessages.required(field), {
      [field]: jobValidationMessages.required(field),
    });
  }

  const trimmed = value.trim();

  if (hasTextLimit(field) && trimmed.length > jobTextFieldLimits[field]) {
    throw new RepositoryError(jobValidationMessages.maxLength(field), {
      [field]: jobValidationMessages.maxLength(field),
    });
  }

  return trimmed;
}

export function optionalString(
  value: unknown,
  field: string,
): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const trimmed = String(value).trim();

  if (hasTextLimit(field) && trimmed.length > jobTextFieldLimits[field]) {
    throw new RepositoryError(jobValidationMessages.maxLength(field), {
      [field]: jobValidationMessages.maxLength(field),
    });
  }

  return trimmed || null;
}

export function optionalNumber(value: unknown, field: string): number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = typeof value === 'number' ? value : Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new RepositoryError(jobValidationMessages.positiveInteger(field), {
      [field]: jobValidationMessages.positiveInteger(field),
    });
  }

  return parsed;
}

export function optionalDate(value: unknown, field: string): Date | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const date = new Date(value as string);

  if (Number.isNaN(date.getTime())) {
    throw new RepositoryError(jobValidationMessages.validDate(field), {
      [field]: jobValidationMessages.validDate(field),
    });
  }

  return date;
}
