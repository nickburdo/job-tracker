export default defineEventHandler(async (event) => {
  const id = getJobId(event);
  const job = await prisma.jobApplication.findUnique({
    where: {
      id,
    },
  });

  if (!job) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Job application not found',
    });
  }

  return job;
});
