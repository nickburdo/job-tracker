import { defineEventHandler, getQuery } from 'h3';
import { getJobMeta } from '../../utils/job-api';
import { getRequestActor } from '../../utils/auth';
import { prisma } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  const query = getQuery(event) as Record<string, string>;
  const actor = await getRequestActor(event);

  return getJobMeta(prisma, {
    company: query.company,
    search: query.search,
  }, actor);
});
