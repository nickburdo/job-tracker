<script setup lang="ts">
const open = ref(false);
const supabase = useSupabaseClient();
const logoClickTimer = ref<ReturnType<typeof setTimeout> | null>(null);

const email = ref('');
const password = ref('');
const pending = ref(false);

const showError = (error: unknown, fallbackMessage: string) => {
  const message =
    error instanceof Error && error.message ? error.message : fallbackMessage;

  alert(message);
};

const resetForm = () => {
  email.value = '';
  password.value = '';
};

const closeModal = () => {
  open.value = false;
};

const openLogin = () => {
  open.value = true;
};

const goHome = async () => {
  await navigateTo('/');
};

const onLogoClick = () => {
  if (logoClickTimer.value) {
    return;
  }

  logoClickTimer.value = setTimeout(() => {
    logoClickTimer.value = null;
    void goHome();
  }, 180);
};

const onLogoDoubleClick = () => {
  if (logoClickTimer.value) {
    clearTimeout(logoClickTimer.value);
    logoClickTimer.value = null;
  }

  openLogin();
};

const submit = async () => {
  if (pending.value) {
    return;
  }

  pending.value = true;

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (error) {
      throw error;
    }

    await refreshNuxtData();
    closeModal();
  } catch (error) {
    showError(error, 'Failed to sign in');
  } finally {
    pending.value = false;
  }
};

watch(open, (value) => {
  if (!value) {
    resetForm();
  }
});

onBeforeUnmount(() => {
  if (logoClickTimer.value) {
    clearTimeout(logoClickTimer.value);
    logoClickTimer.value = null;
  }
});
</script>

<template>
  <div class="flex items-center gap-3">
    <button
      type="button"
      class="flex items-center gap-3 text-left"
      @click="onLogoClick"
      @dblclick.prevent.stop="onLogoDoubleClick"
    >
      <span
        class="flex size-9 items-center justify-center rounded-md bg-primary text-sm font-semibold text-inverted"
      >
        JT
      </span>
      <span class="text-sm font-semibold text-highlighted">
        Job Tracker
      </span>
    </button>

    <UModal
      v-model:open="open"
      title="Sign in"
      description="Use your Supabase credentials."
    >
      <template #body>
        <form class="flex flex-col gap-4" @submit.prevent="submit">
          <UFormField label="Email">
            <UInput v-model="email" type="email" autocomplete="email" />
          </UFormField>

          <UFormField label="Password">
            <UInput
              v-model="password"
              type="password"
              autocomplete="current-password"
            />
          </UFormField>

          <div class="flex justify-end gap-3 pt-2">
            <UButton
              color="neutral"
              variant="outline"
              type="button"
              @click="closeModal"
            >
              Cancel
            </UButton>
            <UButton type="submit" :loading="pending">
              Sign In
            </UButton>
          </div>
        </form>
      </template>
    </UModal>
  </div>
</template>
