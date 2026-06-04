<script setup lang="ts">
import { toDateInput, type JobApplication } from '~/utils/job-applications';

const route = useRoute();
const router = useRouter();
const id = computed(() => String(route.params.id));
const pending = ref(false);
const errorMessage = ref('');

const { data: job, error } = await useFetch<JobApplication>(
  () => `/api/jobs/${id.value}`,
);

const initialValue = computed(() => {
  if (!job.value) {
    return undefined;
  }

  return {
    company: job.value.company,
    position: job.value.position,
    vacancyUrl: job.value.vacancyUrl,
    status: job.value.status,
    source: job.value.source,
    salaryMin: job.value.salaryMin,
    salaryMax: job.value.salaryMax,
    currency: job.value.currency ?? 'USD',
    location: job.value.location ?? '',
    remoteType: job.value.remoteType ?? '',
    notes: job.value.notes ?? '',
    appliedAt: toDateInput(job.value.appliedAt),
    nextFollowUpAt: toDateInput(job.value.nextFollowUpAt),
  };
});

const updateJob = async (value: Record<string, unknown>) => {
  pending.value = true;
  errorMessage.value = '';

  try {
    await $fetch(`/api/jobs/${id.value}`, {
      method: 'PATCH',
      body: value,
    });

    await router.push(`/jobs/${id.value}`);
  } catch (updateError) {
    errorMessage.value =
      updateError instanceof Error
        ? updateError.message
        : 'Failed to update application';
  } finally {
    pending.value = false;
  }
};
</script>

<template>
  <UContainer class="py-8">
    <div class="mx-auto max-w-3xl">
      <div
        class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <h1 class="text-2xl font-semibold tracking-tight text-highlighted">
            Edit application
          </h1>
          <p class="mt-1 text-sm text-muted">
            Update status, notes, dates, and compensation details.
          </p>
        </div>

        <div class="flex gap-2">
          <UButton
            :to="`/jobs/${id}`"
            color="neutral"
            variant="outline"
            icon="i-lucide-eye"
          >
            View
          </UButton>
          <JobsDeleteJob :job-id="id" />
        </div>
      </div>

      <div
        v-if="error"
        class="rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error"
      >
        Failed to load application.
      </div>

      <div
        v-else-if="initialValue"
        class="rounded-lg border border-default bg-elevated p-5"
      >
        <JobsJobForm
          :initial-value="initialValue"
          submit-label="Save changes"
          :pending="pending"
          :error-message="errorMessage"
          @submit="updateJob"
        />
      </div>
    </div>
  </UContainer>
</template>
