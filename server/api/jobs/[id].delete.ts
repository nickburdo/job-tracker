import { defineEventHandler } from 'h3';
import { deleteJobApplication } from '../../utils/job-api';
import { getRequestActor } from '../../utils/auth';
import { getJobId } from '../../utils/jobs';
import { prisma } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  const actor = await getRequestActor(event);

  return deleteJobApplication(prisma, getJobId(event), actor);
});
