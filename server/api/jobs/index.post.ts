import { defineEventHandler, readBody } from 'h3';
import { createJobApplication } from '../../utils/job-api';
import { getRequestActor } from '../../utils/auth';
import { prisma } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  const actor = await getRequestActor(event);

  return createJobApplication(prisma, await readBody(event), actor);
});
