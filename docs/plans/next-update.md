# Next Updates

## Step 1: Local-first (IndexedDB)

План реализации: [`docs/plans/step-1-local-first-plan.md`](../plans/step-1-local-first-plan.md).

1. [ ] Полностью отказаться от бек-енда (Prisma/Postgres/Supabase, `server/api`).
2. [ ] Данные хранить в IndexedDB (Dexie.js).
3. [ ] Структуру БД делать на основе схемы Prisma (`JobApplication`, без `isDemo`).
4. [ ] Если БД ещё нет в браузере, создать и заполнить демо-данными.
5. [ ] Демо-данные хранить в `public/data/demo.json`.
6. [ ] Для создания демо-данных использовать структуру БД и `prisma/seed.ts` (текущий набор из 16 фикстур).
7. [ ] Сделать экспорт/импорт JSON для таблицы job applications — две кнопки (Export JSON, Import JSON) на странице `/jobs`.
8. [ ] Полностью убрать авторизацию (Supabase Auth, `isDemo`, admin/demo-разделение) — единая локальная база на браузер, без входа.

## Step 2 (идея на будущее, не запланировано)

1. Сделать PWA.

## Backlog

1. [ ] Отформатировать Prettier'ом 7 файлов, не проходящих `npm run format:check`: `app/components/jobs/DataActions.vue`, `app/constants/jobs-filter.ts`, `app/lib/db/validation.ts`, `app/pages/index.vue`, `app/pages/jobs/index.vue`, `app/utils/form-errors.ts`, `docs/plans/step-1-local-first-plan.md`. Делать после установки плагина — заодно проверить на этой задаче плагин.
2. [ ] Защитить кнопку Delete в модалке `app/components/jobs/DeleteJob.vue` от двойного клика: сейчас у неё нет `:loading`/`:disabled` по `deletePending`, и повторный клик запускает удаление повторно (найдено code review в `chore/fix-button-click-types`).
