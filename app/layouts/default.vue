<script setup lang="ts">
const navigation = useNavigationStore();
</script>

<template>
  <div class="min-h-screen bg-default text-highlighted flex flex-col">
    <header class="border-b border-default bg-default/95 backdrop-blur">
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

        <nav
          class="hidden items-center gap-1 md:flex"
          aria-label="Primary navigation"
        >
          <UButton
            v-for="item in navigation.items"
            :key="item.to"
            :to="item.to"
            variant="ghost"
            color="neutral"
            size="sm"
            active-class="bg-primary-100 text-primary-700"
          >
            {{ item.label }}
          </UButton>
        </nav>

        <UButton to="/jobs/new" icon="i-lucide-plus" size="sm">
          New application
        </UButton>
      </UContainer>
    </header>

    <div class="grow pb-11 md:pb-0">
      <slot />
    </div>

    <footer
      class="fixed bottom-0 left-0 right-0 md:hidden border-t border-default bg-default/95 backdrop-blur p-2"
    >
      <nav
        class="items-center justify-center gap-1 flex"
        aria-label="Primary navigation"
      >
        <UButton
          v-for="item in navigation.items"
          :key="item.to"
          :to="item.to"
          variant="ghost"
          color="neutral"
          size="sm"
          active-class="bg-primary-100 text-primary-700"
        >
          {{ item.label }}
        </UButton>
      </nav>
    </footer>
  </div>
</template>
