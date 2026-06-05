import { defineEventHandler } from 'h3';
import { getJobApplication } from '../../utils/job-api';
import { getJobId } from '../../utils/jobs';
import { prisma } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  return getJobApplication(prisma, getJobId(event));
});
