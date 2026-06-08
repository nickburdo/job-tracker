<script setup lang="ts">
const router = useRouter();
const toast = useToast();
const pending = ref(false);
const serverFieldErrors = ref<{ vacancyUrl?: string }>({});

const clearServerError = (field: 'vacancyUrl') => {
  if (field in serverFieldErrors.value) {
    serverFieldErrors.value = {
      ...serverFieldErrors.value,
      [field]: undefined,
    };
  }
};

const createJob = async (value: Record<string, unknown>) => {
  pending.value = true;
  serverFieldErrors.value = {};

  try {
    const job = await $fetch<{ id: string }>('/api/jobs', {
      method: 'POST',
      body: value,
    });

    toast.add({ title: 'Application created', color: 'success' });
    await router.push(`/jobs/${job.id}`);
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'statusCode' in error &&
      (error as { statusCode?: number }).statusCode === 409
    ) {
      serverFieldErrors.value = {
        vacancyUrl: 'Такая ссылка на вакансию уже есть',
      };
      return;
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create application';
    toast.add({ title: errorMessage, color: 'error' });
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
