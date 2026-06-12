export default defineNuxtPlugin(() => {
  const authUser = useSupabaseUser();

  const nuxtApp = useNuxtApp();

  nuxtApp.hook('app:mounted', async () => {
    await nextTick();

    if (authUser.value) {
      await refreshNuxtData();
    }
  });

  watch(authUser, async (nextUser, prevUser) => {
    if (nextUser?.sub === prevUser?.sub) {
      return;
    }

    await refreshNuxtData();
  });
});
