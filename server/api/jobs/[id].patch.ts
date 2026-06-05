import { defineEventHandler, readBody } from 'h3';
import { updateJobApplication } from '../../utils/job-api';
import { getJobId } from '../../utils/jobs';
import { prisma } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  return updateJobApplication(prisma, getJobId(event), await readBody(event));
});
