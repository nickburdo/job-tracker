<script setup lang="ts">
const router = useRouter();
const props = defineProps<{
  jobId: string;
}>();

const open = ref(false);
const deletePending = ref(false);
const errorMessage = ref('');

const deleteJob = async () => {
  deletePending.value = true;
  errorMessage.value = '';

  try {
    await $fetch(`/api/jobs/${props.jobId}`, {
      method: 'DELETE',
    });

    open.value = false;
    await router.push('/jobs');
  } catch (deleteError) {
    errorMessage.value =
      deleteError instanceof Error
        ? deleteError.message
        : 'Failed to delete application';
  } finally {
    deletePending.value = false;
  }
};
</script>

<template>
  <UModal v-model:open="open" title="Delete job application?">
    <UButton color="error" variant="outline" icon="i-lucide-trash-2">
      Delete
    </UButton>

    <template #body>
      <p>This removes the application permanently.</p>
      <div
        v-if="errorMessage"
        class="rounded-lg border border-error/30 bg-error/10 p-2 mt-4 text-sm text-error"
      >
        {{ errorMessage }}
      </div>
    </template>

    <template #footer>
      <div class="flex gap-2">
        <UButton color="neutral" label="Cancel" @click="open = false" />
        <UButton color="error" label="Delete" @click="deleteJob" />
      </div>
    </template>
  </UModal>
</template>

<style scoped></style>
