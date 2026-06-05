<script setup lang="ts">
import {
  interviewStatuses,
  jobStatusColors,
  jobStatusLabels,
  jobStatusOptions,
  type JobApplicationStatus,
} from '~/utils/job-statuses';
import {
  formatAppliedDate,
  formatJobDate,
  isFollowUpOverdue,
  type JobApplication,
} from '~/utils/job-applications';

const { data: allJobs, pending, error, refresh } = await useFetch<
  JobApplication[]
>('/api/jobs');

const toast = useToast();
const hasShownErrorToast = ref(false);

if (import.meta.client) {
  watch(error, (value) => {
    if (!value || hasShownErrorToast.value) {
      return;
    }

    hasShownErrorToast.value = true;
    toast.add({
      title: 'Failed to load dashboard',
      color: 'error',
    });
  });
}

const jobs = computed(() => allJobs.value ?? []);
const totalJobs = computed(() => jobs.value.length);
const totalForBars = computed(() => Math.max(totalJobs.value, 1));

const overdueFollowUps = computed(() =>
  jobs.value.filter((job) => isFollowUpOverdue(job.nextFollowUpAt)),
);

const recentJobs = computed(() => jobs.value.slice(0, 5));

const followUpJobs = computed(() =>
  [...jobs.value]
    .filter((job) => job.nextFollowUpAt)
    .sort((first, second) => {
      const firstOverdue = isFollowUpOverdue(first.nextFollowUpAt);
      const secondOverdue = isFollowUpOverdue(second.nextFollowUpAt);

      if (firstOverdue === secondOverdue) {
        const firstTime = new Date(first.nextFollowUpAt ?? '').getTime();
        const secondTime = new Date(second.nextFollowUpAt ?? '').getTime();

        return firstTime - secondTime;
      }

      return firstOverdue ? -1 : 1;
    })
    .slice(0, 5),
);

const stats = computed(() => {
  const total = totalJobs.value;
  const interviews = jobs.value.filter((job) =>
    interviewStatuses.has(job.status),
  ).length;
  const offers = jobs.value.filter((job) => job.status === 'OFFER').length;
  const rejected = jobs.value.filter((job) => job.status === 'REJECTED').length;

  return {
    total,
    interviews,
    offers,
    rejected,
    overdue: overdueFollowUps.value.length,
  };
});

const statusSummary = computed(() =>
  jobStatusOptions.map((status) => {
    const count = jobs.value.filter(
      (job) => job.status === status.value,
    ).length;

    return {
      ...status,
      count,
      percent: Math.round((count / totalForBars.value) * 100),
      tone: jobStatusColors[status.value as JobApplicationStatus],
    };
  }),
);

const statusToneClass: Record<string, string> = {
  neutral: 'bg-neutral',
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
};

const statCardClass = (value: number) => [
  'rounded-lg border p-4 transition-colors',
  value > 0
    ? 'border-default bg-elevated'
    : 'border-dashed border-default bg-muted/20',
];

const formatFollowUpLabel = (value: string | null) => {
  if (!value) {
    return 'No follow-up date';
  }

  return isFollowUpOverdue(value)
    ? `Overdue since ${formatJobDate(value)}`
    : `Follow-up on ${formatJobDate(value)}`;
};
</script>

<template>
  <UContainer class="py-8">
    <div class="flex flex-col gap-8">
      <section class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-3xl">
          <p class="text-sm font-medium uppercase tracking-wide text-muted">
            Overview
          </p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl">
            Job search overview
          </h1>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">
            Track applications, interviews, and follow-ups in one place.
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <UButton to="/jobs/new" icon="i-lucide-plus">
            Add application
          </UButton>
          <UButton
            to="/jobs"
            color="neutral"
            variant="outline"
            icon="i-lucide-briefcase-business"
          >
            View applications
          </UButton>
          <UButton
            v-if="error"
            color="neutral"
            variant="ghost"
            icon="i-lucide-refresh-cw"
            @click="refresh()"
          >
            Retry load
          </UButton>
        </div>
      </section>

      <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div :class="statCardClass(stats.total)">
          <p class="text-xs font-medium uppercase tracking-wide text-muted">
            Total applications
          </p>
          <p class="mt-3 text-3xl font-semibold text-highlighted">
            {{ pending ? '-' : stats.total }}
          </p>
        </div>
        <div :class="statCardClass(stats.interviews)">
          <p class="text-xs font-medium uppercase tracking-wide text-muted">
            Active interviews
          </p>
          <p class="mt-3 text-3xl font-semibold text-highlighted">
            {{ pending ? '-' : stats.interviews }}
          </p>
        </div>
        <div :class="statCardClass(stats.offers)">
          <p class="text-xs font-medium uppercase tracking-wide text-muted">
            Offers
          </p>
          <p class="mt-3 text-3xl font-semibold text-highlighted">
            {{ pending ? '-' : stats.offers }}
          </p>
        </div>
        <div :class="statCardClass(stats.rejected)">
          <p class="text-xs font-medium uppercase tracking-wide text-muted">
            Rejected
          </p>
          <p class="mt-3 text-3xl font-semibold text-highlighted">
            {{ pending ? '-' : stats.rejected }}
          </p>
        </div>
        <div :class="statCardClass(stats.overdue)">
          <p class="text-xs font-medium uppercase tracking-wide text-muted">
            Overdue follow-ups
          </p>
          <p class="mt-3 text-3xl font-semibold text-highlighted">
            {{ pending ? '-' : stats.overdue }}
          </p>
        </div>
      </section>

      <section class="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)]">
        <div class="flex flex-col gap-6">
          <section class="rounded-lg border border-default bg-elevated">
            <div class="flex items-center justify-between gap-4 border-b border-default px-5 py-4">
              <div>
                <h2 class="text-sm font-semibold text-highlighted">
                  Follow-up queue
                </h2>
                <p class="mt-1 text-sm text-muted">
                  Overdue items first, then upcoming follow-ups.
                </p>
              </div>
            </div>

            <div v-if="pending" class="px-5 py-4">
              <div class="space-y-3">
                <div class="h-16 rounded-md bg-muted/40" />
                <div class="h-16 rounded-md bg-muted/40" />
                <div class="h-16 rounded-md bg-muted/40" />
              </div>
            </div>

            <div v-else-if="followUpJobs.length === 0" class="px-5 py-8 text-center">
              <UIcon name="i-lucide-bell-off" class="mx-auto size-8 text-muted" />
              <p class="mt-4 text-sm font-medium text-highlighted">
                No follow-ups due
              </p>
              <p class="mt-1 text-sm text-muted">
                Follow-up dates will appear here when they are set.
              </p>
            </div>

            <div v-else>
              <NuxtLink
                v-for="job in followUpJobs"
                :key="job.id"
                :to="`/jobs/${job.id}`"
                class="flex items-start justify-between gap-4 border-b border-default px-5 py-4 last:border-b-0 transition-colors hover:bg-muted/40 focus:outline-none focus-visible:bg-muted/40"
              >
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="truncate text-sm font-semibold text-highlighted">
                      {{ job.position }}
                    </p>
                    <UBadge :color="jobStatusColors[job.status]" variant="subtle">
                      {{ jobStatusLabels[job.status] }}
                    </UBadge>
                  </div>
                  <p class="mt-1 text-sm text-muted">
                    {{ job.company }}
                  </p>
                  <p
                    class="mt-2 text-sm"
                    :class="
                      isFollowUpOverdue(job.nextFollowUpAt)
                        ? 'font-medium text-error'
                        : 'text-highlighted'
                    "
                  >
                    {{ formatFollowUpLabel(job.nextFollowUpAt) }}
                  </p>
                </div>
                <UIcon
                  name="i-lucide-arrow-up-right"
                  class="mt-1 size-4 shrink-0 text-muted"
                />
              </NuxtLink>
            </div>
          </section>

          <section class="rounded-lg border border-default bg-elevated">
            <div class="flex items-center justify-between gap-4 border-b border-default px-5 py-4">
              <div>
                <h2 class="text-sm font-semibold text-highlighted">
                  Recent applications
                </h2>
                <p class="mt-1 text-sm text-muted">
                  Latest items from the tracker.
                </p>
              </div>
            </div>

            <div v-if="pending" class="px-5 py-4">
              <div class="space-y-3">
                <div class="h-16 rounded-md bg-muted/40" />
                <div class="h-16 rounded-md bg-muted/40" />
                <div class="h-16 rounded-md bg-muted/40" />
              </div>
            </div>

            <div v-else-if="recentJobs.length === 0" class="px-5 py-8 text-center">
              <UIcon name="i-lucide-briefcase" class="mx-auto size-8 text-muted" />
              <p class="mt-4 text-sm font-medium text-highlighted">
                No applications yet
              </p>
              <p class="mt-1 text-sm text-muted">
                Add the first application to populate the dashboard.
              </p>
              <UButton class="mt-4" to="/jobs/new" icon="i-lucide-plus">
                Add application
              </UButton>
            </div>

            <div v-else>
              <NuxtLink
                v-for="job in recentJobs"
                :key="job.id"
                :to="`/jobs/${job.id}`"
                class="flex items-start justify-between gap-4 border-b border-default px-5 py-4 last:border-b-0 transition-colors hover:bg-muted/40 focus:outline-none focus-visible:bg-muted/40"
              >
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="truncate text-sm font-semibold text-highlighted">
                      {{ job.position }}
                    </p>
                    <UBadge :color="jobStatusColors[job.status]" variant="subtle">
                      {{ jobStatusLabels[job.status] }}
                    </UBadge>
                  </div>
                  <p class="mt-1 text-sm text-muted">
                    {{ job.company }}
                  </p>
                  <p class="mt-2 text-sm text-highlighted">
                    {{ formatAppliedDate(job.appliedAt) }}
                  </p>
                </div>
                <UIcon
                  name="i-lucide-arrow-up-right"
                  class="mt-1 size-4 shrink-0 text-muted"
                />
              </NuxtLink>
            </div>
          </section>
        </div>

        <aside class="flex flex-col gap-6">
          <section class="rounded-lg border border-default bg-elevated">
            <div class="border-b border-default px-5 py-4">
              <h2 class="text-sm font-semibold text-highlighted">
                Status summary
              </h2>
              <p class="mt-1 text-sm text-muted">
                Count and coverage by application stage.
              </p>
            </div>

            <div v-if="pending" class="space-y-4 px-5 py-4">
              <div v-for="item in 4" :key="item" class="h-10 rounded-md bg-muted/40" />
            </div>

            <div v-else class="space-y-4 px-5 py-4">
              <div
                v-for="status in statusSummary"
                :key="status.value"
                class="space-y-2"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2">
                    <UBadge :color="status.tone" variant="subtle">
                      {{ status.label }}
                    </UBadge>
                  </div>
                  <p class="text-sm font-medium text-highlighted">
                    {{ status.count }}
                  </p>
                </div>

                <div class="h-2 rounded-full bg-muted/40">
                  <div
                    class="h-2 rounded-full"
                    :class="statusToneClass[status.tone]"
                    :style="{ width: `${status.percent}%` }"
                  />
                </div>
              </div>
            </div>
          </section>

          <section class="rounded-lg border border-default bg-elevated">
            <div class="border-b border-default px-5 py-4">
              <h2 class="text-sm font-semibold text-highlighted">
                Quick actions
              </h2>
              <p class="mt-1 text-sm text-muted">
                Jump straight into common tasks.
              </p>
            </div>

            <div class="flex flex-wrap gap-3 px-5 py-4">
              <UButton to="/jobs/new" icon="i-lucide-plus">
                Add application
              </UButton>
              <UButton
                to="/jobs"
                color="neutral"
                variant="outline"
                icon="i-lucide-search"
              >
                Open tracker
              </UButton>
            </div>
          </section>
        </aside>
      </section>
    </div>
  </UContainer>
</template>
