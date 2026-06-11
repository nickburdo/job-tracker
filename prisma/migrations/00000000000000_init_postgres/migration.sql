-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "JobApplicationStatus" AS ENUM ('SAVED', 'APPLIED', 'SCREENING', 'TECHNICAL_INTERVIEW', 'FINAL_INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN', 'ARCHIVED');

-- CreateTable
CREATE TABLE "job_tracker_job_applications" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "vacancyUrl" TEXT NOT NULL,
    "status" "JobApplicationStatus" NOT NULL DEFAULT 'SAVED',
    "source" TEXT NOT NULL,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "currency" TEXT,
    "location" TEXT,
    "remoteType" TEXT,
    "notes" TEXT,
    "appliedAt" TIMESTAMP(3),
    "nextFollowUpAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_tracker_job_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_tracker_job_applications_vacancyUrl_key" ON "job_tracker_job_applications"("vacancyUrl");

-- CreateIndex
CREATE INDEX "job_tracker_job_applications_status_idx" ON "job_tracker_job_applications"("status");

-- CreateIndex
CREATE INDEX "job_tracker_job_applications_company_idx" ON "job_tracker_job_applications"("company");

-- CreateIndex
CREATE INDEX "job_tracker_job_applications_createdAt_idx" ON "job_tracker_job_applications"("createdAt");
