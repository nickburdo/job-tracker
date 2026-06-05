<script setup lang="ts">
import { interviewStatuses } from '~/utils/job-statuses';
import {
  isFollowUpOverdue,
  type JobApplication,
} from '~/utils/job-applications';

const props = defineProps<{ jobs: JobApplication[] }>();
const totalJobs = computed(() => props.jobs.length);
const overdueFollowUps = computed(() =>
  props.jobs.filter((job) => isFollowUpOverdue(job.nextFollowUpAt)),
);

const stats = computed(() => {
  const total = totalJobs.value;
  const interviews = props.jobs.filter((job) =>
    interviewStatuses.has(job.status),
  ).length;
  const offers = props.jobs.filter((job) => job.status === 'OFFER').length;
  const rejected = props.jobs.filter((job) => job.status === 'REJECTED').length;

  return {
    total,
    interviews,
    offers,
    rejected,
    overdue: overdueFollowUps.value.length,
  };
});

const statCardClass = (value: number) => [
  'rounded-lg border p-4 transition-colors',
  value > 0
    ? 'border-default bg-elevated'
    : 'border-dashed border-default bg-muted/20',
];
</script>

<template>
  <section class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
    <div :class="statCardClass(stats.total)">
      <p class="text-xs font-medium uppercase tracking-wide text-muted">
        Total applications
      </p>
      <p class="mt-3 text-3xl font-semibold text-highlighted">
        {{ stats.total }}
      </p>
    </div>
    <div :class="statCardClass(stats.interviews)">
      <p class="text-xs font-medium uppercase tracking-wide text-muted">
        Active interviews
      </p>
      <p class="mt-3 text-3xl font-semibold text-highlighted">
        {{ stats.interviews }}
      </p>
    </div>
    <div :class="statCardClass(stats.offers)">
      <p class="text-xs font-medium uppercase tracking-wide text-muted">
        Offers
      </p>
      <p class="mt-3 text-3xl font-semibold text-highlighted">
        {{ stats.offers }}
      </p>
    </div>
    <div :class="statCardClass(stats.rejected)">
      <p class="text-xs font-medium uppercase tracking-wide text-muted">
        Rejected
      </p>
      <p class="mt-3 text-3xl font-semibold text-highlighted">
        {{ stats.rejected }}
      </p>
    </div>
    <div :class="statCardClass(stats.overdue)">
      <p class="text-xs font-medium uppercase tracking-wide text-muted">
        Overdue follow-ups
      </p>
      <p class="mt-3 text-3xl font-semibold text-highlighted">
        {{ stats.overdue }}
      </p>
    </div>
  </section>
</template>

<style scoped></style>
