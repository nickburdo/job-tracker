import { getQuery, defineEventHandler } from 'h3';
import { listJobApplications } from '../../utils/job-api';
import { prisma } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  return listJobApplications(prisma, getQuery(event) as Record<string, string>);
});
