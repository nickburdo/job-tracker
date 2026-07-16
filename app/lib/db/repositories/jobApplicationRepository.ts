import { normalizeVacancyUrl } from '#shared/job-validation-messages';
import { jobTrackerDb } from '~/lib/db/schema';
import { RepositoryError } from '~/lib/db/errors';
import {
  optionalDate,
  optionalNumber,
  optionalString,
  requiredString,
} from '~/lib/db/validation';
import {
  interviewStatuses,
  jobStatusOptions,
  type JobApplicationStatus,
} from '~/utils/job-statuses';
import type {
  JobApplication,
  JobApplicationsResponse,
  JobMetaResponse,
} from '~/utils/job-applications';

const knownStatuses = new Set(jobStatusOptions.map((option) => option.value));

export type JobQuery = {
  status?: string;
  company?: string;
  search?: string;
  page?: number;
  perPage?: number;
};

function parsePositiveInteger(
  value: number | undefined,
  fallback: number,
): number {
  if (value === undefined) {
    return fallback;
  }

  return Number.isInteger(value) && value >= 1 ? value : fallback;
}

function matchesQuery(
  job: JobApplication,
  query: Pick<JobQuery, 'status' | 'company' | 'search'>,
): boolean {
  if (query.status === 'INTERVIEWS') {
    if (!interviewStatuses.has(job.status)) {
      return false;
    }
  } else if (query.status && job.status !== query.status) {
    return false;
  }

  if (
    query.company &&
    !job.company.toLowerCase().includes(query.company.toLowerCase())
  ) {
    return false;
  }

  if (query.search) {
    const needle = query.search.toLowerCase();
    const haystack = [job.company, job.position, job.source, job.notes ?? '']
      .join(' ')
      .toLowerCase();

    if (!haystack.includes(needle)) {
      return false;
    }
  }

  return true;
}

async function ensureVacancyUrlIsUnique(
  vacancyUrl: string,
  excludeId?: string,
): Promise<void> {
  const normalized = normalizeVacancyUrl(vacancyUrl);
  const all = await jobTrackerDb.jobApplication.toArray();

  const hasConflict = all.some(
    (job) =>
      job.id !== excludeId &&
      normalizeVacancyUrl(job.vacancyUrl) === normalized,
  );

  if (hasConflict) {
    throw new RepositoryError('Vacancy URL already exists', {
      vacancyUrl: 'Vacancy URL already exists',
    });
  }
}

export async function listJobApplications(
  query: JobQuery = {},
): Promise<JobApplicationsResponse> {
  if (
    query.status &&
    query.status !== 'INTERVIEWS' &&
    !knownStatuses.has(query.status as JobApplicationStatus)
  ) {
    throw new RepositoryError('Status is invalid');
  }

  const page = parsePositiveInteger(query.page, 1);
  const perPage = parsePositiveInteger(query.perPage, 20);

  const all = await jobTrackerDb.jobApplication.toArray();
  const filtered = all
    .filter((job) => matchesQuery(job, query))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const total = filtered.length;
  const start = (page - 1) * perPage;
  const items = filtered.slice(start, start + perPage);

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getJobMeta(
  query: Pick<JobQuery, 'company' | 'search'> = {},
): Promise<JobMetaResponse> {
  const all = await jobTrackerDb.jobApplication.toArray();

  const companies = Array.from(new Set(all.map((job) => job.company))).sort();
  const statuses = Array.from(new Set(all.map((job) => job.status))).sort();

  const statsSource = all.filter((job) => matchesQuery(job, query));
  const total = statsSource.length;
  const interviews = statsSource.filter((job) =>
    interviewStatuses.has(job.status),
  ).length;
  const offers = statsSource.filter((job) => job.status === 'OFFER').length;
  const rejections = statsSource.filter(
    (job) => job.status === 'REJECTED',
  ).length;
  const safeTotal = total > 0 ? total : 1;

  return {
    companies,
    statuses,
    stats: {
      total,
      interviews,
      offers,
      rejections,
      interviewRate: total > 0 ? interviews / safeTotal : 0,
      offerRate: total > 0 ? offers / safeTotal : 0,
      rejectionRate: total > 0 ? rejections / safeTotal : 0,
    },
  };
}

export async function getJobApplication(id: string): Promise<JobApplication> {
  const job = await jobTrackerDb.jobApplication.get(id);

  if (!job) {
    throw new RepositoryError('Job application not found');
  }

  return job;
}

function parseJobPayload(payload: Record<string, unknown>) {
  const salaryMin = optionalNumber(payload.salaryMin, 'salaryMin');
  const salaryMax = optionalNumber(payload.salaryMax, 'salaryMax');

  if (salaryMin !== null && salaryMax !== null && salaryMin > salaryMax) {
    throw new RepositoryError('Salary min cannot be greater than salary max', {
      salaryMin: 'Salary min cannot be greater than salary max',
      salaryMax: 'Salary max cannot be lower than salary min',
    });
  }

  const status =
    typeof payload.status === 'string' &&
    knownStatuses.has(payload.status as JobApplicationStatus)
      ? (payload.status as JobApplicationStatus)
      : 'SAVED';

  return {
    company: requiredString(payload.company, 'company'),
    position: requiredString(payload.position, 'position'),
    vacancyUrl: requiredString(payload.vacancyUrl, 'vacancyUrl'),
    status,
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
}

export async function createJobApplication(
  payload: Record<string, unknown>,
): Promise<JobApplication> {
  const data = parseJobPayload(payload);

  await ensureVacancyUrlIsUnique(data.vacancyUrl);

  const now = new Date().toISOString();
  const record: JobApplication = {
    id: crypto.randomUUID(),
    ...data,
    appliedAt: data.appliedAt?.toISOString() ?? null,
    nextFollowUpAt: data.nextFollowUpAt?.toISOString() ?? null,
    createdAt: now,
    updatedAt: now,
  };

  await jobTrackerDb.jobApplication.add(record);

  return record;
}

export async function updateJobApplication(
  id: string,
  payload: Record<string, unknown>,
): Promise<JobApplication> {
  const existing = await getJobApplication(id);
  const data = parseJobPayload({ ...existing, ...payload });

  if (data.vacancyUrl !== existing.vacancyUrl) {
    await ensureVacancyUrlIsUnique(data.vacancyUrl, id);
  }

  const updated: JobApplication = {
    ...existing,
    ...data,
    appliedAt: data.appliedAt?.toISOString() ?? null,
    nextFollowUpAt: data.nextFollowUpAt?.toISOString() ?? null,
    updatedAt: new Date().toISOString(),
  };

  await jobTrackerDb.jobApplication.put(updated);

  return updated;
}

export async function deleteJobApplication(id: string): Promise<void> {
  await getJobApplication(id);
  await jobTrackerDb.jobApplication.delete(id);
}
