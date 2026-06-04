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
const deletePending = ref(false)
const showDeleteConfirm = ref(false)
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

const deleteJob = async () => {
  deletePending.value = true
  errorMessage.value = ''

  try {
    await $fetch(`/api/jobs/${id.value}`, {
      method: 'DELETE'
    })

    await router.push('/jobs')
  } catch (deleteError) {
    errorMessage.value =
      deleteError instanceof Error
        ? deleteError.message
        : 'Failed to delete application'
  } finally {
    deletePending.value = false
  }
}
</script>

<template>
  <main>
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
            <UButton
              color="error"
              variant="outline"
              icon="i-lucide-trash-2"
              @click="showDeleteConfirm = true"
            >
              Delete
            </UButton>
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

        <div
          v-if="showDeleteConfirm"
          class="mt-4 rounded-lg border border-error/30 bg-error/10 p-4"
        >
          <h2 class="text-sm font-semibold text-error">Delete application?</h2>
          <p class="mt-1 text-sm text-muted">
            This removes the application permanently.
          </p>
          <div class="mt-4 flex justify-end gap-2">
            <UButton
              color="neutral"
              variant="outline"
              :disabled="deletePending"
              @click="showDeleteConfirm = false"
            >
              Cancel
            </UButton>
            <UButton
              color="error"
              icon="i-lucide-trash-2"
              :loading="deletePending"
              @click="deleteJob"
            >
              Delete
            </UButton>
          </div>
        </div>
      </div>
    </UContainer>
  </main>
</template>
