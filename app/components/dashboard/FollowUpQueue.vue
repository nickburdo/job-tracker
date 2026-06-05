<script setup lang="ts">
import { jobStatusColors } from '~/utils/job-statuses';
import { isFollowUpOverdue } from '~/utils/job-applications';

const props = defineProps<{ jobs: JobApplication[]; pending: boolean }>();

const followUpJobs = computed(() =>
  [...props.jobs]
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
  <section class="rounded-lg border border-default bg-elevated">
    <div
      class="flex items-center justify-between gap-4 border-b border-default px-5 py-4"
    >
      <div>
        <h2 class="text-sm font-semibold text-highlighted">Follow-up queue</h2>
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
      <p class="mt-4 text-sm font-medium text-highlighted">No follow-ups due</p>
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
</template>

<style scoped></style>
