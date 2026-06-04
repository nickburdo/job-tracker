<script setup lang="ts">
const navigation = useNavigationStore();
</script>

<template>
  <div class="min-h-screen bg-default text-highlighted">
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
          >
            {{ item.label }}
          </UButton>
        </nav>

        <UButton to="/jobs" icon="i-lucide-briefcase-business" size="sm">
          Open tracker
        </UButton>
      </UContainer>
    </header>

    <slot />
  </div>
</template>
