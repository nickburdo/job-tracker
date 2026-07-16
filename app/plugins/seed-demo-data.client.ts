import { seedDemoDataIfEmpty } from '~/lib/db/seed';

export default defineNuxtPlugin(async () => {
  await seedDemoDataIfEmpty();
});
