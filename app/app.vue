<script setup lang="ts">
import type { ToasterProps } from '#ui/components/Toaster.vue';

const toaster = { position: 'top-right' } as ToasterProps;
</script>

<template>
  <UApp :toaster="toaster">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
