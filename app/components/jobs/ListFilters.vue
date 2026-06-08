<script setup lang="ts">
import { allCompaniesValue, allStatusesValue } from '~/constants/jobs-filter';
import type { JobMetaResponse } from '~/utils/job-applications';

const selectedStatus = defineModel<string>('status');
const selectedCompany = defineModel<string>('company');

const props = defineProps<{
  jobMeta: JobMetaResponse | undefined;
}>();

const search = ref('');

const companyOptions = computed(() => [
  {
    label: 'All companies',
    value: allCompaniesValue,
  },
  ...(props.jobMeta?.companies ?? []).map((company) => ({
    label: company,
    value: company,
  })),
]);

const encounteredStatuses = computed(
  () => new Set(props.jobMeta?.statuses ?? []),
);
const statusOptions = computed(() => [
  {
    label: 'All statuses',
    value: allStatusesValue,
  },
  {
    label: 'Interviews',
    value: 'INTERVIEWS',
  },
  ...jobStatusOptions.filter((option) =>
    encounteredStatuses.value.has(option.value),
  ),
]);
</script>

<template>
  <div>
    <div
      class="grid gap-3 rounded-lg border border-default bg-elevated p-4 sm:grid-cols-2 lg:grid-cols-[1fr_220px_220px]"
    >
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Search company, position, source, notes"
        class="sm:col-span-2 lg:col-span-1"
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
  </div>
</template>

<style scoped></style>
