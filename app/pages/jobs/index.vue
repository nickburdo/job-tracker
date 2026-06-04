<script setup lang="ts">
import {
  interviewStatuses,
  jobStatusColors,
  jobStatusLabels,
  jobStatusOptions,
} from '~/utils/job-statuses';
import {
  formatAppliedDate,
  formatJobDate,
  formatJobSalary,
  isFollowUpOverdue,
  type JobApplication,
} from '~/utils/job-applications';

const allStatusesValue = 'ALL_STATUSES';
const allCompaniesValue = 'ALL_COMPANIES';
const statusOptions = [
  {
    label: 'All statuses',
    value: allStatusesValue,
  },
  {
    label: 'Interviews',
    value: 'INTERVIEWS',
  },
  ...jobStatusOptions,
];

const search = ref('');
const selectedStatus = ref(allStatusesValue);
const selectedCompany = ref(allCompaniesValue);

const {
  data: allJobs,
  pending,
  error,
} = await useFetch<JobApplication[]>('/api/jobs');

const normalizedSearch = computed(() => search.value.trim().toLowerCase());

const matchesSearch = (job: JobApplication) => {
  if (!normalizedSearch.value) {
    return true;
  }

  return [job.company, job.position, job.source, job.notes]
    .filter(Boolean)
    .some((value) => value?.toLowerCase().includes(normalizedSearch.value));
};

const matchesCompany = (job: JobApplication) =>
  selectedCompany.value === allCompaniesValue ||
  job.company === selectedCompany.value;

const matchesStatus = (job: JobApplication) => {
  if (selectedStatus.value === allStatusesValue) {
    return true;
  }

  if (selectedStatus.value === 'INTERVIEWS') {
    return interviewStatuses.has(job.status);
  }

  return job.status === selectedStatus.value;
};

const baseList = computed(() =>
  (allJobs.value ?? []).filter(
    (job) => matchesSearch(job) && matchesCompany(job),
  ),
);

const jobList = computed(() => baseList.value.filter(matchesStatus));

const companyOptions = computed(() => [
  {
    label: 'All companies',
    value: allCompaniesValue,
  },
  ...Array.from(new Set((allJobs.value ?? []).map((job) => job.company)))
    .sort((a, b) => a.localeCompare(b))
    .map((company) => ({
      label: company,
      value: company,
    })),
]);

const stats = computed(() => {
  const total = baseList.value.length;
  const interviews = baseList.value.filter((job) =>
    interviewStatuses.has(job.status),
  ).length;
  const offers = baseList.value.filter((job) => job.status === 'OFFER').length;
  const rejections = baseList.value.filter(
    (job) => job.status === 'REJECTED',
  ).length;

  return {
    total,
    interviews,
    offers,
    rejections,
  };
});

const statCardClass = (value: string) => [
  'rounded-lg border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
  selectedStatus.value === value
    ? 'border-primary bg-primary/10'
    : 'border-default bg-elevated hover:bg-muted',
];
</script>

<template>
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
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <button
          type="button"
          :class="statCardClass(allStatusesValue)"
          @click="selectedStatus = allStatusesValue"
        >
          <span class="block text-sm text-muted">Total</span>
          <span class="block mt-2 text-2xl font-semibold text-highlighted">
            {{ stats.total }}
          </span>
        </button>
        <button
          type="button"
          :class="statCardClass('INTERVIEWS')"
          @click="selectedStatus = 'INTERVIEWS'"
        >
          <span class="block text-sm text-muted">Interviews</span>
          <span class="block mt-2 text-2xl font-semibold text-highlighted">
            {{ stats.interviews }}
          </span>
        </button>
        <button
          type="button"
          :class="statCardClass('OFFER')"
          @click="selectedStatus = 'OFFER'"
        >
          <span class="block text-sm text-muted">Offers</span>
          <span class="block mt-2 text-2xl font-semibold text-highlighted">
            {{ stats.offers }}
          </span>
        </button>
        <button
          type="button"
          :class="statCardClass('REJECTED')"
          @click="selectedStatus = 'REJECTED'"
        >
          <span class="block text-sm text-muted">Rejections</span>
          <span class="block mt-2 text-2xl font-semibold text-highlighted">
            {{ stats.rejections }}
          </span>
        </button>
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
        <NuxtLink
          v-for="job in jobList"
          :key="job.id"
          :to="`/jobs/${job.id}`"
          class="grid gap-4 border-b border-default bg-default p-4 transition-colors last:border-b-0 hover:bg-elevated focus:outline-none focus-visible:bg-elevated lg:grid-cols-[1.2fr_170px_170px_160px]"
        >
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-4">
              <h2 class="truncate text-base font-semibold text-highlighted">
                {{ job.position }}
              </h2>
              <UBadge :color="jobStatusColors[job.status]" variant="subtle">
                {{ jobStatusLabels[job.status] }}
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
              {{ formatJobSalary(job) }}
            </p>
          </div>

          <div>
            <p class="text-xs font-medium uppercase text-muted">Follow-up</p>
            <p
              class="mt-1 text-sm"
              :class="
                isFollowUpOverdue(job.nextFollowUpAt)
                  ? 'font-medium text-error'
                  : 'text-highlighted'
              "
            >
              {{ formatJobDate(job.nextFollowUpAt) }}
            </p>
            <p class="mt-1 text-xs text-muted">
              {{ formatAppliedDate(job.appliedAt) }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </UContainer>
</template>
