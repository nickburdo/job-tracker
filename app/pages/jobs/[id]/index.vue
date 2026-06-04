<script setup lang="ts">
import {
  jobStatusColors,
  jobStatusOptions,
  type JobApplicationStatus
} from '~/utils/job-statuses'

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
  createdAt: string
  updatedAt: string
}

const route = useRoute()
const router = useRouter()
const id = computed(() => String(route.params.id))
const deletePending = ref(false)
const statusPending = ref(false)
const showDeleteConfirm = ref(false)
const errorMessage = ref('')

const { data: job, error } = await useFetch<JobApplication>(
  () => `/api/jobs/${id.value}`
)

const formatDate = (value: string | null) => {
  if (!value) {
    return 'Not set'
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value))
}

const formatSalary = (value: JobApplication) => {
  if (!value.salaryMin && !value.salaryMax) {
    return 'Salary not listed'
  }

  const formatter = new Intl.NumberFormat('en', {
    style: 'currency',
    currency: value.currency ?? 'USD',
    maximumFractionDigits: 0
  })

  if (value.salaryMin && value.salaryMax) {
    return `${formatter.format(value.salaryMin)} - ${formatter.format(value.salaryMax)}`
  }

  return formatter.format(value.salaryMin ?? value.salaryMax ?? 0)
}

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))

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

const updateStatus = async (status: JobApplicationStatus) => {
  if (!job.value || job.value.status === status) {
    return
  }

  statusPending.value = true
  errorMessage.value = ''

  try {
    const updatedJob = await $fetch<JobApplication>(`/api/jobs/${id.value}`, {
      method: 'PATCH',
      body: {
        status
      }
    })

    job.value = updatedJob
  } catch (statusError) {
    errorMessage.value =
      statusError instanceof Error
        ? statusError.message
        : 'Failed to update status'
  } finally {
    statusPending.value = false
  }
}
</script>

<template>
  <main>
    <UContainer class="py-8">
      <div class="mx-auto max-w-4xl">
        <UButton
          to="/jobs"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
          class="mb-4"
        >
          Applications
        </UButton>

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
              <h1
                class="text-2xl font-semibold tracking-tight text-highlighted"
              >
                {{ job.position }}
              </h1>
              <p class="mt-1 text-sm text-muted">
                {{ job.company }} / {{ job.source }}
              </p>
            </div>

            <div class="flex flex-col gap-2 sm:flex-row">
              <USelectMenu
                :model-value="job.status"
                :items="jobStatusOptions"
                value-key="value"
                class="w-full sm:w-56"
                :color="jobStatusColors[job.status]"
                :disabled="statusPending"
                @update:model-value="updateStatus"
              />
              <UButton
                :to="`/jobs/${job.id}/edit`"
                color="neutral"
                variant="outline"
                icon="i-lucide-pencil"
              >
                Edit
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
            v-if="errorMessage"
            class="rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error"
          >
            {{ errorMessage }}
          </div>

          <div
            v-if="showDeleteConfirm"
            class="rounded-lg border border-error/30 bg-error/10 p-4"
          >
            <h2 class="text-sm font-semibold text-error">
              Delete application?
            </h2>
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

          <div class="grid gap-4 md:grid-cols-3">
            <div class="rounded-lg border border-default bg-elevated p-4">
              <p class="text-xs font-medium uppercase text-muted">Salary</p>
              <p class="mt-2 text-sm text-highlighted">
                {{ formatSalary(job) }}
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
                {{ formatDate(job.nextFollowUpAt) }}
              </p>
              <p class="mt-1 text-xs text-muted">
                Applied {{ formatDate(job.appliedAt) }}
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
                {{ formatDateTime(job.createdAt) }}
              </p>
            </div>
            <div class="rounded-lg border border-default bg-elevated p-4">
              <p class="text-xs font-medium uppercase text-muted">Updated</p>
              <p class="mt-2 text-sm text-highlighted">
                {{ formatDateTime(job.updatedAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </UContainer>
  </main>
</template>
