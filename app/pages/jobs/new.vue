<script setup lang="ts">
import { handleApiFormError } from '~/utils/form-errors';
import {
  jobFormFields,
  type JobFormField,
  type JobFormServerErrors,
} from '~/utils/job-form-errors';
import { createJobApplication } from '~/lib/db/repositories/jobApplicationRepository';

const router = useRouter();
const toast = useToast();
const pending = ref(false);
const serverFieldErrors = ref<JobFormServerErrors>({});

const clearServerError = (field: keyof JobFormServerErrors) => {
  serverFieldErrors.value = {
    ...serverFieldErrors.value,
    [field]: undefined,
  };
};

const setServerError = (field: JobFormField, message: string) => {
  serverFieldErrors.value = {
    ...serverFieldErrors.value,
    [field]: message,
  };
};

const createJob = async (value: Record<string, unknown>) => {
  pending.value = true;
  serverFieldErrors.value = {};

  try {
    const job = await createJobApplication(value);

    toast.add({ title: 'Application created', color: 'success' });
    await router.push(`/jobs/${job.id}`);
  } catch (error) {
    if (
      handleApiFormError({
        error,
        fields: jobFormFields,
        setFieldError: setServerError,
        showToast: (message) => {
          toast.add({ title: message, color: 'error' });
        },
        fallbackMessage: 'Failed to create application',
      })
    ) {
      return;
    }
  } finally {
    pending.value = false;
  }
};
</script>

<template>
  <UContainer class="py-8">
    <div class="mx-auto max-w-3xl">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold tracking-tight text-highlighted">
          New application
        </h1>
        <p class="mt-1 text-sm text-muted">
          Add a job application to the tracker.
        </p>
      </div>

      <div class="rounded-lg border border-default bg-elevated p-5">
        <JobsJobForm
          submit-label="Create application"
          :pending="pending"
          :server-errors="serverFieldErrors"
          @clear-server-error="clearServerError"
          @submit="createJob"
        />
      </div>
    </div>
  </UContainer>
</template>
