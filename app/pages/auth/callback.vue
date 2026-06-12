<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const authUser = useSupabaseUser();

const errorMessage = ref('');
const isRedirecting = ref(false);

const getRouteErrorMessage = () => {
  const rawError =
    typeof route.query.error_description === 'string'
      ? route.query.error_description
      : typeof route.query.error === 'string'
        ? route.query.error
        : '';

  return rawError;
};

watch(
  authUser,
  async (user) => {
    if (!user || isRedirecting.value) {
      return;
    }

    isRedirecting.value = true;
    await refreshNuxtData();
    await router.replace('/');
  },
  { immediate: true },
);

onMounted(() => {
  errorMessage.value = getRouteErrorMessage();
});
</script>

<template>
  <UContainer class="py-10">
    <div class="mx-auto max-w-md rounded-lg border border-default bg-elevated p-6">
      <p v-if="errorMessage" class="text-sm text-error">
        {{ errorMessage }}
      </p>
      <p v-else class="text-sm text-muted">
        Finishing sign in...
      </p>
    </div>
  </UContainer>
</template>
