<script setup lang="ts">
type JobApplicationStatus =
  | 'SAVED'
  | 'APPLIED'
  | 'SCREENING'
  | 'TECHNICAL_INTERVIEW'
  | 'FINAL_INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'ARCHIVED'

type JobApplication = {
  id: string
  company: string
  position: string
  vacancyUrl: string
  status: JobApplicationStatus
  source: string
  salaryMin: number | null
  salaryMax: number | null
  currency: string | null
  location: string | null
  remoteType: string | null
  notes: string | null
  appliedAt: string | null
  nextFollowUpAt: string | null
}

const route = useRoute()
const router = useRouter()
const id = computed(() => String(route.params.id))
const pending = ref(false)
const errorMessage = ref('')

const { data: job, error } = await useFetch<JobApplication>(
  () => `/api/jobs/${id.value}`
)

const toDateInput = (value: string | null) => {
  if (!value) {
    return ''
  }

  return value.slice(0, 10)
}

const initialValue = computed(() => {
  if (!job.value) {
    return undefined
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
    nextFollowUpAt: toDateInput(job.value.nextFollowUpAt)
  }
})

const updateJob = async (value: Record<string, unknown>) => {
  pending.value = true
  errorMessage.value = ''

  try {
    await $fetch(`/api/jobs/${id.value}`, {
      method: 'PATCH',
      body: value
    })

    await router.push('/jobs')
  } catch (updateError) {
    errorMessage.value =
      updateError instanceof Error
        ? updateError.message
        : 'Failed to update application'
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
            Edit application
          </h1>
          <p class="mt-1 text-sm text-muted">
            Update status, notes, dates, and compensation details.
          </p>
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
  </main>
</template>
