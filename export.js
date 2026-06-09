import { PrismaClient } from './generated/prisma/client.js';
import { writeFileSync } from 'node:fs';

const prisma = new PrismaClient();

const jobs = await prisma.jobApplication.findMany();

console.log(`Found ${jobs.length} jobs`);

writeFileSync('jobs.json', JSON.stringify(jobs, null, 2));

console.log(`Exported ${jobs.length} jobs to jobs.json`);

await prisma.$disconnect();
