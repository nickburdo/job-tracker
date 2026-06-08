import { createError } from 'h3';
import { JobApplicationStatus } from '../../generated/prisma/client';
import { parseJobPayload, parseJobUpdatePayload } from './jobs';

type PrismaJobApplicationClient = {
  jobApplication: {
    findMany: (args: Record<string, unknown>) => Promise<unknown>;
    count: (args: Record<string, unknown>) => Promise<number>;
    groupBy: (args: Record<string, unknown>) => Promise<Array<Record<string, unknown>>>;
    create: (args: Record<string, unknown>) => Promise<unknown>;
    findUnique: (args: Record<string, unknown>) => Promise<unknown>;
    update: (args: Record<string, unknown>) => Promise<unknown>;
    delete: (args: Record<string, unknown>) => Promise<unknown>;
  };
};

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
      statusMessage: `${field} must be a positive integer`,
    });
  }

  return numberValue;
};

const buildJobWhere = (query: Pick<JobQuery, 'status' | 'company' | 'search'>) => {
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
      statusMessage: 'status is invalid',
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

export const listJobApplications = (
  prisma: PrismaJobApplicationClient,
  query: JobQuery,
) => {
  const page = parsePositiveInteger(query.page, 'page', 1);
  const perPage = parsePositiveInteger(query.perPage, 'perPage', 20);
  const where = buildJobWhere(query);

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
) => {
  const statsWhere = buildJobWhere(query);

  const [companies, statuses, stats] = await Promise.all([
    prisma.jobApplication.findMany({
      distinct: ['company'],
      select: {
        company: true,
      },
      orderBy: {
        company: 'asc',
      },
    }),
    prisma.jobApplication.findMany({
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

  const countByStatus = new Map(
    stats.map((row) => [
      row.status as JobApplicationStatus,
      (row._count as { _all: number })._all,
    ]),
  );
  const total = Array.from(countByStatus.values()).reduce(
    (sum, value) => sum + value,
    0,
  );

  const interviews = interviewStatuses.reduce(
    (sum, status) => sum + (countByStatus.get(status) ?? 0),
    0,
  );

  return {
    companies: companies.map((row) => row.company as string),
    statuses: statuses.map((row) => row.status as JobApplicationStatus),
    stats: {
      total,
      interviews,
      offers: countByStatus.get(JobApplicationStatus.OFFER) ?? 0,
      rejections: countByStatus.get(JobApplicationStatus.REJECTED) ?? 0,
    },
  };
};

export const createJobApplication = (
  prisma: PrismaJobApplicationClient,
  payload: Record<string, unknown>,
) => {
  const data = parseJobPayload(payload);

  return prisma.jobApplication.create({
    data,
  });
};

export const getJobApplication = async (
  prisma: PrismaJobApplicationClient,
  id: string,
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
) => {
  const data = parseJobUpdatePayload(payload);

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

  return prisma.jobApplication.update({
    where: {
      id,
    },
    data,
  });
};

export const deleteJobApplication = async (
  prisma: PrismaJobApplicationClient,
  id: string,
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
