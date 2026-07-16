<script setup lang="ts">
import type {
  JobApplication,
  JobMetaResponse,
} from '~/utils/job-applications';
import {
  getJobMeta,
  listJobApplications,
} from '~/lib/db/repositories/jobApplicationRepository';

const allJobs = ref<JobApplication[]>([]);
const dashboardMeta = ref<JobMetaResponse>();
const pending = ref(false);
const error = ref<Error | null>(null);

async function refresh() {
  pending.value = true;
  error.value = null;

  try {
    const [page, meta] = await Promise.all([
      listJobApplications({ perPage: Number.MAX_SAFE_INTEGER }),
      getJobMeta(),
    ]);

    allJobs.value = page.items;
    dashboardMeta.value = meta;
  } catch (fetchError) {
    error.value = fetchError as Error;
  } finally {
    pending.value = false;
  }
}

await refresh();

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
</script>

<template>
  <UContainer class="py-8">
    <div class="flex flex-col gap-8">
      <section
        class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
      >
        <div class="max-w-3xl">
          <h1
            class="mt-2 text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl"
          >
            Job search overview
          </h1>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">
            Track applications, interviews, and follow-ups in one place.
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <UButton to="/jobs/new" icon="i-lucide-plus">
            New application
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

      <DashboardOverview :jobs="jobs" :stats="dashboardMeta?.stats" />

      <section class="grid gap-4 xl:grid-cols-2">
        <DashboardFollowUpQueue :jobs="jobs" :pending="pending" />

        <DashboardRecentApplications :jobs="jobs" :pending="pending" />
      </section>
      <DashboardStatusSummary :jobs="jobs" :pending="pending" />

      <section class="rounded-lg border border-default bg-elevated">
        <div class="border-b border-default px-5 py-4">
          <h2 class="text-sm font-semibold text-highlighted">Quick actions</h2>
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
    </div>
  </UContainer>
</template>
