<script setup lang="ts">
import {
  jobStatusOptions,
  type JobApplicationStatus,
} from '~/utils/job-statuses';
import {
  jobValidationMessages,
  jobTextFieldLimits,
  type JobTextField,
} from '../../../shared/job-validation-messages';
import type { JobFormField, JobFormServerErrors } from '~/utils/job-form-errors';

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
  serverErrors?: JobFormServerErrors;
}>();

const emit = defineEmits<{
  submit: [value: JobFormValue];
  clearServerError: [field: JobFormField];
}>();

const router = useRouter();

const remoteTypeOptions = [
  { label: 'Not set', value: 'NOT_SET' },
  { label: 'Remote', value: 'Remote' },
  { label: 'Hybrid', value: 'Hybrid' },
  { label: 'On-site', value: 'On-site' },
];
const sourceOptions = [
  { label: 'LinkedIn', value: 'LinkedIn' },
  { label: 'djinni', value: 'Djinni' },
  { label: 'DOU', value: 'DOU' },
  { label: 'robota.ua', value: 'robota.ua' },
  { label: 'work.ua', value: 'work.ua' },
  { label: 'Other', value: 'Other' },
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

const clearFieldErrors = (fields: JobFormField | JobFormField[]) => {
  const changedFields = Array.isArray(fields) ? fields : [fields];
  const fieldsToClear = new Set(changedFields);

  for (const field of changedFields) {
    if (props.serverErrors?.[field]) {
      emit('clearServerError', field);
    }
  }

  fieldErrors.value = Object.fromEntries(
    Object.entries(fieldErrors.value).filter(
      ([field]) => !fieldsToClear.has(field as JobFormField),
    ),
  ) as Partial<Record<keyof JobFormValue, string>>;
};

const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const hasTextLimit = (field: keyof JobFormValue): field is JobTextField =>
  field in jobTextFieldLimits;

const isTooLong = (field: JobTextField, value: string) =>
  value.trim().length > jobTextFieldLimits[field];

const validateTextField = (
  field: keyof JobFormValue,
  value: string,
  required = false,
) => {
  const trimmed = value.trim();

  if (!trimmed) {
    if (required) {
      fieldErrors.value[field] = jobValidationMessages.required(field);
    }

    return;
  }

  if (hasTextLimit(field) && isTooLong(field, value)) {
    fieldErrors.value[field] = jobValidationMessages.maxLength(field);
  }
};

const validateForm = () => {
  clearErrors();

  validateTextField('company', form.company, true);
  validateTextField('position', form.position, true);
  validateTextField('source', form.source, true);
  validateTextField('currency', form.currency);
  validateTextField('location', form.location);
  validateTextField(
    'remoteType',
    form.remoteType === 'NOT_SET' ? '' : form.remoteType,
  );
  validateTextField('notes', form.notes);

  if (!form.vacancyUrl.trim()) {
    fieldErrors.value.vacancyUrl = jobValidationMessages.required('vacancyUrl');
  } else if (!isValidUrl(form.vacancyUrl)) {
    fieldErrors.value.vacancyUrl =
      jobValidationMessages.vacancyUrlInvalid('vacancyUrl');
  } else if (isTooLong('vacancyUrl', form.vacancyUrl)) {
    fieldErrors.value.vacancyUrl = jobValidationMessages.maxLength('vacancyUrl');
  }

  if (
    form.salaryMin !== null &&
    form.salaryMax !== null &&
    form.salaryMin > form.salaryMax
  ) {
    fieldErrors.value.salaryMin = jobValidationMessages.salaryMinTooHigh;
    fieldErrors.value.salaryMax = jobValidationMessages.salaryMaxTooLow;
  }

  return Object.keys(fieldErrors.value).length === 0;
};

const getFieldError = (field: keyof JobFormValue) =>
  fieldErrors.value[field] ?? props.serverErrors?.[field];

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

watch(
  () => form.vacancyUrl,
  () => {
    clearFieldErrors('vacancyUrl');
  },
);

watch(
  () => form.company,
  () => clearFieldErrors('company'),
);

watch(
  () => form.position,
  () => clearFieldErrors('position'),
);

watch(
  () => form.status,
  () => clearFieldErrors('status'),
);

watch(
  () => form.source,
  () => clearFieldErrors('source'),
);

watch(
  () => form.salaryMin,
  () => clearFieldErrors(['salaryMin', 'salaryMax']),
);

watch(
  () => form.salaryMax,
  () => clearFieldErrors(['salaryMin', 'salaryMax']),
);

watch(
  () => form.currency,
  () => clearFieldErrors('currency'),
);

watch(
  () => form.location,
  () => clearFieldErrors('location'),
);

watch(
  () => form.remoteType,
  () => clearFieldErrors('remoteType'),
);

watch(
  () => form.notes,
  () => clearFieldErrors('notes'),
);

watch(
  () => form.appliedAt,
  () => clearFieldErrors('appliedAt'),
);

watch(
  () => form.nextFollowUpAt,
  () => clearFieldErrors('nextFollowUpAt'),
);

const handleCancel = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/jobs');
  }
};
</script>

<template>
  <form class="flex flex-col gap-6" @submit.prevent="onSubmit">
    <div class="grid gap-4 lg:grid-cols-2">
      <UFormField label="Company" :error="getFieldError('company')" required>
        <UInput
          v-model="form.company"
          class="w-full"
          placeholder="Northstar Labs"
        />
      </UFormField>

      <UFormField label="Position" :error="getFieldError('position')" required>
        <UInput
          v-model="form.position"
          class="w-full"
          placeholder="Frontend Engineer"
        />
      </UFormField>

      <UFormField label="Vacancy URL" :error="getFieldError('vacancyUrl')" required>
        <UInput
          v-model="form.vacancyUrl"
          class="w-full"
          placeholder="https://example.com/jobs/frontend"
        />
      </UFormField>

      <UFormField label="Source" :error="getFieldError('source')" required>
        <USelectMenu
          v-model="form.source"
          class="w-full"
          :items="sourceOptions"
          value-key="value"
        />
      </UFormField>

      <UFormField label="Status" :error="getFieldError('status')">
        <USelectMenu
          v-model="form.status"
          :items="jobStatusOptions"
          class="w-full"
          value-key="value"
        />
      </UFormField>

      <UFormField label="Remote type" :error="getFieldError('remoteType')">
        <USelectMenu
          v-model="form.remoteType"
          :items="remoteTypeOptions"
          class="w-full"
          value-key="value"
        />
      </UFormField>

      <UFormField label="Location" :error="getFieldError('location')">
        <UInput
          v-model="form.location"
          class="w-full"
          placeholder="Remote, US"
        />
      </UFormField>

      <UFormField label="Currency" :error="getFieldError('currency')">
        <UInput v-model="form.currency" class="w-full" placeholder="USD" />
      </UFormField>

      <UFormField label="Salary min" :error="getFieldError('salaryMin')">
        <UInput
          v-model.number="form.salaryMin"
          class="w-full"
          type="number"
          min="0"
        />
      </UFormField>

      <UFormField label="Salary max" :error="getFieldError('salaryMax')">
        <UInput
          v-model.number="form.salaryMax"
          class="w-full"
          type="number"
          min="0"
        />
      </UFormField>

      <UFormField label="Applied date" :error="getFieldError('appliedAt')">
        <UInput v-model="form.appliedAt" class="w-full" type="date" />
      </UFormField>

      <UFormField
        label="Next follow-up"
        :error="getFieldError('nextFollowUpAt')"
      >
        <UInput v-model="form.nextFollowUpAt" class="w-full" type="date" />
      </UFormField>

      <UFormField label="Notes" class="lg:col-span-2" :error="getFieldError('notes')">
        <UTextarea
          v-model="form.notes"
          class="w-full"
          :rows="5"
          placeholder="Recruiter notes, interview details, next actions"
        />
      </UFormField>
    </div>

    <div class="flex justify-end gap-3">
      <UButton color="neutral" variant="outline" @click="handleCancel">
        Cancel
      </UButton>
      <UButton type="submit" :loading="pending">
        {{ submitLabel }}
      </UButton>
    </div>
  </form>
</template>
