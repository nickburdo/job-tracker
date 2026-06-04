<script setup lang="ts">
const navigation = useNavigationStore();
</script>

<template>
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
</template>
