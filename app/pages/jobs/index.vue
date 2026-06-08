<script setup lang="ts">
import { jobStatusColors, jobStatusLabels } from '~/utils/job-statuses';
import {
  formatAppliedDate,
  formatJobDate,
  isFollowUpOverdue,
  type JobApplicationsResponse,
  type JobMetaResponse,
} from '~/utils/job-applications';
import { allStatusesValue, allCompaniesValue } from '~/constants/jobs-filter';

const perPageOptions = [5, 10, 20, 50].map((value) => ({
  label: String(value),
  value,
}));

const search = ref('');
const selectedStatus = ref(allStatusesValue);
const selectedCompany = ref(allCompaniesValue);
const page = ref(1);
const perPage = ref(20);

const normalizedSearch = computed(() => search.value.trim().toLowerCase());
const selectedStatusFilter = computed(() =>
  selectedStatus.value === allStatusesValue ? undefined : selectedStatus.value,
);
const selectedCompanyFilter = computed(() =>
  selectedCompany.value === allCompaniesValue
    ? undefined
    : selectedCompany.value,
);

const listQuery = computed(() => ({
  page: page.value,
  perPage: perPage.value,
  status: selectedStatusFilter.value,
  company: selectedCompanyFilter.value,
  search: normalizedSearch.value || undefined,
}));

const {
  data: jobPage,
  pending,
  error,
  refresh,
} = await useFetch<JobApplicationsResponse>('/api/jobs', {
  query: listQuery,
});

const {
  data: jobMeta,
  pending: metaPending,
  error: metaError,
  refresh: refreshMeta,
} = await useFetch<JobMetaResponse>('/api/jobs/meta', {
  query: computed(() => ({
    company: selectedCompanyFilter.value,
    search: normalizedSearch.value || undefined,
  })),
});

const toast = useToast();
const hasShownErrorToast = ref(false);

if (import.meta.client) {
  const showErrorToast = (title: string) => {
    if (hasShownErrorToast.value) {
      return;
    }

    hasShownErrorToast.value = true;
    toast.add({
      title,
      color: 'error',
    });
  };

  watch(error, (value) => {
    if (!value) {
      hasShownErrorToast.value = false;
      return;
    }

    showErrorToast('Failed to load applications');
  });

  watch(metaError, (value) => {
    if (!value) {
      return;
    }

    showErrorToast('Failed to load application metadata');
  });
}

const jobList = computed(() => jobPage.value?.items ?? []);
const totalItems = computed(() => jobPage.value?.total ?? 0);
const totalPages = computed(() => jobPage.value?.totalPages ?? 1);
const pageStart = computed(() =>
  totalItems.value === 0 ? 0 : (page.value - 1) * perPage.value + 1,
);
const pageEnd = computed(() =>
  Math.min(page.value * perPage.value, totalItems.value),
);

watch([search, selectedStatus, selectedCompany, perPage], () => {
  page.value = 1;
});

watch(totalPages, () => {
  if (page.value > totalPages.value) {
    page.value = totalPages.value;
  }
});

const loading = computed(
  () => pending.value || (!jobPage.value && metaPending.value),
);

const refreshAll = () => Promise.all([refresh(), refreshMeta()]);
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

      <JobsStatusCards v-model="selectedStatus" :job-meta="jobMeta" />

      <JobsListFilters
        v-model:company="selectedCompany"
        v-model:status="selectedStatus"
        :job-meta="jobMeta"
      />

      <div
        v-if="loading"
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

      <div v-else class="overflow-x-auto rounded-lg border border-default">
        <NuxtLink
          v-for="job in jobList"
          :key="job.id"
          :to="`/jobs/${job.id}`"
          class="grid grid-cols-[minmax(0,1fr)_min-content] grid-rows-[auto_auto] md:grid-cols-[minmax(0,1fr)_minmax(10rem,14rem)_min-content] md:grid-rows-1 lg:grid-cols-[minmax(0,1fr)_minmax(10rem,18rem)_min-content] xl:grid-cols-[minmax(0,1fr)_minmax(10rem,24rem)_min-content] gap-4 border-b border-default bg-default p-4 transition-colors last:border-b-0 hover:bg-elevated focus:outline-none focus-visible:bg-elevated"
        >
          <div
            class="grid gap-4 col-start-1 row-start-1 grid-cols-1 sm:grid-cols-[minmax(0,1fr)_min-content] md:grid-cols-1 md:grid-rows-[max-content_max-content] lg:grid-cols-[max-content_min-content]"
          >
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-4">
                <h2 class="truncate text-base font-semibold text-highlighted">
                  {{ job.position }}
                </h2>
              </div>
              <p class="mt-1 text-sm text-muted">
                {{ job.company }} / {{ job.source }}
              </p>
              <p v-if="job.notes" class="mt-2 line-clamp-2 text-sm text-muted">
                {{ job.notes }}
              </p>
            </div>

            <div class="">
              <UBadge
                class="mt-0"
                :color="jobStatusColors[job.status]"
                variant="subtle"
              >
                {{ jobStatusLabels[job.status] }}
              </UBadge>
            </div>
          </div>

          <div
            class="grid gap-4 col-start-1 row-start-2 grid-cols-1 grid-rows-2 sm:grid-cols-2 sm:grid-rows-1 md:col-start-2 md:row-start-1 md:grid-cols-1 md:grid-rows-2 lg:grid-cols-2 lg:grid-rows-1"
          >
            <div class="">
              <p class="text-xs font-medium uppercase text-muted">Location</p>
              <p class="mt-1 text-sm text-highlighted">
                {{ job.location ?? 'Not set' }}
              </p>
              <p class="mt-1 text-xs text-muted">
                {{ job.remoteType ?? 'Remote type not set' }}
              </p>
            </div>

            <div class="">
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
          </div>

          <UIcon
            name="i-lucide-chevron-right"
            class="size-5 shrink-0 self-center justify-self-end text-muted col-start-2 row-start-1 row-span-2 md:col-start-3 md:row-start-1 md:row-span-1"
          />
        </NuxtLink>
      </div>

      <div
        class="flex flex-col gap-3 rounded-lg border border-default bg-elevated p-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <div class="text-sm text-muted">
          <span v-if="totalItems === 0">No applications to show.</span>
          <span v-else>
            Showing {{ pageStart }}-{{ pageEnd }} of {{ totalItems }}
          </span>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <USelectMenu
            v-model="perPage"
            :items="perPageOptions"
            value-key="value"
          />
          <div class="flex items-center gap-2">
            <UButton
              color="neutral"
              variant="outline"
              icon="i-lucide-chevron-left"
              :disabled="page === 1 || totalItems === 0"
              @click="page -= 1"
            >
              Prev
            </UButton>
            <span class="min-w-24 text-center text-sm text-muted">
              Page {{ page }} of {{ totalPages }}
            </span>
            <UButton
              color="neutral"
              variant="outline"
              icon="i-lucide-chevron-right"
              :trailing="true"
              :disabled="page >= totalPages || totalItems === 0"
              @click="page += 1"
            >
              Next
            </UButton>
          </div>
        </div>
      </div>

      <div v-if="error || metaError" class="flex justify-end">
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-refresh-cw"
          @click="refreshAll()"
        >
          Retry load
        </UButton>
      </div>
    </div>
  </UContainer>
</template>
