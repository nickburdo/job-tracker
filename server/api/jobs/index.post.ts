export default defineEventHandler(async (event) => {
  const payload = await readBody(event)
  const data = parseJobPayload(payload)

  return prisma.jobApplication.create({
    data
  })
})
