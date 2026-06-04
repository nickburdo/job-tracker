<script setup lang="ts">
const navigation = useNavigationStore();
const route = useRoute();

const isActive = (to: string) => {
  return route.path === to || route.path.startsWith(`${to}/`);
};
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
      :class="{ 'bg-primary-100 text-primary-700': isActive(item.to) }"
    >
      {{ item.label }}
    </UButton>
  </nav>
</template>
