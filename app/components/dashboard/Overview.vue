<script setup lang="ts">
import {
  isFollowUpOverdue,
  type JobApplication,
  type JobMetaResponse,
} from '~/utils/job-applications';

const props = defineProps<{
  jobs: JobApplication[];
  stats: JobMetaResponse['stats'] | undefined;
}>();

const overdueFollowUps = computed(() =>
  props.jobs.filter((job) => isFollowUpOverdue(job.nextFollowUpAt)),
);

const formatPercent = (value: number) =>
  `${new Intl.NumberFormat('en', {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(value)}`;

const stats = computed(() => ({
  total: props.stats?.total ?? 0,
  interviews: props.stats?.interviews ?? 0,
  offers: props.stats?.offers ?? 0,
  rejected: props.stats?.rejections ?? 0,
  interviewRate: props.stats?.interviewRate ?? 0,
  offerRate: props.stats?.offerRate ?? 0,
  rejectionRate: props.stats?.rejectionRate ?? 0,
  overdue: overdueFollowUps.value.length,
}));

const statCardClass = (value: number) => [
  'rounded-lg border p-4 transition-colors',
  value > 0
    ? 'border-default bg-elevated'
    : 'border-dashed border-default bg-muted/20',
];

const statsCards = computed(() => [
  {
    label: 'Total applications',
    value: stats.value.total,
  },
  {
    label: 'Active interviews',
    value: stats.value.interviews,
    subtitle: `${formatPercent(stats.value.interviewRate)} conversion rate`,
  },
  {
    label: 'Offers',
    value: stats.value.offers,
    subtitle: `${formatPercent(stats.value.offerRate)} conversion rate`,
  },
  {
    label: 'Rejected',
    value: stats.value.rejected,
    subtitle: `${formatPercent(stats.value.rejectionRate)} conversion rate`,
  },
  {
    label: 'Overdue follow-ups',
    value: stats.value.overdue,
  },
]);
</script>

<template>
  <section class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
    <div
      v-for="card in statsCards"
      :key="card.label"
      :class="statCardClass(card.value)"
    >
      <p class="text-xs font-medium uppercase tracking-wide text-muted">
        {{ card.label }}
      </p>
      <p class="mt-3 text-3xl font-semibold text-highlighted">
        {{ card.value }}
      </p>
      <p v-if="card.subtitle" class="mt-2 text-xs text-muted">
        {{ card.subtitle }}
      </p>
    </div>
  </section>
</template>

<style scoped></style>
