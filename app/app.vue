<script setup lang="ts">
import type { ToasterProps } from '#ui/components/Toaster.vue';

const toaster = { position: 'bottom-right' } as ToasterProps;
</script>

<template>
  <UApp :toaster="toaster">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
