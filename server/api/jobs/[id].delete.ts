import { defineEventHandler } from 'h3';
import { deleteJobApplication } from '../../utils/job-api';
import { getJobId } from '../../utils/jobs';
import { prisma } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  return deleteJobApplication(prisma, getJobId(event));
});
