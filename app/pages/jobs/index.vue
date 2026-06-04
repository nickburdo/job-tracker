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
  createdAt: string
  updatedAt: string
}

const statusOptions = [
  {
    label: 'All statuses',
    value: ''
  },
  {
    label: 'Saved',
    value: 'SAVED'
  },
  {
    label: 'Applied',
    value: 'APPLIED'
  },
  {
    label: 'Screening',
    value: 'SCREENING'
  },
  {
    label: 'Technical Interview',
    value: 'TECHNICAL_INTERVIEW'
  },
  {
    label: 'Final Interview',
    value: 'FINAL_INTERVIEW'
  },
  {
    label: 'Offer',
    value: 'OFFER'
  },
  {
    label: 'Rejected',
    value: 'REJECTED'
  },
  {
    label: 'Archived',
    value: 'ARCHIVED'
  }
]

const search = ref('')
const selectedStatus = ref('')
const selectedCompany = ref('')

const query = computed(() => ({
  ...(search.value ? { search: search.value } : {}),
  ...(selectedStatus.value ? { status: selectedStatus.value } : {}),
  ...(selectedCompany.value ? { company: selectedCompany.value } : {})
}))

const {
  data: jobs,
  pending,
  error
} = await useFetch<JobApplication[]>('/api/jobs', {
  query
})

const jobList = computed(() => jobs.value ?? [])

const companyOptions = computed(() => [
  {
    label: 'All companies',
    value: ''
  },
  ...Array.from(new Set(jobList.value.map((job) => job.company)))
    .sort((a, b) => a.localeCompare(b))
    .map((company) => ({
      label: company,
      value: company
    }))
])

const stats = computed(() => {
  const total = jobList.value.length
  const interviews = jobList.value.filter((job) =>
    ['SCREENING', 'TECHNICAL_INTERVIEW', 'FINAL_INTERVIEW'].includes(job.status)
  ).length
  const offers = jobList.value.filter((job) => job.status === 'OFFER').length
  const rejections = jobList.value.filter(
    (job) => job.status === 'REJECTED'
  ).length

  return {
    total,
    interviews,
    offers,
    rejections
  }
})

const statusLabels: Record<JobApplicationStatus, string> = {
  SAVED: 'Saved',
  APPLIED: 'Applied',
  SCREENING: 'Screening',
  TECHNICAL_INTERVIEW: 'Technical Interview',
  FINAL_INTERVIEW: 'Final Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  ARCHIVED: 'Archived'
}

const statusColors: Record<
  JobApplicationStatus,
  'neutral' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
> = {
  SAVED: 'neutral',
  APPLIED: 'primary',
  SCREENING: 'secondary',
  TECHNICAL_INTERVIEW: 'warning',
  FINAL_INTERVIEW: 'warning',
  OFFER: 'success',
  REJECTED: 'error',
  ARCHIVED: 'neutral'
}

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

const formatSalary = (job: JobApplication) => {
  if (!job.salaryMin && !job.salaryMax) {
    return 'Salary not listed'
  }

  const currency = job.currency ?? 'USD'
  const formatter = new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  })

  if (job.salaryMin && job.salaryMax) {
    return `${formatter.format(job.salaryMin)} - ${formatter.format(job.salaryMax)}`
  }

  return formatter.format(job.salaryMin ?? job.salaryMax ?? 0)
}

const isFollowUpOverdue = (value: string | null) => {
  if (!value) {
    return false
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return new Date(value) < today
}

const formatAppliedDate = (value: string | null) => {
  if (!value) {
    return 'Applied date not set'
  }

  return `Applied ${formatDate(value)}`
}
</script>

<template>
  <main>
    <UContainer class="py-8">
      <div class="flex flex-col gap-6">
        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 class="text-2xl font-semibold tracking-tight text-highlighted">
              Applications
            </h1>
            <p class="mt-1 text-sm text-muted">
              Track active applications, interview stages, and follow-ups.
            </p>
          </div>

          <UButton to="/jobs/new" icon="i-lucide-plus">
            New application
          </UButton>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-lg border border-default bg-elevated p-4">
            <p class="text-sm text-muted">Total</p>
            <p class="mt-2 text-2xl font-semibold text-highlighted">
              {{ stats.total }}
            </p>
          </div>
          <div class="rounded-lg border border-default bg-elevated p-4">
            <p class="text-sm text-muted">Interviews</p>
            <p class="mt-2 text-2xl font-semibold text-highlighted">
              {{ stats.interviews }}
            </p>
          </div>
          <div class="rounded-lg border border-default bg-elevated p-4">
            <p class="text-sm text-muted">Offers</p>
            <p class="mt-2 text-2xl font-semibold text-highlighted">
              {{ stats.offers }}
            </p>
          </div>
          <div class="rounded-lg border border-default bg-elevated p-4">
            <p class="text-sm text-muted">Rejections</p>
            <p class="mt-2 text-2xl font-semibold text-highlighted">
              {{ stats.rejections }}
            </p>
          </div>
        </div>

        <div
          class="grid gap-3 rounded-lg border border-default bg-elevated p-4 lg:grid-cols-[1fr_220px_220px]"
        >
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Search company, position, source, notes"
          />
          <USelectMenu
            v-model="selectedStatus"
            :items="statusOptions"
            value-key="value"
          />
          <USelectMenu
            v-model="selectedCompany"
            :items="companyOptions"
            value-key="value"
          />
        </div>

        <div
          v-if="error"
          class="rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error"
        >
          Failed to load job applications.
        </div>

        <div
          v-else-if="pending"
          class="rounded-lg border border-dashed border-default bg-muted/30 p-8 text-center"
        >
          <UIcon
            name="i-lucide-loader-circle"
            class="mx-auto size-8 animate-spin text-muted"
          />
          <p class="mt-4 text-sm text-muted">Loading applications...</p>
        </div>

        <div
          v-else-if="jobList.length === 0"
          class="rounded-lg border border-dashed border-default bg-muted/30 p-8 text-center"
        >
          <UIcon name="i-lucide-database" class="mx-auto size-8 text-muted" />
          <h2 class="mt-4 text-base font-semibold text-highlighted">
            No applications found
          </h2>
          <p class="mx-auto mt-2 max-w-md text-sm text-muted">
            Change filters or run the demo seed.
          </p>
        </div>

        <div v-else class="overflow-hidden rounded-lg border border-default">
          <div
            v-for="job in jobList"
            :key="job.id"
            class="grid gap-4 border-b border-default bg-default p-4 last:border-b-0 lg:grid-cols-[1.2fr_170px_170px_160px]"
          >
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="truncate text-base font-semibold text-highlighted">
                  {{ job.position }}
                </h2>
                <UBadge :color="statusColors[job.status]" variant="subtle">
                  {{ statusLabels[job.status] }}
                </UBadge>
              </div>
              <p class="mt-1 text-sm text-muted">
                {{ job.company }} / {{ job.source }}
              </p>
              <p v-if="job.notes" class="mt-2 line-clamp-2 text-sm text-muted">
                {{ job.notes }}
              </p>
            </div>

            <div>
              <p class="text-xs font-medium uppercase text-muted">Location</p>
              <p class="mt-1 text-sm text-highlighted">
                {{ job.location ?? 'Not set' }}
              </p>
              <p class="mt-1 text-xs text-muted">
                {{ job.remoteType ?? 'Remote type not set' }}
              </p>
            </div>

            <div>
              <p class="text-xs font-medium uppercase text-muted">Salary</p>
              <p class="mt-1 text-sm text-highlighted">
                {{ formatSalary(job) }}
              </p>
            </div>

            <div>
              <div class="mb-3 flex justify-end gap-2">
                <UButton
                  :to="`/jobs/${job.id}`"
                  icon="i-lucide-eye"
                  size="xs"
                  color="neutral"
                  variant="ghost"
                >
                  View
                </UButton>
                <UButton
                  :to="`/jobs/${job.id}/edit`"
                  icon="i-lucide-pencil"
                  size="xs"
                  color="neutral"
                  variant="outline"
                >
                  Edit
                </UButton>
              </div>
              <p class="text-xs font-medium uppercase text-muted">Follow-up</p>
              <p
                class="mt-1 text-sm"
                :class="
                  isFollowUpOverdue(job.nextFollowUpAt)
                    ? 'font-medium text-error'
                    : 'text-highlighted'
                "
              >
                {{ formatDate(job.nextFollowUpAt) }}
              </p>
              <p class="mt-1 text-xs text-muted">
                {{ formatAppliedDate(job.appliedAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </UContainer>
  </main>
</template>
