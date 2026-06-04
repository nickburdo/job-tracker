<script setup lang="ts">
import MainMenu from '~/components/layouts/default/MainMenu.vue';
</script>

<template>
  <div class="min-h-screen bg-default text-highlighted flex flex-col">
    <header
      class="fixed top-0 left-0 right-0 border-b border-default bg-default/95 backdrop-blur z-10"
    >
      <UContainer class="flex h-16 items-center justify-between gap-6">
        <NuxtLink to="/" class="flex items-center gap-3">
          <span
            class="flex size-9 items-center justify-center rounded-md bg-primary text-sm font-semibold text-inverted"
          >
            JT
          </span>
          <span class="text-sm font-semibold text-highlighted">
            Job Tracker
          </span>
        </NuxtLink>

        <div class="hidden md:block">
          <MainMenu />
        </div>

        <UButton to="/jobs/new" icon="i-lucide-plus" size="sm">
          New application
        </UButton>
      </UContainer>
    </header>

    <main class="grow pt-16 pb-11 md:pb-0">
      <slot />
    </main>

    <footer
      class="fixed bottom-0 left-0 right-0 md:hidden border-t border-default bg-default/95 backdrop-blur p-2"
    >
      <MainMenu />
    </footer>
  </div>
</template>
