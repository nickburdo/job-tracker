import { PrismaClient } from './generated/prisma/client.js';
import { readFileSync } from 'node:fs';

const prisma = new PrismaClient();

const jobs = JSON.parse(readFileSync('jobs.json', 'utf8')).map((job) => ({
  ...job,
  createdAt: job.createdAt ? new Date(job.createdAt) : null,
  updatedAt: job.updatedAt ? new Date(job.updatedAt) : null,
}));

console.log(`Importing ${jobs.length} jobs...`);

const result = await prisma.jobApplication.createMany({
  data: jobs,
});

console.log(`Imported ${result.count} jobs`);

await prisma.$disconnect();
