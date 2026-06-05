import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  createJobApplication,
  deleteJobApplication,
  getJobApplication,
  listJobApplications,
  updateJobApplication,
} from '../server/utils/job-api';
import { parseJobPayload, parseJobUpdatePayload } from '../server/utils/jobs';

type PrismaStubOptions = {
  findManyResult?: unknown;
  findUniqueResults?: Array<unknown>;
  createResult?: unknown;
  updateResult?: unknown;
};

const buildPrismaStub = (options: PrismaStubOptions = {}) => {
  const calls = {
    findMany: [] as Array<Record<string, unknown>>,
    findUnique: [] as Array<Record<string, unknown>>,
    create: [] as Array<Record<string, unknown>>,
    update: [] as Array<Record<string, unknown>>,
    delete: [] as Array<Record<string, unknown>>,
  };

  const findUniqueResults = [...(options.findUniqueResults ?? [])];

  return {
    calls,
    prisma: {
      jobApplication: {
        findMany: async (args: Record<string, unknown>) => {
          calls.findMany.push(args);
          return options.findManyResult ?? [];
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
) => {
  try {
    await fn();
    assert.fail('Expected error to be thrown');
  } catch (error) {
    assert.equal((error as { statusCode?: number }).statusCode, statusCode);
    assert.equal((error as { statusMessage?: string }).statusMessage, statusMessage);
  }
};

test('parseJobPayload trims fields and parses dates', () => {
  const payload = parseJobPayload({
    company: '  OpenAI  ',
    position: '  Frontend Engineer ',
    vacancyUrl: ' https://example.com ',
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
    position: 'Frontend Engineer',
    vacancyUrl: 'https://example.com',
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

test('parseJobUpdatePayload rejects empty updates', () => {
  assert.throws(
    () => parseJobUpdatePayload({}),
    (error: unknown) =>
      (error as { statusCode?: number; statusMessage?: string }).statusCode ===
        400 &&
      (error as { statusMessage?: string }).statusMessage === 'No fields to update',
  );
});

test('listJobApplications applies filters and sort order', async () => {
  const { prisma, calls } = buildPrismaStub({ findManyResult: [{ id: '1' }] });

  const result = await listJobApplications(prisma, {
    status: 'APPLIED',
    company: 'OpenAI',
    search: 'frontend',
  });

  assert.deepEqual(result, [{ id: '1' }]);
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
  });
});

test('listJobApplications rejects invalid status', async () => {
  const { prisma } = buildPrismaStub();

  await expectHttpError(
    () => listJobApplications(prisma, { status: 'BROKEN' }),
    400,
    'status is invalid',
  );
});

test('createJobApplication creates parsed payload', async () => {
  const { prisma, calls } = buildPrismaStub({
    createResult: { id: 'job_1' },
  });

  const result = await createJobApplication(prisma, {
    company: 'OpenAI',
    position: 'Frontend Engineer',
    vacancyUrl: 'https://example.com',
    status: 'SAVED',
    source: 'LinkedIn',
    notes: 'Nice role',
  });

  assert.deepEqual(result, { id: 'job_1' });
  assert.equal(calls.create.length, 1);
  assert.deepEqual(calls.create[0], {
    data: {
      company: 'OpenAI',
      position: 'Frontend Engineer',
      vacancyUrl: 'https://example.com',
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
