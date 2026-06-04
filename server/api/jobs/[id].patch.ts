export default defineEventHandler(async (event) => {
  const id = getJobId(event);
  const payload = await readBody(event);
  const data = parseJobUpdatePayload(payload);

  const existingJob = await prisma.jobApplication.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
    },
  });

  if (!existingJob) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Job application not found',
    });
  }

  return prisma.jobApplication.update({
    where: {
      id,
    },
    data,
  });
});
