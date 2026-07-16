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
