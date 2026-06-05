import { defineEventHandler, readBody } from 'h3';
import { createJobApplication } from '../../utils/job-api';
import { prisma } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  return createJobApplication(prisma, await readBody(event));
});
