<script setup lang="ts">
const props = defineProps<{ jobs: JobApplication[]; pending: boolean }>();
const recentJobs = computed(() => props.jobs.slice(0, 5));
</script>

<template>
  <section class="rounded-lg border border-default bg-elevated">
    <div
      class="flex items-center justify-between gap-4 border-b border-default px-5 py-4"
    >
      <div>
        <h2 class="text-sm font-semibold text-highlighted">
          Recent applications
        </h2>
        <p class="mt-1 text-sm text-muted">Latest items from the tracker.</p>
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
</template>

<style scoped></style>
