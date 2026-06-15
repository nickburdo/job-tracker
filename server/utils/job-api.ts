import { createError } from 'h3';
import { JobApplicationStatus } from '~~/generated/prisma/enums';
import type { PrismaClient } from '~~/generated/prisma/client';
import {
  jobValidationMessages,
  normalizeVacancyUrl,
} from '#shared/job-validation-messages';
import { parseJobPayload, parseJobUpdatePayload } from './jobs';
import type { RequestActor } from './auth';

type PrismaJobApplicationClient = Pick<PrismaClient, 'jobApplication'>;

type JobQuery = {
  status?: string;
  company?: string;
  search?: string;
  page?: unknown;
  perPage?: unknown;
};

const validStatuses = new Set(Object.values(JobApplicationStatus));
const interviewStatuses = [
  JobApplicationStatus.SCREENING,
  JobApplicationStatus.TECHNICAL_INTERVIEW,
  JobApplicationStatus.FINAL_INTERVIEW,
];
const uniqueConstraintCode = 'P2002';

const parsePositiveInteger = (
  value: unknown,
  field: string,
  defaultValue: number,
) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue < 1) {
    throw createError({
      statusCode: 400,
      statusMessage: jobValidationMessages.positiveInteger(field),
    });
  }

  return numberValue;
};

const buildJobWhere = (
  query: Pick<JobQuery, 'status' | 'company' | 'search'>,
) => {
  const status = typeof query.status === 'string' ? query.status : undefined;
  const company = typeof query.company === 'string' ? query.company : undefined;
  const search = typeof query.search === 'string' ? query.search : undefined;

  if (
    status &&
    status !== 'INTERVIEWS' &&
    !validStatuses.has(status as JobApplicationStatus)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: jobValidationMessages.invalidStatus,
    });
  }

  return {
    ...(status === 'INTERVIEWS'
      ? {
          status: {
            in: interviewStatuses,
          },
        }
      : status
        ? { status: status as JobApplicationStatus }
        : {}),
    ...(company
      ? {
          company: {
            contains: company,
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            {
              company: {
                contains: search,
              },
            },
            {
              position: {
                contains: search,
              },
            },
            {
              source: {
                contains: search,
              },
            },
            {
              notes: {
                contains: search,
              },
            },
          ],
        }
      : {}),
  };
};

const buildActorWhere = (actor?: RequestActor) =>
  actor?.isAdmin ? { isDemo: false } : { isDemo: true };

const normalizeJobWriteData = <T extends Record<string, unknown>>(
  data: T,
  actor?: RequestActor,
) => ({
  ...data,
  isDemo: !actor?.isAdmin,
});

const isUniqueConstraintError = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code?: string }).code === uniqueConstraintCode;

const throwVacancyUrlConflict = () => {
  throw createError({
    statusCode: 422,
    message: jobValidationMessages.vacancyUrlExists,
    data: {
      fieldErrors: {
        vacancyUrl: jobValidationMessages.vacancyUrlExists,
      },
    },
  });
};

const ensureVacancyUrlIsUnique = async (
  prisma: PrismaJobApplicationClient,
  vacancyUrl: string,
  excludeId?: string,
) => {
  const normalizedVacancyUrl = normalizeVacancyUrl(vacancyUrl);
  const existingJobs = (await prisma.jobApplication.findMany({
    where: {
      vacancyUrl: {
        startsWith: normalizedVacancyUrl,
      },
    },
    select: {
      id: true,
      vacancyUrl: true,
    },
  })) as Array<{ id?: string; vacancyUrl?: string }>;

  const hasConflict = existingJobs.some((existingJob) => {
    const existingId = existingJob.id as string | undefined;
    const existingVacancyUrl = existingJob.vacancyUrl as string | undefined;

    if (!existingVacancyUrl) {
      return false;
    }

    return (
      normalizeVacancyUrl(existingVacancyUrl) === normalizedVacancyUrl &&
      (!excludeId || existingId !== excludeId)
    );
  });

  if (hasConflict) {
    throwVacancyUrlConflict();
  }
};

export const listJobApplications = (
  prisma: PrismaJobApplicationClient,
  query: JobQuery,
  actor?: RequestActor,
) => {
  const page = parsePositiveInteger(query.page, 'page', 1);
  const perPage = parsePositiveInteger(query.perPage, 'perPage', 20);
  const where = {
    ...buildActorWhere(actor),
    ...buildJobWhere(query),
  };

  return Promise.all([
    prisma.jobApplication.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.jobApplication.count({
      where,
    }),
  ]).then(([items, total]) => ({
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  }));
};

export const getJobMeta = async (
  prisma: PrismaJobApplicationClient,
  query: Pick<JobQuery, 'company' | 'search'> = {},
  actor?: RequestActor,
) => {
  const actorWhere = buildActorWhere(actor);
  const statsWhere = {
    ...actorWhere,
    ...buildJobWhere(query),
  };

  const [companies, statuses, stats] = await Promise.all([
    prisma.jobApplication.findMany({
      where: actorWhere,
      distinct: ['company'],
      select: {
        company: true,
      },
      orderBy: {
        company: 'asc',
      },
    }),
    prisma.jobApplication.findMany({
      where: actorWhere,
      distinct: ['status'],
      select: {
        status: true,
      },
      orderBy: {
        status: 'asc',
      },
    }),
    prisma.jobApplication.groupBy({
      by: ['status'],
      where: statsWhere,
      _count: {
        _all: true,
      },
    }),
  ]);

  const typedCompanies = companies as Array<{ company: string }>;
  const typedStatuses = statuses as Array<{ status: JobApplicationStatus }>;
  const typedStats = stats as Array<{
    status: JobApplicationStatus;
    _count: { _all: number };
  }>;

  const countByStatus = new Map(
    typedStats.map((row) => [row.status, row._count._all]),
  );
  const total = Array.from(countByStatus.values()).reduce(
    (sum, value) => sum + value,
    0,
  );

  const interviews = interviewStatuses.reduce(
    (sum, status) => sum + (countByStatus.get(status) ?? 0),
    0,
  );
  const safeTotal = total > 0 ? total : 1;

  return {
    companies: typedCompanies.map((row) => row.company),
    statuses: typedStatuses.map((row) => row.status),
    stats: {
      total,
      interviews,
      offers: countByStatus.get(JobApplicationStatus.OFFER) ?? 0,
      rejections: countByStatus.get(JobApplicationStatus.REJECTED) ?? 0,
      interviewRate: total > 0 ? interviews / safeTotal : 0,
      offerRate:
        total > 0
          ? (countByStatus.get(JobApplicationStatus.OFFER) ?? 0) / safeTotal
          : 0,
      rejectionRate:
        total > 0
          ? (countByStatus.get(JobApplicationStatus.REJECTED) ?? 0) / safeTotal
          : 0,
    },
  };
};

export const createJobApplication = (
  prisma: PrismaJobApplicationClient,
  payload: Record<string, unknown>,
  actor?: RequestActor,
) => {
  const data = parseJobPayload(payload);
  const normalizedData = normalizeJobWriteData(data, actor);

  return ensureVacancyUrlIsUnique(prisma, data.vacancyUrl)
    .then(() =>
      prisma.jobApplication.create({
        data: normalizedData,
      }),
    )
    .catch((error) => {
      if (isUniqueConstraintError(error)) {
        throwVacancyUrlConflict();
      }

      throw error;
    });
};

export const getJobApplication = async (
  prisma: PrismaJobApplicationClient,
  id: string,
  _actor?: RequestActor,
) => {
  const job = await prisma.jobApplication.findUnique({
    where: {
      id,
    },
  });

  if (!job) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Job application not found',
    });
  }

  return job;
};

export const updateJobApplication = async (
  prisma: PrismaJobApplicationClient,
  id: string,
  payload: Record<string, unknown>,
  actor?: RequestActor,
) => {
  const data = parseJobUpdatePayload(payload);
  const normalizedData = normalizeJobWriteData(data, actor);

  const existingJob = await prisma.jobApplication.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
    },
  });

  if (!existingJob) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Job application not found',
    });
  }

  if (data.vacancyUrl) {
    await ensureVacancyUrlIsUnique(prisma, data.vacancyUrl, id);
  }

  try {
    return await prisma.jobApplication.update({
      where: {
        id,
      },
      data: normalizedData,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throwVacancyUrlConflict();
    }

    throw error;
  }
};

export const deleteJobApplication = async (
  prisma: PrismaJobApplicationClient,
  id: string,
  _actor?: RequestActor,
) => {
  const existingJob = await prisma.jobApplication.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
    },
  });

  if (!existingJob) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Job application not found',
    });
  }

  await prisma.jobApplication.delete({
    where: {
      id,
    },
  });

  return {
    ok: true,
  };
};
