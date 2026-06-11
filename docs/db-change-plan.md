# Миграция БД с SQLite на PostgreSQL (Supabase)

## Сделать бэкап dev.db.

```bash
cp dev.db dev.db.back
```

## Переключить Prisma на PostgreSQL и добавить префикс к именам таблиц.

***Не забыть:** добавить префикс во все модели* 
`prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
}
// ...
model JobApplication {
 // ...
  @@map("job_tracker_job_applications")
}
```

## Установить DATABASE_URL для PostgreSQL

`.env`:
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.lydgzcdgwvzvpttujprd.supabase.co:5432/postgres
```

## Исправить prisma.config.ts

Вместо `DATABASE_URL` использовать `DIRECT_URL`.

`prisma.config.ts`:
```typescript
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
```

## Создать в ДБ таблицы согласно схемы

```bash
npx prisma generate
npx prisma db push
```

## Экспортировать таблицы базы в scv файлы

- Открыть [онлайн SQLite Viewer](https://inloop.github.io/sqlite-viewer/)
- Загрузить в него БД (dev.db)
- Выгрузить каждую таблицу в файл .csv

## Импортировать таблицы из .csv.

- Открыть проект в панели Supabase
- Table Editor → нужная таблица
- Insert → Import data from CSV
- Загрузить файл .csv:
- Проверить соответствие колонок.
- Запустить импорт.

После импорта проверить количество записей.

```bash
node import.js
```

## Восстановить prisma.config

- Вернуть `DATABASE_URL` вместо `DIRECT_URL`.
- Запустить генерацию
```bash
npx prisma generate
```


## Проверить данные в Prisma Studio и в Supabase.

```bash
npm run prisma:studio
```

- таблица job_tracker_job_applications создана
- количество записей совпадает с jobs.json
- данные отображаются в приложении

## Восстановить generator client в schema.prisma

`schema.prisma`:
```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

// generator client {
//  provider = "prisma-client-js"
// }
```

и запустить генерацию
```bash
npx prisma generate
```

##  Заменить адаптер SQLite на PostgreSQL

- удалить адаптер для SQLite
 ```bash
npm uninstall @prisma/adapter-better-sqlite3 better-sqlite3
- ```

- установить адаптер для PostgreSQL
```bash
npm i pg @prisma/adapter-pg
npm i -D @types/pg
```

- заменить адаптер в файлах prisma.ts и seed.ts

`server/utils/prisma.ts`:
```typescript
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '~~/generated/prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// ...
```

`prisma/seed.ts`:
```typescript
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { JobApplicationStatus, PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

// ...
```
- запустить генерацию
```bash
npx prisma generate
```


## UPD

- в файл `.env` записать `DATABASE_URL` и `DIRECT_URL`:
```dotenv
# Connect to Postgres via the shared transaction-mode pooler (IPv4-only)
DATABASE_URL="postgresql://postgres.lydgzcdgwvzvpttujprd:[YOUR-PASSWORD]@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true"
# Connect to Postgres via the shared session-mode pooler (used for migrations)
DIRECT_URL="postgresql://postgres.lydgzcdgwvzvpttujprd:[YOUR-PASSWORD]@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"
```
- в `prisma.config.ts` вместо `DATABASE_URL` использовать `DIRECT_URL`.
```typescript
// prisma.config.ts

import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DIRECT_URL'),
  },
});
```
- удалить старые SQLite миграции - удаляем папку `prisma/migrations`
***Если нужно сохранить старые данны в БД :***
- создать `baseline` из текущей схемы Prisma
```bash
mkdir -p prisma/migrations/00000000000000_init_postgres
```
```bash
npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script --output prisma/migrations/00000000000000_init_postgres/migration.sql
```
- дальше обычные PostgreSQL миграции