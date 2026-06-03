<template>
  <main>
    <UContainer class="py-8">
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-2xl font-semibold tracking-tight text-highlighted">
              Applications
            </h1>
            <p class="mt-1 text-sm text-muted">
              The list, filters, and stats will be connected after the data layer is ready.
            </p>
          </div>

          <UButton icon="i-lucide-plus">
            New application
          </UButton>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-lg border border-default bg-elevated p-4">
            <p class="text-sm text-muted">
              Total
            </p>
            <p class="mt-2 text-2xl font-semibold text-highlighted">
              0
            </p>
          </div>
          <div class="rounded-lg border border-default bg-elevated p-4">
            <p class="text-sm text-muted">
              Interviews
            </p>
            <p class="mt-2 text-2xl font-semibold text-highlighted">
              0
            </p>
          </div>
          <div class="rounded-lg border border-default bg-elevated p-4">
            <p class="text-sm text-muted">
              Offers
            </p>
            <p class="mt-2 text-2xl font-semibold text-highlighted">
              0
            </p>
          </div>
          <div class="rounded-lg border border-default bg-elevated p-4">
            <p class="text-sm text-muted">
              Rejections
            </p>
            <p class="mt-2 text-2xl font-semibold text-highlighted">
              0
            </p>
          </div>
        </div>

        <div class="rounded-lg border border-dashed border-default bg-muted/30 p-8 text-center">
          <UIcon name="i-lucide-database" class="mx-auto size-8 text-muted" />
          <h2 class="mt-4 text-base font-semibold text-highlighted">
            Data layer comes next
          </h2>
          <p class="mx-auto mt-2 max-w-md text-sm text-muted">
            Step 3 will add Prisma and SQLite. This page is the prepared UI shell for the main tracker view.
          </p>
        </div>
      </div>
    </UContainer>
  </main>
</template>
