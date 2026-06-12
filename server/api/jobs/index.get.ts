import { getQuery, defineEventHandler } from 'h3';
import { listJobApplications } from '../../utils/job-api';
import { getRequestActor } from '../../utils/auth';
import { prisma } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  const actor = await getRequestActor(event);

  return listJobApplications(
    prisma,
    getQuery(event) as Record<string, string>,
    actor,
  );
});
