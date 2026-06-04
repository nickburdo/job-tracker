import { JobApplicationStatus } from '../../../generated/prisma/client'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const status = typeof query.status === 'string' ? query.status : undefined
  const company = typeof query.company === 'string' ? query.company : undefined
  const search = typeof query.search === 'string' ? query.search : undefined

  if (
    status &&
    !Object.values(JobApplicationStatus).includes(
      status as JobApplicationStatus
    )
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'status is invalid'
    })
  }

  return prisma.jobApplication.findMany({
    where: {
      ...(status ? { status: status as JobApplicationStatus } : {}),
      ...(company
        ? {
            company: {
              contains: company
            }
          }
        : {}),
      ...(search
        ? {
            OR: [
              {
                company: {
                  contains: search
                }
              },
              {
                position: {
                  contains: search
                }
              },
              {
                source: {
                  contains: search
                }
              },
              {
                notes: {
                  contains: search
                }
              }
            ]
          }
        : {})
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
})
