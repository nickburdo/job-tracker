import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  createJobApplication,
  deleteJobApplication,
  getJobApplication,
  getJobMeta,
  listJobApplications,
  updateJobApplication,
} from '../server/utils/job-api';
import { parseJobPayload, parseJobUpdatePayload } from '../server/utils/jobs';
import { extractApiFormFieldErrors, handleApiFormError } from '../app/utils/form-errors';
import { jobFormFields } from '../app/utils/job-form-errors';

type PrismaStubOptions = {
  findManyResult?: unknown;
  findManyResults?: Array<unknown>;
  countResult?: number;
  groupByResult?: Array<Record<string, unknown>>;
  findFirstResults?: Array<unknown>;
  findUniqueResults?: Array<unknown>;
  createResult?: unknown;
  updateResult?: unknown;
};

const buildPrismaStub = (options: PrismaStubOptions = {}) => {
  const calls = {
    findMany: [] as Array<Record<string, unknown>>,
    count: [] as Array<Record<string, unknown>>,
    groupBy: [] as Array<Record<string, unknown>>,
    findFirst: [] as Array<Record<string, unknown>>,
    findUnique: [] as Array<Record<string, unknown>>,
    create: [] as Array<Record<string, unknown>>,
    update: [] as Array<Record<string, unknown>>,
    delete: [] as Array<Record<string, unknown>>,
  };

  const findManyResults = [...(options.findManyResults ?? [])];
  const findFirstResults = [...(options.findFirstResults ?? [])];
  const findUniqueResults = [...(options.findUniqueResults ?? [])];

  return {
    calls,
    prisma: {
      jobApplication: {
        findMany: async (args: Record<string, unknown>) => {
          calls.findMany.push(args);
          if (findManyResults.length > 0) {
            return findManyResults.shift();
          }
          return options.findManyResult ?? [];
        },
        count: async (args: Record<string, unknown>) => {
          calls.count.push(args);
          return options.countResult ?? 0;
        },
        groupBy: async (args: Record<string, unknown>) => {
          calls.groupBy.push(args);
          return options.groupByResult ?? [];
        },
        findFirst: async (args: Record<string, unknown>) => {
          calls.findFirst.push(args);
          return findFirstResults.shift() ?? null;
        },
        findUnique: async (args: Record<string, unknown>) => {
          calls.findUnique.push(args);
          return findUniqueResults.shift() ?? null;
        },
        create: async (args: Record<string, unknown>) => {
          calls.create.push(args);
          return options.createResult ?? args;
        },
        update: async (args: Record<string, unknown>) => {
          calls.update.push(args);
          return options.updateResult ?? args;
        },
        delete: async (args: Record<string, unknown>) => {
          calls.delete.push(args);
          return args;
        },
      },
    },
  };
};

const expectHttpError = async (
  fn: () => Promise<unknown> | unknown,
  statusCode: number,
  statusMessage: string,
  expectedFieldErrors?: Record<string, string>,
) => {
  try {
    await fn();
    assert.fail('Expected error to be thrown');
  } catch (error) {
    assert.equal((error as { statusCode?: number }).statusCode, statusCode);
    assert.equal(
      (error as { statusMessage?: string; message?: string }).statusMessage ??
        (error as { message?: string }).message,
      statusMessage,
    );
    if (expectedFieldErrors) {
      assert.deepEqual(
        (error as { data?: { fieldErrors?: Record<string, string> } }).data
          ?.fieldErrors,
        expectedFieldErrors,
      );
    }
  }
};

test('parseJobPayload trims fields and parses dates', () => {
  const payload = parseJobPayload({
    company: '  OpenAI  ',
    position: '  Frontend ',
    vacancyUrl: ' abc ',
    status: 'OFFER',
    source: '  LinkedIn ',
    salaryMin: '100000',
    salaryMax: 150000,
    currency: ' usd ',
    location: ' Remote ',
    remoteType: ' Hybrid ',
    notes: '  Good fit ',
    appliedAt: '2026-06-01T00:00:00.000Z',
    nextFollowUpAt: '2026-06-05T00:00:00.000Z',
  });

  assert.deepEqual(payload, {
    company: 'OpenAI',
    position: 'Frontend',
    vacancyUrl: 'abc',
    status: 'OFFER',
    source: 'LinkedIn',
    salaryMin: 100000,
    salaryMax: 150000,
    currency: 'usd',
    location: 'Remote',
    remoteType: 'Hybrid',
    notes: 'Good fit',
    appliedAt: new Date('2026-06-01T00:00:00.000Z'),
    nextFollowUpAt: new Date('2026-06-05T00:00:00.000Z'),
  });
});

test('parseJobPayload rejects text fields longer than limit', () => {
  assert.throws(
    () =>
      parseJobPayload({
        company: 'x'.repeat(51),
        position: 'Frontend',
        vacancyUrl: 'abc',
        status: 'SAVED',
        source: 'LinkedIn',
      }),
    (error: unknown) =>
      (error as { statusCode?: number; statusMessage?: string; message?: string }).statusCode ===
        422 &&
      ((error as { statusMessage?: string; message?: string }).statusMessage ??
        (error as { message?: string }).message) ===
        'Company must be at most 50 characters',
  );
});

test('createJobApplication returns field errors for invalid payload', async () => {
  const { prisma } = buildPrismaStub();

  await expectHttpError(
    () =>
      createJobApplication(prisma, {
        company: 'x'.repeat(51),
        position: 'Frontend',
        vacancyUrl: 'abc',
        status: 'SAVED',
        source: 'LinkedIn',
      }),
    422,
    'Company must be at most 50 characters',
    {
      company: 'Company must be at most 50 characters',
    },
  );
});

test('parseJobUpdatePayload rejects empty updates', () => {
  assert.throws(
    () => parseJobUpdatePayload({}),
    (error: unknown) =>
      (error as { statusCode?: number; statusMessage?: string; message?: string }).statusCode ===
        422 &&
      ((error as { statusMessage?: string; message?: string }).statusMessage ??
        (error as { message?: string }).message) ===
        'No fields to update',
  );
});

test('parseJobUpdatePayload rejects text fields longer than limit', () => {
  assert.throws(
    () =>
      parseJobUpdatePayload({
        notes: 'x'.repeat(501),
      }),
    (error: unknown) =>
      (error as { statusCode?: number; statusMessage?: string; message?: string }).statusCode ===
        422 &&
      ((error as { statusMessage?: string; message?: string }).statusMessage ??
        (error as { message?: string }).message) ===
        'Notes must be at most 500 characters',
  );
});

test('parseJobPayload rejects long vacancy URL', () => {
  assert.throws(
    () =>
      parseJobPayload({
        company: 'OpenAI',
        position: 'Frontend',
        vacancyUrl: `https://example.com/${'a'.repeat(481)}`,
        status: 'SAVED',
        source: 'LinkedIn',
      }),
    (error: unknown) =>
      (error as { statusCode?: number; statusMessage?: string; message?: string }).statusCode ===
        422 &&
      ((error as { statusMessage?: string; message?: string }).statusMessage ??
        (error as { message?: string }).message) ===
        'Vacancy URL must be at most 500 characters',
  );
});

test('extractApiFormFieldErrors reads nested API field errors', () => {
  assert.deepEqual(
    extractApiFormFieldErrors({
      statusCode: 422,
      data: {
        statusCode: 422,
        statusMessage: 'Validation failed',
        data: {
          fieldErrors: {
            vacancyUrl: 'Vacancy URL already exists',
          },
        },
      },
    }),
    {
      vacancyUrl: 'Vacancy URL already exists',
    },
  );
});

test('handleApiFormError maps field errors to matching form fields', () => {
  const serverErrors: Record<string, string> = {};
  const toastMessages: string[] = [];

  const handled = handleApiFormError({
    error: {
      statusCode: 422,
      data: {
        fieldErrors: {
          vacancyUrl: 'Ð¢Ð°ÐºÐ°Ñ ÑÑÑ‹Ð»ÐºÐ° Ð½Ð° Ð²Ð°ÐºÐ°Ð½ÑÐ¸ÑŽ ÑƒÐ¶Ðµ ÐµÑÑ‚ÑŒ',
        },
      },
    },
    fields: jobFormFields,
    setFieldError: (field, message) => {
      serverErrors[field] = message;
    },
    showToast: (message) => {
      toastMessages.push(message);
    },
  });

  assert.equal(handled, true);
  assert.deepEqual(serverErrors, {
    vacancyUrl: 'Ð¢Ð°ÐºÐ°Ñ ÑÑÑ‹Ð»ÐºÐ° Ð½Ð° Ð²Ð°ÐºÐ°Ð½ÑÐ¸ÑŽ ÑƒÐ¶Ðµ ÐµÑÑ‚ÑŒ',
  });
  assert.deepEqual(toastMessages, []);
});

test('handleApiFormError shows toast when no fields match', () => {
  const serverErrors: Record<string, string> = {};
  const toastMessages: string[] = [];

  const handled = handleApiFormError({
    error: {
      statusCode: 422,
      data: {
        fieldErrors: {
          unknownField: 'Broken',
        },
      },
    },
    fields: jobFormFields,
    setFieldError: (field, message) => {
      serverErrors[field] = message;
    },
    showToast: (message) => {
      toastMessages.push(message);
    },
  });

  assert.equal(handled, false);
  assert.deepEqual(serverErrors, {});
  assert.deepEqual(toastMessages, ['Failed to save form']);
});

test('handleApiFormError shows toast when fields are not provided', () => {
  const serverErrors: Record<string, string> = {};
  const toastMessages: string[] = [];

  const handled = handleApiFormError({
    error: {
      statusCode: 422,
      data: {
        fieldErrors: {
          vacancyUrl: 'Ð¢Ð°ÐºÐ°Ñ ÑÑÑ‹Ð»ÐºÐ° Ð½Ð° Ð²Ð°ÐºÐ°Ð½ÑÐ¸ÑŽ ÑƒÐ¶Ðµ ÐµÑÑ‚ÑŒ',
        },
      },
    },
    setFieldError: (field, message) => {
      serverErrors[field] = message;
    },
    showToast: (message) => {
      toastMessages.push(message);
    },
  });

  assert.equal(handled, false);
  assert.deepEqual(serverErrors, {});
  assert.deepEqual(toastMessages, ['Failed to save form']);
});

test('listJobApplications applies filters and sort order', async () => {
  const { prisma, calls } = buildPrismaStub({
    findManyResult: [{ id: '1' }],
    countResult: 1,
  });

  const result = await listJobApplications(prisma, {
    status: 'APPLIED',
    company: 'OpenAI',
    search: 'frontend',
  });

  assert.deepEqual(result, {
    items: [{ id: '1' }],
    total: 1,
    page: 1,
    perPage: 20,
    totalPages: 1,
  });
  assert.equal(calls.findMany.length, 1);
  assert.deepEqual(calls.findMany[0], {
    where: {
      status: 'APPLIED',
      company: {
        contains: 'OpenAI',
      },
      OR: [
        {
          company: {
            contains: 'frontend',
          },
        },
        {
          position: {
            contains: 'frontend',
          },
        },
        {
          source: {
            contains: 'frontend',
          },
        },
        {
          notes: {
            contains: 'frontend',
          },
        },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip: 0,
    take: 20,
  });
  assert.equal(calls.count.length, 1);
  assert.deepEqual(calls.count[0], {
    where: {
      status: 'APPLIED',
      company: {
        contains: 'OpenAI',
      },
      OR: [
        {
          company: {
            contains: 'frontend',
          },
        },
        {
          position: {
            contains: 'frontend',
          },
        },
        {
          source: {
            contains: 'frontend',
          },
        },
        {
          notes: {
            contains: 'frontend',
          },
        },
      ],
    },
  });
});

test('listJobApplications applies pagination params', async () => {
  const { prisma, calls } = buildPrismaStub({
    findManyResult: [{ id: '1' }],
    countResult: 31,
  });

  const result = await listJobApplications(prisma, {
    page: '2',
    perPage: '10',
  });

  assert.deepEqual(result, {
    items: [{ id: '1' }],
    total: 31,
    page: 2,
    perPage: 10,
    totalPages: 4,
  });
  assert.equal(calls.findMany.length, 1);
  assert.deepEqual(calls.findMany[0], {
    where: {},
    orderBy: {
      createdAt: 'desc',
    },
    skip: 10,
    take: 10,
  });
  assert.equal(calls.count.length, 1);
  assert.deepEqual(calls.count[0], {
    where: {},
  });
});

test('listJobApplications rejects invalid status', async () => {
  const { prisma } = buildPrismaStub();

  await expectHttpError(
    () => listJobApplications(prisma, { status: 'BROKEN' }),
    400,
    'Status is invalid',
  );
});

test('listJobApplications accepts interview group status', async () => {
  const { prisma, calls } = buildPrismaStub({
    findManyResult: [{ id: '1' }],
    countResult: 3,
  });

  const result = await listJobApplications(prisma, {
    status: 'INTERVIEWS',
  });

  assert.deepEqual(result, {
    items: [{ id: '1' }],
    total: 3,
    page: 1,
    perPage: 20,
    totalPages: 1,
  });
  assert.equal(calls.findMany.length, 1);
  assert.deepEqual(calls.findMany[0], {
    where: {
      status: {
        in: ['SCREENING', 'TECHNICAL_INTERVIEW', 'FINAL_INTERVIEW'],
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip: 0,
    take: 20,
  });
  assert.equal(calls.count.length, 1);
  assert.deepEqual(calls.count[0], {
    where: {
      status: {
        in: ['SCREENING', 'TECHNICAL_INTERVIEW', 'FINAL_INTERVIEW'],
      },
    },
  });
});

test('listJobApplications rejects invalid pagination', async () => {
  const { prisma } = buildPrismaStub();

  await expectHttpError(
    () => listJobApplications(prisma, { page: '0' }),
    400,
    'page must be a positive integer',
  );

  await expectHttpError(
    () => listJobApplications(prisma, { perPage: '0' }),
    400,
    'perPage must be a positive integer',
  );
});

test('getJobMeta returns companies, statuses and stats', async () => {
  const { prisma, calls } = buildPrismaStub({
    findManyResults: [
      [{ company: 'OpenAI' }, { company: 'Anthropic' }],
      [{ status: 'SAVED' }, { status: 'OFFER' }],
    ],
    groupByResult: [
      { status: 'SAVED', _count: { _all: 3 } },
      { status: 'SCREENING', _count: { _all: 2 } },
      { status: 'TECHNICAL_INTERVIEW', _count: { _all: 1 } },
      { status: 'OFFER', _count: { _all: 4 } },
      { status: 'REJECTED', _count: { _all: 5 } },
    ],
  });

  const result = await getJobMeta(prisma, {
    company: 'OpenAI',
    search: 'frontend',
  });

  assert.deepEqual(result, {
    companies: ['OpenAI', 'Anthropic'],
    statuses: ['SAVED', 'OFFER'],
    stats: {
      total: 15,
      interviews: 3,
      offers: 4,
      rejections: 5,
      interviewRate: 0.2,
      offerRate: 4 / 15,
      rejectionRate: 5 / 15,
    },
  });
  assert.equal(calls.findMany.length, 2);
  assert.deepEqual(calls.findMany[0], {
    distinct: ['company'],
    select: {
      company: true,
    },
    orderBy: {
      company: 'asc',
    },
  });
  assert.deepEqual(calls.findMany[1], {
    distinct: ['status'],
    select: {
      status: true,
    },
    orderBy: {
      status: 'asc',
    },
  });
  assert.equal(calls.groupBy.length, 1);
  assert.deepEqual(calls.groupBy[0], {
    by: ['status'],
    where: {
      company: {
        contains: 'OpenAI',
      },
      OR: [
        {
          company: {
            contains: 'frontend',
          },
        },
        {
          position: {
            contains: 'frontend',
          },
        },
        {
          source: {
            contains: 'frontend',
          },
        },
        {
          notes: {
            contains: 'frontend',
          },
        },
      ],
    },
    _count: {
      _all: true,
    },
  });
});

test('getJobMeta returns zero conversion rates when there are no jobs', async () => {
  const { prisma } = buildPrismaStub({
    findManyResults: [[], []],
    groupByResult: [],
  });

  const result = await getJobMeta(prisma);

  assert.deepEqual(result, {
    companies: [],
    statuses: [],
    stats: {
      total: 0,
      interviews: 0,
      offers: 0,
      rejections: 0,
      interviewRate: 0,
      offerRate: 0,
      rejectionRate: 0,
    },
  });
});

test('createJobApplication creates parsed payload', async () => {
  const { prisma, calls } = buildPrismaStub({
    createResult: { id: 'job_1' },
  });

  const result = await createJobApplication(prisma, {
    company: 'OpenAI',
    position: 'Frontend',
    vacancyUrl: 'abc',
    status: 'SAVED',
    source: 'LinkedIn',
    notes: 'Nice role',
  });

  assert.deepEqual(result, { id: 'job_1' });
  assert.equal(calls.findMany.length, 1);
  assert.equal(calls.create.length, 1);
  assert.deepEqual(calls.create[0], {
    data: {
      company: 'OpenAI',
      position: 'Frontend',
      vacancyUrl: 'abc',
      status: 'SAVED',
      source: 'LinkedIn',
      salaryMin: null,
      salaryMax: null,
      currency: null,
      location: null,
      remoteType: null,
      notes: 'Nice role',
      appliedAt: null,
      nextFollowUpAt: null,
    },
  });
});

test('createJobApplication rejects duplicate vacancy URL', async () => {
  const { prisma, calls } = buildPrismaStub({
    findManyResults: [[{ id: 'job_existing', vacancyUrl: 'abc?x=1' }]],
  });

  await expectHttpError(
    () =>
      createJobApplication(prisma, {
        company: 'OpenAI',
        position: 'Frontend',
        vacancyUrl: 'abc?y=2',
        status: 'SAVED',
        source: 'LinkedIn',
      }),
    422,
    'Vacancy URL already exists',
    {
      vacancyUrl: 'Vacancy URL already exists',
    },
  );

  assert.equal(calls.findMany.length, 1);
  assert.equal(calls.create.length, 0);
});

test('getJobApplication returns 404 when job is missing', async () => {
  const { prisma } = buildPrismaStub({ findUniqueResults: [null] });

  await expectHttpError(
    () => getJobApplication(prisma, 'missing'),
    404,
    'Job application not found',
  );
});

test('updateJobApplication updates parsed payload', async () => {
  const { prisma, calls } = buildPrismaStub({
    findUniqueResults: [{ id: 'job_1' }],
    updateResult: { id: 'job_1', status: 'OFFER' },
  });

  const result = await updateJobApplication(prisma, 'job_1', {
    status: 'OFFER',
    notes: 'Updated',
  });

  assert.deepEqual(result, { id: 'job_1', status: 'OFFER' });
  assert.equal(calls.findUnique.length, 1);
  assert.equal(calls.update.length, 1);
  assert.deepEqual(calls.update[0], {
    where: {
      id: 'job_1',
    },
    data: {
      status: 'OFFER',
      notes: 'Updated',
    },
  });
});

test('updateJobApplication rejects duplicate vacancy URL', async () => {
  const { prisma, calls } = buildPrismaStub({
    findUniqueResults: [{ id: 'job_1' }],
    findManyResults: [[{ id: 'job_other', vacancyUrl: 'abc?x=1' }]],
  });

  await expectHttpError(
    () =>
      updateJobApplication(prisma, 'job_1', {
        vacancyUrl: 'abc?y=2',
      }),
    422,
    'Vacancy URL already exists',
    {
      vacancyUrl: 'Vacancy URL already exists',
    },
  );

  assert.equal(calls.findUnique.length, 1);
  assert.equal(calls.findMany.length, 1);
  assert.equal(calls.update.length, 0);
});

test('updateJobApplication returns 404 when job is missing', async () => {
  const { prisma } = buildPrismaStub({ findUniqueResults: [null] });

  await expectHttpError(
    () => updateJobApplication(prisma, 'missing', { status: 'OFFER' }),
    404,
    'Job application not found',
  );
});

test('deleteJobApplication deletes existing job', async () => {
  const { prisma, calls } = buildPrismaStub({
    findUniqueResults: [{ id: 'job_1' }],
  });

  const result = await deleteJobApplication(prisma, 'job_1');

  assert.deepEqual(result, { ok: true });
  assert.equal(calls.findUnique.length, 1);
  assert.equal(calls.delete.length, 1);
  assert.deepEqual(calls.delete[0], {
    where: {
      id: 'job_1',
    },
  });
});

test('deleteJobApplication returns 404 when job is missing', async () => {
  const { prisma } = buildPrismaStub({ findUniqueResults: [null] });

  await expectHttpError(
    () => deleteJobApplication(prisma, 'missing'),
    404,
    'Job application not found',
  );
});

