<script setup lang="ts">
const router = useRouter()
const pending = ref(false)
const errorMessage = ref('')

const createJob = async (value: Record<string, unknown>) => {
  pending.value = true
  errorMessage.value = ''

  try {
    const job = await $fetch<{ id: string }>('/api/jobs', {
      method: 'POST',
      body: value
    })

    await router.push(`/jobs/${job.id}`)
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Failed to create application'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <main>
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
            :error-message="errorMessage"
            @submit="createJob"
          />
        </div>
      </div>
    </UContainer>
  </main>
</template>
