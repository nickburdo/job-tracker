<template>
  <main>
    <UContainer class="py-16 sm:py-20">
      <section class="max-w-3xl">
        <UBadge color="neutral" variant="subtle">
          MVP scaffold
        </UBadge>
        <h1 class="mt-5 text-4xl font-semibold tracking-tight text-highlighted sm:text-5xl">
        Track applications, interviews, and follow-ups.
        </h1>
        <p class="mt-5 max-w-2xl text-lg text-muted">
          The Nuxt UI and Pinia base is ready. Next we will add Prisma, SQLite, and the JobApplication model.
        </p>
        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <UButton to="/jobs" icon="i-lucide-arrow-right" trailing>
            Open applications
          </UButton>
          <UButton to="/jobs" color="neutral" variant="outline" icon="i-lucide-list-checks">
            View MVP surface
          </UButton>
        </div>
      </section>
    </UContainer>
  </main>
</template>
