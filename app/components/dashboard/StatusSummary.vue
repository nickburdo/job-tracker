<script setup lang="ts">
import {
  type JobApplicationStatus,
  jobStatusColors,
  jobStatusOptions,
} from '~/utils/job-statuses';
const props = defineProps<{ jobs: JobApplication[]; pending: boolean }>();
const totalJobs = computed(() => props.jobs.length);
const totalForBars = computed(() => Math.max(totalJobs.value, 1));
const statusSummary = computed(() =>
  jobStatusOptions.map((status) => {
    const count = props.jobs.filter(
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
</script>

<template>
  <section class="rounded-lg border border-default bg-elevated">
    <div class="border-b border-default px-5 py-4">
      <h2 class="text-sm font-semibold text-highlighted">Status summary</h2>
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
</template>

<style scoped></style>
