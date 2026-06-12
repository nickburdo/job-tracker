import { defineEventHandler } from 'h3';
import { getJobApplication } from '../../utils/job-api';
import { getRequestActor } from '../../utils/auth';
import { getJobId } from '../../utils/jobs';
import { prisma } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  const actor = await getRequestActor(event);

  return getJobApplication(prisma, getJobId(event), actor);
});
