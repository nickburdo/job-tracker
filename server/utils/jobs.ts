import { JobApplicationStatus } from '../../generated/prisma/client'

const jobStatuses = new Set(Object.values(JobApplicationStatus))

type JobPayload = {
  company?: unknown
  position?: unknown
  vacancyUrl?: unknown
  status?: unknown
  source?: unknown
  salaryMin?: unknown
  salaryMax?: unknown
  currency?: unknown
  location?: unknown
  remoteType?: unknown
  notes?: unknown
  appliedAt?: unknown
  nextFollowUpAt?: unknown
}

const requiredString = (value: unknown, field: string) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: `${field} is required`
    })
  }

  return value.trim()
}

const optionalString = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return null
  }

  if (typeof value !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Expected a string value'
    })
  }

  return value.trim()
}

const optionalNumber = (value: unknown, field: string) => {
  if (value === undefined || value === null || value === '') {
    return null
  }

  const numberValue = Number(value)

  if (!Number.isInteger(numberValue) || numberValue < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `${field} must be a positive integer`
    })
  }

  return numberValue
}

const optionalDate = (value: unknown, field: string) => {
  if (value === undefined || value === null || value === '') {
    return null
  }

  if (typeof value !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: `${field} must be an ISO date string`
    })
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    throw createError({
      statusCode: 400,
      statusMessage: `${field} must be a valid date`
    })
  }

  return date
}

const parseStatus = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return JobApplicationStatus.SAVED
  }

  if (
    typeof value !== 'string' ||
    !jobStatuses.has(value as JobApplicationStatus)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'status is invalid'
    })
  }

  return value as JobApplicationStatus
}

export const parseJobPayload = (payload: JobPayload) => {
  const salaryMin = optionalNumber(payload.salaryMin, 'salaryMin')
  const salaryMax = optionalNumber(payload.salaryMax, 'salaryMax')

  if (salaryMin !== null && salaryMax !== null && salaryMin > salaryMax) {
    throw createError({
      statusCode: 400,
      statusMessage: 'salaryMin cannot be greater than salaryMax'
    })
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
    nextFollowUpAt: optionalDate(payload.nextFollowUpAt, 'nextFollowUpAt')
  }
}

export const getJobId = (event: Parameters<typeof getRouterParam>[0]) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'id is required'
    })
  }

  return id
}
