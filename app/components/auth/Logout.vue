<script setup lang="ts">
const authUser = useSupabaseUser();
const supabase = useSupabaseClient();
const signOutPending = ref(false);

const showError = (error: unknown, fallbackMessage: string) => {
  const message =
    error instanceof Error && error.message ? error.message : fallbackMessage;

  alert(message);
};

const signOut = async () => {
  if (signOutPending.value) {
    return;
  }

  signOutPending.value = true;

  try {
    const { error } = await supabase.auth.signOut({ scope: 'local' });

    if (error) {
      throw error;
    }
  } catch (error) {
    showError(error, 'Failed to sign out');
  } finally {
    signOutPending.value = false;
  }
};
</script>

<template>
  <UButton
    v-if="authUser"
    color="neutral"
    variant="ghost"
    icon="i-lucide-log-out"
    size="sm"
    :loading="signOutPending"
    @click="signOut"
  >
    Sign Out
  </UButton>
</template>
