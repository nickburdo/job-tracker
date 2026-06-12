import { defineEventHandler, readBody } from 'h3';
import { updateJobApplication } from '../../utils/job-api';
import { getRequestActor } from '../../utils/auth';
import { getJobId } from '../../utils/jobs';
import { prisma } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  const actor = await getRequestActor(event);

  return updateJobApplication(
    prisma,
    getJobId(event),
    await readBody(event),
    actor,
  );
});
