<script setup lang="ts">
import type { JobMetaResponse } from '~/utils/job-applications';
import { allStatusesValue } from '~/constants/jobs-filter';

const props = defineProps<{
  jobMeta: JobMetaResponse | undefined;
}>();

const selectedStatus = defineModel<string>();

const stats = computed(
  () =>
    props.jobMeta?.stats ?? {
      total: 0,
      interviews: 0,
      offers: 0,
      rejections: 0,
    },
);

const statCardClass = (value: string) => [
  'rounded-lg border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
  selectedStatus.value === value
    ? 'border-primary bg-primary/10'
    : 'border-default bg-elevated hover:bg-muted',
];
</script>

<template>
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
</template>

<style scoped></style>
