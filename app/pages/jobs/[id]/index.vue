<script setup lang="ts">
import {
  type JobApplicationStatus,
  jobStatusColors,
  jobStatusOptions,
} from '~/utils/job-statuses';
import {
  formatJobDate,
  formatJobDateTime,
  formatJobSalary,
  withDefaultAppliedDate,
  type JobApplication,
} from '~/utils/job-applications';
import {
  getJobApplication,
  updateJobApplication,
} from '~/lib/db/repositories/jobApplicationRepository';

const route = useRoute();
const id = computed(() => String(route.params.id));
const statusPending = ref(false);
const errorMessage = ref('');

const job = ref<JobApplication>();
const error = ref<Error | null>(null);

try {
  job.value = await getJobApplication(id.value);
} catch (loadError) {
  error.value = loadError as Error;
}

const updateStatus = async (status: JobApplicationStatus) => {
  if (!job.value || job.value.status === status) {
    return;
  }

  statusPending.value = true;
  errorMessage.value = '';

  try {
    job.value = await updateJobApplication(
      id.value,
      withDefaultAppliedDate({ status, appliedAt: job.value.appliedAt }),
    );
  } catch (statusError) {
    errorMessage.value =
      statusError instanceof Error
        ? statusError.message
        : 'Failed to update status';
  } finally {
    statusPending.value = false;
  }
};
</script>

<template>
  <UContainer class="py-8">
    <div class="mx-auto max-w-4xl">
      <div class="flex justify-between items-start md:items-center">
        <UButton
          to="/jobs"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
          class="mb-4"
        >
          Applications
        </UButton>
        <div v-if="job" class="flex gap-2">
          <UButton
            :to="`/jobs/${job.id}/edit`"
            color="neutral"
            variant="outline"
            icon="i-lucide-pencil"
          >
            Edit
          </UButton>

          <JobsDeleteJob :job-id="job.id" />
        </div>
      </div>

      <div
        v-if="error"
        class="rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error"
      >
        Failed to load application.
      </div>

      <div v-else-if="job" class="flex flex-col gap-6">
        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div>
            <h1 class="text-2xl font-semibold tracking-tight text-highlighted">
              {{ job.position }}
            </h1>
            <p class="mt-1 text-sm text-muted">
              {{ job.company }} / {{ job.source }}
            </p>
          </div>

          <div class="mt-2">
            <USelectMenu
              :model-value="job.status"
              :items="jobStatusOptions"
              value-key="value"
              class="w-full sm:w-56"
              :color="jobStatusColors[job.status]"
              :disabled="statusPending"
              @update:model-value="updateStatus"
            />
          </div>
        </div>

        <div
          v-if="errorMessage"
          class="rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error"
        >
          {{ errorMessage }}
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-lg border border-default bg-elevated p-4">
            <p class="text-xs font-medium uppercase text-muted">Salary</p>
            <p class="mt-2 text-sm text-highlighted">
              {{ formatJobSalary(job) }}
            </p>
          </div>
          <div class="rounded-lg border border-default bg-elevated p-4">
            <p class="text-xs font-medium uppercase text-muted">Location</p>
            <p class="mt-2 text-sm text-highlighted">
              {{ job.location ?? 'Not set' }}
            </p>
            <p class="mt-1 text-xs text-muted">
              {{ job.remoteType ?? 'Remote type not set' }}
            </p>
          </div>
          <div class="rounded-lg border border-default bg-elevated p-4">
            <p class="text-xs font-medium uppercase text-muted">Follow-up</p>
            <p class="mt-2 text-sm text-highlighted">
              {{ formatJobDate(job.nextFollowUpAt) }}
            </p>
            <p class="mt-1 text-xs text-muted">
              Applied {{ formatJobDate(job.appliedAt) }}
            </p>
          </div>
        </div>

        <div class="rounded-lg border border-default bg-elevated p-5">
          <h2 class="text-sm font-semibold text-highlighted">Vacancy</h2>
          <a
            :href="job.vacancyUrl"
            target="_blank"
            rel="noreferrer"
            class="mt-2 block break-all text-sm text-primary hover:underline"
          >
            {{ job.vacancyUrl }}
          </a>
        </div>

        <div class="rounded-lg border border-default bg-elevated p-5">
          <h2 class="text-sm font-semibold text-highlighted">Notes</h2>
          <p class="mt-2 whitespace-pre-wrap text-sm text-muted">
            {{ job.notes || 'No notes yet.' }}
          </p>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-lg border border-default bg-elevated p-4">
            <p class="text-xs font-medium uppercase text-muted">Created</p>
            <p class="mt-2 text-sm text-highlighted">
              {{ formatJobDateTime(job.createdAt) }}
            </p>
          </div>
          <div class="rounded-lg border border-default bg-elevated p-4">
            <p class="text-xs font-medium uppercase text-muted">Updated</p>
            <p class="mt-2 text-sm text-highlighted">
              {{ formatJobDateTime(job.updatedAt) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </UContainer>
</template>
