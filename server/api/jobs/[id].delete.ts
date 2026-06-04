export default defineEventHandler(async (event) => {
  const id = getJobId(event);
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

  await prisma.jobApplication.delete({
    where: {
      id,
    },
  });

  return {
    ok: true,
  };
});
