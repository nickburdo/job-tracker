<script setup lang="ts">
type JobApplicationStatus =
  | 'SAVED'
  | 'APPLIED'
  | 'SCREENING'
  | 'TECHNICAL_INTERVIEW'
  | 'FINAL_INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'ARCHIVED'

type JobFormValue = {
  company: string
  position: string
  vacancyUrl: string
  status: JobApplicationStatus
  source: string
  salaryMin: number | null
  salaryMax: number | null
  currency: string
  location: string
  remoteType: string
  notes: string
  appliedAt: string
  nextFollowUpAt: string
}

const props = defineProps<{
  initialValue?: Partial<JobFormValue>
  submitLabel: string
  pending?: boolean
  errorMessage?: string
}>()

const emit = defineEmits<{
  submit: [value: JobFormValue]
}>()

const statusOptions = [
  { label: 'Saved', value: 'SAVED' },
  { label: 'Applied', value: 'APPLIED' },
  { label: 'Screening', value: 'SCREENING' },
  { label: 'Technical Interview', value: 'TECHNICAL_INTERVIEW' },
  { label: 'Final Interview', value: 'FINAL_INTERVIEW' },
  { label: 'Offer', value: 'OFFER' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Archived', value: 'ARCHIVED' }
]

const remoteTypeOptions = [
  { label: 'Not set', value: '' },
  { label: 'Remote', value: 'Remote' },
  { label: 'Hybrid', value: 'Hybrid' },
  { label: 'On-site', value: 'On-site' }
]

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
  remoteType: props.initialValue?.remoteType ?? '',
  notes: props.initialValue?.notes ?? '',
  appliedAt: props.initialValue?.appliedAt ?? '',
  nextFollowUpAt: props.initialValue?.nextFollowUpAt ?? ''
})

const onSubmit = () => {
  emit('submit', { ...form })
}
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
      <UFormField label="Company" required>
        <UInput v-model="form.company" placeholder="Northstar Labs" />
      </UFormField>

      <UFormField label="Position" required>
        <UInput v-model="form.position" placeholder="Frontend Engineer" />
      </UFormField>

      <UFormField label="Vacancy URL" required>
        <UInput
          v-model="form.vacancyUrl"
          placeholder="https://example.com/jobs/frontend"
        />
      </UFormField>

      <UFormField label="Source" required>
        <UInput v-model="form.source" placeholder="LinkedIn" />
      </UFormField>

      <UFormField label="Status">
        <USelectMenu
          v-model="form.status"
          :items="statusOptions"
          value-key="value"
        />
      </UFormField>

      <UFormField label="Remote type">
        <USelectMenu
          v-model="form.remoteType"
          :items="remoteTypeOptions"
          value-key="value"
        />
      </UFormField>

      <UFormField label="Location">
        <UInput v-model="form.location" placeholder="Remote, US" />
      </UFormField>

      <UFormField label="Currency">
        <UInput v-model="form.currency" placeholder="USD" />
      </UFormField>

      <UFormField label="Salary min">
        <UInput v-model.number="form.salaryMin" type="number" min="0" />
      </UFormField>

      <UFormField label="Salary max">
        <UInput v-model.number="form.salaryMax" type="number" min="0" />
      </UFormField>

      <UFormField label="Applied date">
        <UInput v-model="form.appliedAt" type="date" />
      </UFormField>

      <UFormField label="Next follow-up">
        <UInput v-model="form.nextFollowUpAt" type="date" />
      </UFormField>
    </div>

    <UFormField label="Notes">
      <UTextarea
        v-model="form.notes"
        :rows="5"
        placeholder="Recruiter notes, interview details, next actions"
      />
    </UFormField>

    <div class="flex justify-end gap-3">
      <UButton to="/jobs" color="neutral" variant="outline">Cancel</UButton>
      <UButton type="submit" :loading="pending">
        {{ submitLabel }}
      </UButton>
    </div>
  </form>
</template>
