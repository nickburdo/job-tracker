import { createError } from 'h3';
import { JobApplicationStatus } from '../../generated/prisma/client';
import { parseJobPayload, parseJobUpdatePayload } from './jobs';

type PrismaJobApplicationClient = {
  jobApplication: {
    findMany: (args: Record<string, unknown>) => Promise<unknown>;
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
};

const validStatuses = new Set(Object.values(JobApplicationStatus));

export const listJobApplications = (
  prisma: PrismaJobApplicationClient,
  query: JobQuery,
) => {
  const status = typeof query.status === 'string' ? query.status : undefined;
  const company = typeof query.company === 'string' ? query.company : undefined;
  const search = typeof query.search === 'string' ? query.search : undefined;

  if (status && !validStatuses.has(status as JobApplicationStatus)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'status is invalid',
    });
  }

  return prisma.jobApplication.findMany({
    where: {
      ...(status ? { status: status as JobApplicationStatus } : {}),
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
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
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
