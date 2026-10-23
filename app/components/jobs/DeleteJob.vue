<script setup lang="ts">
import { deleteJobApplication } from '~/lib/db/repositories/jobApplicationRepository';

const router = useRouter();
const toast = useToast();
const props = defineProps<{
  jobId: string;
}>();

const open = ref(false);
const deletePending = ref(false);

const closeModal = () => {
  open.value = false;
};

const deleteJob = async () => {
  if (deletePending.value) return;

  deletePending.value = true;

  try {
    await deleteJobApplication(props.jobId);

    open.value = false;
    toast.add({ title: 'Application deleted', color: 'success' });
    await router.push('/jobs');
  } catch (deleteError) {
    const errorMessage =
      deleteError instanceof Error
        ? deleteError.message
        : 'Failed to delete application';
    toast.add({ title: errorMessage, color: 'error' });
  } finally {
    deletePending.value = false;
  }
};
</script>

<template>
  <UModal
    v-model:open="open"
    title="Delete job application?"
    :dismissible="!deletePending"
    :close="!deletePending"
  >
    <UButton color="error" variant="outline" icon="i-lucide-trash-2">
      Delete
    </UButton>

    <template #body>
      <p>This removes the application permanently.</p>
    </template>

    <template #footer>
      <div class="flex gap-2">
        <UButton
          color="neutral"
          label="Cancel"
          :disabled="deletePending"
          @click="closeModal"
        />
        <UButton
          color="error"
          label="Delete"
          :loading="deletePending"
          @click="deleteJob"
        />
      </div>
    </template>
  </UModal>
</template>

<style scoped></style>
