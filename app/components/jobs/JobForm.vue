<script setup lang="ts">
import {
  jobStatusOptions,
  type JobApplicationStatus,
} from '~/utils/job-statuses';

type JobFormValue = {
  company: string;
  position: string;
  vacancyUrl: string;
  status: JobApplicationStatus;
  source: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  location: string;
  remoteType: string;
  notes: string;
  appliedAt: string;
  nextFollowUpAt: string;
};

const props = defineProps<{
  initialValue?: Partial<JobFormValue>;
  submitLabel: string;
  pending?: boolean;
  errorMessage?: string;
}>();

const emit = defineEmits<{
  submit: [value: JobFormValue];
}>();

const remoteTypeOptions = [
  { label: 'Not set', value: 'NOT_SET' },
  { label: 'Remote', value: 'Remote' },
  { label: 'Hybrid', value: 'Hybrid' },
  { label: 'On-site', value: 'On-site' },
];

const form = reactive<JobFormValue>({
  company: props.initialValue?.company ?? '',
  position: props.initialValue?.position ?? '',
  vacancyUrl: props.initialValue?.vacancyUrl ?? '',
  status: props.initialValue?.status ?? 'SAVED',
  source: props.initialValue?.source ?? '',
  salaryMin: props.initialValue?.salaryMin ?? null,
  salaryMax: props.initialValue?.salaryMax ?? null,
  currency: props.initialValue?.currency ?? 'USD',
  location: props.initialValue?.location ?? '',
  remoteType: props.initialValue?.remoteType || 'NOT_SET',
  notes: props.initialValue?.notes ?? '',
  appliedAt: props.initialValue?.appliedAt ?? '',
  nextFollowUpAt: props.initialValue?.nextFollowUpAt ?? '',
});

const fieldErrors = ref<Partial<Record<keyof JobFormValue, string>>>({});

const clearErrors = () => {
  fieldErrors.value = {};
};

const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const validateForm = () => {
  clearErrors();

  if (!form.company.trim()) {
    fieldErrors.value.company = 'Company is required';
  }

  if (!form.position.trim()) {
    fieldErrors.value.position = 'Position is required';
  }

  if (!form.vacancyUrl.trim()) {
    fieldErrors.value.vacancyUrl = 'Vacancy URL is required';
  } else if (!isValidUrl(form.vacancyUrl)) {
    fieldErrors.value.vacancyUrl = 'Enter a valid http or https URL';
  }

  if (!form.source.trim()) {
    fieldErrors.value.source = 'Source is required';
  }

  if (
    form.salaryMin !== null &&
    form.salaryMax !== null &&
    form.salaryMin > form.salaryMax
  ) {
    fieldErrors.value.salaryMin = 'Min salary cannot exceed max salary';
    fieldErrors.value.salaryMax = 'Max salary cannot be lower than min salary';
  }

  return Object.keys(fieldErrors.value).length === 0;
};

const onSubmit = () => {
  if (!validateForm()) {
    return;
  }

  emit('submit', {
    ...form,
    company: form.company.trim(),
    position: form.position.trim(),
    vacancyUrl: form.vacancyUrl.trim(),
    source: form.source.trim(),
    currency: form.currency.trim(),
    location: form.location.trim(),
    remoteType: form.remoteType === 'NOT_SET' ? '' : form.remoteType,
  });
};
</script>

<template>
  <form class="flex flex-col gap-6" @submit.prevent="onSubmit">
    <div
      v-if="errorMessage"
      class="rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error"
    >
      {{ errorMessage }}
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <UFormField label="Company" :error="fieldErrors.company" required>
        <UInput
          v-model="form.company"
          class="w-full"
          placeholder="Northstar Labs"
        />
      </UFormField>

      <UFormField label="Position" :error="fieldErrors.position" required>
        <UInput
          v-model="form.position"
          class="w-full"
          placeholder="Frontend Engineer"
        />
      </UFormField>

      <UFormField label="Vacancy URL" :error="fieldErrors.vacancyUrl" required>
        <UInput
          v-model="form.vacancyUrl"
          class="w-full"
          placeholder="https://example.com/jobs/frontend"
        />
      </UFormField>

      <UFormField label="Source" :error="fieldErrors.source" required>
        <UInput v-model="form.source" class="w-full" placeholder="LinkedIn" />
      </UFormField>

      <UFormField label="Status">
        <USelectMenu
          v-model="form.status"
          :items="jobStatusOptions"
          class="w-full"
          value-key="value"
        />
      </UFormField>

      <UFormField label="Remote type">
        <USelectMenu
          v-model="form.remoteType"
          :items="remoteTypeOptions"
          class="w-full"
          value-key="value"
        />
      </UFormField>

      <UFormField label="Location">
        <UInput
          v-model="form.location"
          class="w-full"
          placeholder="Remote, US"
        />
      </UFormField>

      <UFormField label="Currency">
        <UInput v-model="form.currency" class="w-full" placeholder="USD" />
      </UFormField>

      <UFormField label="Salary min" :error="fieldErrors.salaryMin">
        <UInput
          v-model.number="form.salaryMin"
          class="w-full"
          type="number"
          min="0"
        />
      </UFormField>

      <UFormField label="Salary max" :error="fieldErrors.salaryMax">
        <UInput
          v-model.number="form.salaryMax"
          class="w-full"
          type="number"
          min="0"
        />
      </UFormField>

      <UFormField label="Applied date">
        <UInput v-model="form.appliedAt" class="w-full" type="date" />
      </UFormField>

      <UFormField label="Next follow-up">
        <UInput v-model="form.nextFollowUpAt" class="w-full" type="date" />
      </UFormField>

      <UFormField label="Notes" class="lg:col-span-2">
        <UTextarea
          v-model="form.notes"
          class="w-full"
          :rows="5"
          placeholder="Recruiter notes, interview details, next actions"
        />
      </UFormField>
    </div>

    <div class="flex justify-end gap-3">
      <UButton to="/jobs" color="neutral" variant="outline">Cancel</UButton>
      <UButton type="submit" :loading="pending">
        {{ submitLabel }}
      </UButton>
    </div>
  </form>
</template>
