<script setup lang="ts">
import {
  downloadJobApplicationsExport,
  exportJobApplicationsData,
  importJobApplicationsData,
} from '~/lib/db/export-import';

const emit = defineEmits<{
  imported: [];
}>();

const toast = useToast();
const fileInput = ref<HTMLInputElement | null>(null);
const importing = ref(false);

async function exportData() {
  const exportData = await exportJobApplicationsData();
  downloadJobApplicationsExport(exportData);
}

function openImportDialog() {
  fileInput.value?.click();
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  const confirmed = window.confirm(
    'Importing will replace all local job applications with the contents of this file. Continue?',
  );

  if (!confirmed) {
    input.value = '';
    return;
  }

  try {
    importing.value = true;
    await importJobApplicationsData(file);

    toast.add({
      title: 'Import complete',
      description: 'The local job applications were replaced with the imported file.',
    });

    emit('imported');
  } catch (error) {
    toast.add({
      title: 'Import failed',
      description: error instanceof Error ? error.message : 'Could not import the file',
      color: 'error',
    });
  } finally {
    importing.value = false;
    input.value = '';
  }
}
</script>

<template>
  <div class="flex items-center gap-2">
    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-download"
      @click="exportData"
    >
      Export JSON
    </UButton>
    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-upload"
      :loading="importing"
      @click="openImportDialog"
    >
      Import JSON
    </UButton>
    <input
      ref="fileInput"
      type="file"
      accept="application/json"
      class="sr-only"
      @change="handleFileChange"
    >
  </div>
</template>
