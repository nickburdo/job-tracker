# Step 1 — Переход на локальный IndexedDB — план реализации

> **Для агентов-исполнителей:** ОБЯЗАТЕЛЬНЫЙ ПОДНАВЫК: используйте superpowers:subagent-driven-development (рекомендуется) или superpowers:executing-plans для выполнения плана задача за задачей. Шаги используют синтаксис чекбоксов (`- [ ]`) для отслеживания прогресса. **Без TDD**: согласно глобальным инструкциям проекта, автоматические тесты не пишутся, если явно не попросили. Каждая задача заканчивается шагом ручной проверки или проверки типов вместо цикла с тестами. Не проверяйте UI/frontend-изменения в настоящем браузере, если пользователь явно не попросил об этом в текущей сессии — вместо этого опишите, что должен проверить разработчик вручную.
>
> **Контрольная точка после каждой задачи (обязательно):** после выполнения задачи (все шаги, включая коммит) — остановиться, кратко отчитаться о результате и ждать явного подтверждения пользователя, прежде чем начинать следующую задачу. Не переходить к следующей задаче автоматически, даже если предыдущая прошла проверку без проблем.

**Цель:** Заменить текущий серверный бэкенд (Prisma + Supabase Postgres для данных, Supabase Auth для входа) на полностью клиентский слой данных на основе IndexedDB (через Dexie.js), с заполнением демо-данными и экспортом/импортом JSON для таблицы job applications — и только после проверки нового пути убрать старый бэкенд.

**Архитектура:** Все заявки о работе (`JobApplication`) хранятся в одной базе IndexedDB на браузер, доступ к которой идёт через один репозиторий, повторяющий `prisma/schema.prisma`. Сервера нет, авторизации нет, разделения demo/admin по записям нет (`isDemo` убирается) — один локальный набор данных на браузер, редактируемый любым, у кого есть доступ к этому браузеру. При первом запуске (пустая база) приложение заполняет себя из `public/data/demo.json`. На странице `/jobs` есть кнопки экспорта и импорта всей таблицы в JSON.

**Технологии:** Nuxt 4 (только клиент), Dexie.js для IndexedDB, существующие компоненты Nuxt UI. Никакой новой библиотеки управления состоянием не добавляется.

## Общие ограничения

- Никакого логина, никакой авторизации, никакого разделения admin/demo, никакого поля `isDemo` нигде в новом коде — подтверждено пользователем; это полностью заменяет текущую модель Supabase Auth + `private.admin_users`.
- Реальные записи, которые сейчас лежат в Supabase Postgres (включая `docs/data.json` — уже сделанный экспорт 106 реальных строк), этим планом **не переносятся и нигде не используются**. `docs/data.json` не читается, не импортируется и не упоминается ни в одном файле этого плана — подтверждено пользователем явно («забудь про него»). Пустая/новая база в браузере заполняется только фикстурами из `prisma/seed.ts`.
- Старый бэкенд (Supabase Auth, Supabase Postgres/Prisma, `server/api`) убирается только **после** того, как путь через IndexedDB построен и проверен — подтверждено пользователем. В этом плане такое удаление вынесено в последнюю фазу (Phase G), а не перемешано с фазами построения.
- Библиотека для работы с IndexedDB: **Dexie.js**.
- Не писать автоматические тесты, если явно не попросили (общее правило проекта). Шаги проверки в этом плане используют `npm run typecheck`, `npm run lint`, `npm run build` и ручные проверки разработчика — без новых тестовых файлов. (Существующий `test/server-api.test.ts` бьёт по `server/api`, который эта работа не трогает до Phase G; в Phase G он удаляется вместе с самим `server/api`.)
- Не проверять UI/frontend-изменения в настоящем браузере, если явно не попросили (общее правило проекта) — шаги проверки описывают, что должен увидеть разработчик; ассистент не управляет браузером, если его не попросили.
- `prisma/schema.prisma` остаётся документированным источником истины для формы данных, но после Phase G больше не подключён ни к какой живой базе, генератору или клиенту.
- Продакшен-деплой на Render (см. `docs/deploy.md`, `start-preview.mjs`) сейчас обслуживает серверную (Prisma/Supabase) версию приложения. Этот план доводит IndexedDB-путь до полной готовности и проверки (Phase F), но **не меняет** цель деплоя — после Phase G текущий Render-деплой (`npm run build && node start-preview.mjs`, серверный Nitro-пресет) перестанет работать, потому что `server/api` исчезнет. Куда и как деплоить чисто клиентское приложение (Render как статику, Cloudflare Pages, GitHub Pages и т.п.) — отдельное решение, не часть этого плана; зафиксировано как открытый вопрос в Задаче 18, а не решено молча.
- **`ssr: false` для всего приложения** — подтверждено. IndexedDB существует только в браузере, поэтому ни одна страница с данными о заявках не может рендериться на сервере. План отключает SSR глобально в `nuxt.config.ts`, а не оборачивает каждую страницу в `<ClientOnly>`.
- **ID через `crypto.randomUUID()`** — подтверждено. Заменяет `cuid()` из Prisma для новых записей. Никакой новой зависимости.
- **Импорт разрушительный (replace-all)** — подтверждено. Импорт JSON-экспорта очищает локальную таблицу `jobApplication` и заменяет её содержимым файла после диалога подтверждения в браузере.
- **Экспорт/импорт — JSON всей таблицы, без CSV** — подтверждено. У нас одна сущность (job applications), поэтому отдельный CSV-экспорт был бы дублированием JSON-экспорта. Обе кнопки (Export JSON, Import JSON) находятся на странице `/jobs` (а не на дашборде) — так решил пользователь.
- **Демо-данные** — подтверждено: относительные смещения (`daysAgo`/`daysFromNow`), как уже вычисляет сегодняшний `prisma/seed.ts`, разрешаются в реальные даты в момент заполнения пустой базы, а не в момент генерации `public/data/demo.json`. Это тот же приём, что уже используется в `prisma/seed.ts` сегодня — просто перенесённый на клиент.
- **Пагинация списка заявок остаётся как сейчас** — подтверждено (client-side, page/perPage через `USelectMenu` + Prev/Next), просто считается из полного массива в памяти вместо серверного `skip`/`take`. Изменений в UI `/jobs` не требуется — меняется только то, откуда берутся данные для среза.
- **Ошибки валидации** — подтверждено: сегодня `server/utils/jobs.ts` бросает `createError({ statusCode, data: { fieldErrors } })`, а `app/utils/form-errors.ts` (`extractApiFormFieldErrors`/`handleApiFormError`) разбирает именно такую форму ошибки из ответа `$fetch`. Чтобы не переписывать `JobForm.vue` и обработчики ошибок на страницах, новый репозиторий бросает обычный `Error`, но с тем же полем `.data.fieldErrors`, что и раньше (без `h3`/`createError`, чистый `class RepositoryError extends Error`). Это даёт совместимость с `extractApiFormFieldErrors` почти без изменений на страницах.
- **`app/utils/job-form-errors.ts` и `shared/job-validation-messages.ts` переиспользуются как есть** — подтверждено, они уже не зависят ни от `h3`, ни от Prisma, ни от сервера.

---

## Phase A — Источник истины и основа

### Задача 1: Убрать `isDemo` из схемы Prisma (очистка источника истины)

**Файлы:**
- Изменить: `prisma/schema.prisma`

- [ ] **Шаг 1: Убрать поле `isDemo` и индексы, привязанные только к серверной жизни, оставить форму данных**

Заменить содержимое `prisma/schema.prisma` на:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

// NOTE: as of Step 1 (local-first IndexedDB migration), this schema is no
// longer connected to a live database, generator, or client. It documents
// the shape that app/lib/db/schema.ts (Dexie) mirrors in the browser.

enum JobApplicationStatus {
  SAVED
  APPLIED
  SCREENING
  TECHNICAL_INTERVIEW
  FINAL_INTERVIEW
  OFFER
  REJECTED
  WITHDRAWN
  ARCHIVED
}

model JobApplication {
  id             String               @id @default(cuid())
  company        String
  position       String
  vacancyUrl     String               @unique
  status         JobApplicationStatus @default(SAVED)
  source         String
  salaryMin      Int?
  salaryMax      Int?
  currency       String?
  location       String?
  remoteType     String?
  notes          String?
  appliedAt      DateTime?
  nextFollowUpAt DateTime?
  createdAt      DateTime             @default(now())
  updatedAt      DateTime             @updatedAt

  @@index([status])
  @@index([company])
  @@index([createdAt])

  @@map("job_tracker_job_applications")
}
```

- [ ] **Шаг 2: Проверка**

Выполнить: `npx prisma validate`
Ожидается: `The schema at prisma/schema.prisma is valid 🚀` (схема пока ни к чему не подключена — Phase G удаляет сам тулчейн Prisma).

- [ ] **Шаг 3: Коммит**

```bash
git add prisma/schema.prisma
git commit -m "Drop isDemo from the Prisma schema ahead of the local-first migration"
```

---

### Задача 2: Установить Dexie

**Файлы:**
- Изменить: `package.json`

- [ ] **Шаг 1: Установка**

Выполнить: `npm install dexie`

- [ ] **Шаг 2: Проверка**

Выполнить: `npm ls dexie`
Ожидается: выводит установленную версию `dexie` без ошибки `UNMET DEPENDENCY`.

- [ ] **Шаг 3: Коммит**

```bash
git add package.json package-lock.json
git commit -m "Add Dexie for client-side IndexedDB storage"
```

---

### Задача 3: Создать базу Dexie

**Файлы:**
- Создать: `app/lib/db/schema.ts`

**Интерфейсы:**
- Использует: `JobApplication` (уже существует в `app/utils/job-applications.ts`, полностью совместим — в нём никогда не было `isDemo`).
- Результат: `jobTrackerDb` (экземпляр `JobTrackerDatabase`) с таблицей `jobApplication` — используется репозиторием в Phase B, сидированием в Phase C и экспортом/импортом в Phase E.

- [ ] **Шаг 1: Написать класс базы данных**

```typescript
import Dexie, { type Table } from 'dexie';
import type { JobApplication } from '~/utils/job-applications';

export class JobTrackerDatabase extends Dexie {
  jobApplication!: Table<JobApplication, string>;

  constructor() {
    super('job-tracker');

    this.version(1).stores({
      jobApplication: 'id, status, company, createdAt, vacancyUrl',
    });
  }
}

export const jobTrackerDb = new JobTrackerDatabase();
```

- [ ] **Шаг 2: Проверка**

Выполнить: `npm run typecheck`
Ожидается: никаких новых ошибок из `app/lib/db/schema.ts`.

- [ ] **Шаг 3: Коммит**

```bash
git add app/lib/db/schema.ts
git commit -m "Add the Dexie database mirroring the job application schema"
```

---

### Задача 4: Общие хелперы валидации и ошибка репозитория

**Файлы:**
- Создать: `app/lib/db/validation.ts`
- Создать: `app/lib/db/errors.ts`

**Интерфейсы:**
- Результат: `parseOptionalNumber`, `parseOptionalString`, `RepositoryError` — используются репозиторием в Phase B.
- Переиспользует: `jobValidationMessages`, `jobTextFieldLimits`, `normalizeVacancyUrl` из `shared/job-validation-messages.ts` (без изменений, эти хелперы уже framework-agnostic).

Правила валидации намеренно повторяют то, что сегодня делает `server/utils/jobs.ts` (`parseJobPayload`/`parseJobUpdatePayload`), но без `h3`/`createError` — см. открытое предложение №7.

- [ ] **Шаг 1: Написать `app/lib/db/errors.ts`**

```typescript
export class RepositoryError extends Error {
  data?: { fieldErrors: Record<string, string> };

  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'RepositoryError';

    if (fieldErrors) {
      this.data = { fieldErrors };
    }
  }
}
```

- [ ] **Шаг 2: Написать `app/lib/db/validation.ts`**

```typescript
import {
  jobValidationMessages,
  jobTextFieldLimits,
  type JobTextField,
} from '#shared/job-validation-messages';
import { RepositoryError } from '~/lib/db/errors';

const hasTextLimit = (field: string): field is JobTextField =>
  field in jobTextFieldLimits;

export function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new RepositoryError(jobValidationMessages.required(field), {
      [field]: jobValidationMessages.required(field),
    });
  }

  const trimmed = value.trim();

  if (hasTextLimit(field) && trimmed.length > jobTextFieldLimits[field]) {
    throw new RepositoryError(jobValidationMessages.maxLength(field), {
      [field]: jobValidationMessages.maxLength(field),
    });
  }

  return trimmed;
}

export function optionalString(
  value: unknown,
  field: string,
): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const trimmed = String(value).trim();

  if (hasTextLimit(field) && trimmed.length > jobTextFieldLimits[field]) {
    throw new RepositoryError(jobValidationMessages.maxLength(field), {
      [field]: jobValidationMessages.maxLength(field),
    });
  }

  return trimmed || null;
}

export function optionalNumber(value: unknown, field: string): number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = typeof value === 'number' ? value : Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new RepositoryError(jobValidationMessages.positiveInteger(field), {
      [field]: jobValidationMessages.positiveInteger(field),
    });
  }

  return parsed;
}

export function optionalDate(value: unknown, field: string): Date | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const date = new Date(value as string);

  if (Number.isNaN(date.getTime())) {
    throw new RepositoryError(jobValidationMessages.validDate(field), {
      [field]: jobValidationMessages.validDate(field),
    });
  }

  return date;
}
```

- [ ] **Шаг 3: Проверка**

Выполнить: `npm run typecheck`
Ожидается: никаких новых ошибок.

- [ ] **Шаг 4: Коммит**

```bash
git add app/lib/db/validation.ts app/lib/db/errors.ts
git commit -m "Add repository validation helpers and RepositoryError"
```

---

## Phase B — Репозиторий

### Задача 5: Репозиторий job applications

**Файлы:**
- Создать: `app/lib/db/repositories/jobApplicationRepository.ts`

**Интерфейсы:**
- Использует: `jobTrackerDb` (Задача 3), валидацию из Задачи 4, `JobApplication`/`JobApplicationsResponse`/`JobMetaResponse` (существующие типы из `app/utils/job-applications.ts`), `jobStatusOptions`/`interviewStatuses` (существующие из `app/utils/job-statuses.ts`).
- Результат: `listJobApplications(query)`, `getJobApplication(id)`, `createJobApplication(payload)`, `updateJobApplication(id, payload)`, `deleteJobApplication(id)`, `getJobMeta(query)` — используются дашбордом, страницей списка, формой, детальной страницей и экспортом/импортом (Phase E).
- Повторяет бизнес-правила текущих `server/utils/job-api.ts` и `server/utils/jobs.ts`: обязательные поля, лимиты длины текста, `salaryMin <= salaryMax`, уникальность `vacancyUrl` (после `normalizeVacancyUrl`), группировка `INTERVIEWS` = `SCREENING`+`TECHNICAL_INTERVIEW`+`FINAL_INTERVIEW` — без `isDemo`/`actor`.

- [ ] **Шаг 1: Написать репозиторий**

```typescript
import { normalizeVacancyUrl } from '#shared/job-validation-messages';
import { jobTrackerDb } from '~/lib/db/schema';
import { RepositoryError } from '~/lib/db/errors';
import {
  optionalDate,
  optionalNumber,
  optionalString,
  requiredString,
} from '~/lib/db/validation';
import {
  interviewStatuses,
  jobStatusOptions,
  type JobApplicationStatus,
} from '~/utils/job-statuses';
import type {
  JobApplication,
  JobApplicationsResponse,
  JobMetaResponse,
} from '~/utils/job-applications';

const knownStatuses = new Set(jobStatusOptions.map((option) => option.value));

export type JobQuery = {
  status?: string;
  company?: string;
  search?: string;
  page?: number;
  perPage?: number;
};

function parsePositiveInteger(
  value: number | undefined,
  fallback: number,
): number {
  if (value === undefined) {
    return fallback;
  }

  return Number.isInteger(value) && value >= 1 ? value : fallback;
}

function matchesQuery(
  job: JobApplication,
  query: Pick<JobQuery, 'status' | 'company' | 'search'>,
): boolean {
  if (query.status === 'INTERVIEWS') {
    if (!interviewStatuses.has(job.status)) {
      return false;
    }
  } else if (query.status && job.status !== query.status) {
    return false;
  }

  if (
    query.company &&
    !job.company.toLowerCase().includes(query.company.toLowerCase())
  ) {
    return false;
  }

  if (query.search) {
    const needle = query.search.toLowerCase();
    const haystack = [job.company, job.position, job.source, job.notes ?? '']
      .join(' ')
      .toLowerCase();

    if (!haystack.includes(needle)) {
      return false;
    }
  }

  return true;
}

async function ensureVacancyUrlIsUnique(
  vacancyUrl: string,
  excludeId?: string,
): Promise<void> {
  const normalized = normalizeVacancyUrl(vacancyUrl);
  const all = await jobTrackerDb.jobApplication.toArray();

  const hasConflict = all.some(
    (job) =>
      job.id !== excludeId &&
      normalizeVacancyUrl(job.vacancyUrl) === normalized,
  );

  if (hasConflict) {
    throw new RepositoryError('Vacancy URL already exists', {
      vacancyUrl: 'Vacancy URL already exists',
    });
  }
}

export async function listJobApplications(
  query: JobQuery = {},
): Promise<JobApplicationsResponse> {
  if (query.status && query.status !== 'INTERVIEWS' && !knownStatuses.has(
    query.status as JobApplicationStatus,
  )) {
    throw new RepositoryError('Status is invalid');
  }

  const page = parsePositiveInteger(query.page, 1);
  const perPage = parsePositiveInteger(query.perPage, 20);

  const all = await jobTrackerDb.jobApplication.toArray();
  const filtered = all
    .filter((job) => matchesQuery(job, query))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const total = filtered.length;
  const start = (page - 1) * perPage;
  const items = filtered.slice(start, start + perPage);

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getJobMeta(
  query: Pick<JobQuery, 'company' | 'search'> = {},
): Promise<JobMetaResponse> {
  const all = await jobTrackerDb.jobApplication.toArray();

  const companies = Array.from(new Set(all.map((job) => job.company))).sort();
  const statuses = Array.from(new Set(all.map((job) => job.status))).sort();

  const statsSource = all.filter((job) => matchesQuery(job, query));
  const total = statsSource.length;
  const interviews = statsSource.filter((job) =>
    interviewStatuses.has(job.status),
  ).length;
  const offers = statsSource.filter((job) => job.status === 'OFFER').length;
  const rejections = statsSource.filter(
    (job) => job.status === 'REJECTED',
  ).length;
  const safeTotal = total > 0 ? total : 1;

  return {
    companies,
    statuses,
    stats: {
      total,
      interviews,
      offers,
      rejections,
      interviewRate: total > 0 ? interviews / safeTotal : 0,
      offerRate: total > 0 ? offers / safeTotal : 0,
      rejectionRate: total > 0 ? rejections / safeTotal : 0,
    },
  };
}

export async function getJobApplication(id: string): Promise<JobApplication> {
  const job = await jobTrackerDb.jobApplication.get(id);

  if (!job) {
    throw new RepositoryError('Job application not found');
  }

  return job;
}

function parseJobPayload(payload: Record<string, unknown>) {
  const salaryMin = optionalNumber(payload.salaryMin, 'salaryMin');
  const salaryMax = optionalNumber(payload.salaryMax, 'salaryMax');

  if (salaryMin !== null && salaryMax !== null && salaryMin > salaryMax) {
    throw new RepositoryError('Salary min cannot be greater than salary max', {
      salaryMin: 'Salary min cannot be greater than salary max',
      salaryMax: 'Salary max cannot be lower than salary min',
    });
  }

  const status =
    typeof payload.status === 'string' && knownStatuses.has(
      payload.status as JobApplicationStatus,
    )
      ? (payload.status as JobApplicationStatus)
      : 'SAVED';

  return {
    company: requiredString(payload.company, 'company'),
    position: requiredString(payload.position, 'position'),
    vacancyUrl: requiredString(payload.vacancyUrl, 'vacancyUrl'),
    status,
    source: requiredString(payload.source, 'source'),
    salaryMin,
    salaryMax,
    currency: optionalString(payload.currency, 'currency'),
    location: optionalString(payload.location, 'location'),
    remoteType: optionalString(payload.remoteType, 'remoteType'),
    notes: optionalString(payload.notes, 'notes'),
    appliedAt: optionalDate(payload.appliedAt, 'appliedAt'),
    nextFollowUpAt: optionalDate(payload.nextFollowUpAt, 'nextFollowUpAt'),
  };
}

export async function createJobApplication(
  payload: Record<string, unknown>,
): Promise<JobApplication> {
  const data = parseJobPayload(payload);

  await ensureVacancyUrlIsUnique(data.vacancyUrl);

  const now = new Date().toISOString();
  const record: JobApplication = {
    id: crypto.randomUUID(),
    ...data,
    appliedAt: data.appliedAt?.toISOString() ?? null,
    nextFollowUpAt: data.nextFollowUpAt?.toISOString() ?? null,
    createdAt: now,
    updatedAt: now,
  };

  await jobTrackerDb.jobApplication.add(record);

  return record;
}

export async function updateJobApplication(
  id: string,
  payload: Record<string, unknown>,
): Promise<JobApplication> {
  const existing = await getJobApplication(id);
  const data = parseJobPayload({ ...existing, ...payload });

  if (data.vacancyUrl !== existing.vacancyUrl) {
    await ensureVacancyUrlIsUnique(data.vacancyUrl, id);
  }

  const updated: JobApplication = {
    ...existing,
    ...data,
    appliedAt: data.appliedAt?.toISOString() ?? null,
    nextFollowUpAt: data.nextFollowUpAt?.toISOString() ?? null,
    updatedAt: new Date().toISOString(),
  };

  await jobTrackerDb.jobApplication.put(updated);

  return updated;
}

export async function deleteJobApplication(id: string): Promise<void> {
  await getJobApplication(id);
  await jobTrackerDb.jobApplication.delete(id);
}
```

- [ ] **Шаг 2: Проверка**

Выполнить: `npm run typecheck`
Ожидается: никаких новых ошибок из `app/lib/db/repositories/jobApplicationRepository.ts`.

- [ ] **Шаг 3: Коммит**

```bash
git add app/lib/db/repositories/jobApplicationRepository.ts
git commit -m "Add the local job application repository"
```

---

## Phase C — Демо-данные и заполнение

### Задача 6: Сгенерировать статичный демо-набор данных из `prisma/seed.ts`

**Файлы:**
- Создать: `scripts/generate-demo-data.mjs`
- Создать: `public/data/demo.json`
- Изменить: `package.json` (добавить скрипт `demo:generate`)

**Интерфейсы:**
- Результат: `public/data/demo.json` в форме `{ jobApplications: Array<{ daysAgo?: number, daysFromNow?: number, ...остальные поля JobApplication без id/status-дат-как-Date/createdAt/updatedAt }> }` — используется `app/lib/db/seed.ts` (Задача 7).

Это те же 16 фикстур, что и сегодняшний `prisma/seed.ts`, только `daysAgo(N)`/`daysFromNow(N)` (вызовы, дающие `Date` в момент запуска сида) заменены на плоские поля `daysAgo`/`daysFromNow` (числа), которые превращаются в реальные даты в момент заполнения браузера, а не в момент генерации файла.

- [ ] **Шаг 1: Написать скрипт-генератор**

```javascript
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, '../public/data/demo.json');

// Same 16 fixtures as prisma/seed.ts, with daysAgo(N)/daysFromNow(N) calls
// replaced by flat { daysAgo } / { daysFromNow } fields resolved at seed time.
const jobApplications = [
  {
    company: 'Northstar Labs',
    position: 'Frontend Engineer',
    vacancyUrl: 'https://example.com/jobs/northstar-frontend-engineer',
    status: 'APPLIED',
    source: 'LinkedIn',
    salaryMin: 85000,
    salaryMax: 105000,
    currency: 'USD',
    location: 'Remote, US',
    remoteType: 'Remote',
    notes: 'Applied with portfolio link and Nuxt project highlights.',
    daysAgo: 4,
    nextFollowUpDaysFromNow: 3,
  },
  {
    company: 'Atlas CRM',
    position: 'Full Stack Developer',
    vacancyUrl: 'https://example.com/jobs/atlas-full-stack-developer',
    status: 'SCREENING',
    source: 'Company careers page',
    salaryMin: 90000,
    salaryMax: 120000,
    currency: 'USD',
    location: 'Austin, TX',
    remoteType: 'Hybrid',
    notes: 'Recruiter screen scheduled. Ask about product team ownership.',
    daysAgo: 9,
    nextFollowUpDaysFromNow: 1,
  },
  {
    company: 'Beacon Health',
    position: 'Vue Engineer',
    vacancyUrl: 'https://example.com/jobs/beacon-vue-engineer',
    status: 'TECHNICAL_INTERVIEW',
    source: 'Referral',
    salaryMin: 95000,
    salaryMax: 125000,
    currency: 'USD',
    location: 'Remote, EU/US overlap',
    remoteType: 'Remote',
    notes: 'Technical interview focuses on Vue composables and API design.',
    daysAgo: 14,
    nextFollowUpDaysFromNow: 2,
  },
  {
    company: 'Ledgerly',
    position: 'Product Engineer',
    vacancyUrl: 'https://example.com/jobs/ledgerly-product-engineer',
    status: 'FINAL_INTERVIEW',
    source: 'Wellfound',
    salaryMin: 110000,
    salaryMax: 140000,
    currency: 'USD',
    location: 'New York, NY',
    remoteType: 'Hybrid',
    notes: 'Final round with CTO. Prepare examples about tradeoffs.',
    daysAgo: 21,
    nextFollowUpDaysFromNow: 4,
  },
  {
    company: 'SignalForge',
    position: 'Nuxt Developer',
    vacancyUrl: 'https://example.com/jobs/signalforge-nuxt-developer',
    status: 'SAVED',
    source: 'Hacker News',
    salaryMin: 80000,
    salaryMax: 100000,
    currency: 'USD',
    location: 'Remote',
    remoteType: 'Remote',
    notes: 'Strong fit. Need tailor resume before applying.',
    nextFollowUpDaysFromNow: 5,
  },
  {
    company: 'Riverbank AI',
    position: 'Frontend Platform Engineer',
    vacancyUrl: 'https://example.com/jobs/riverbank-frontend-platform',
    status: 'REJECTED',
    source: 'LinkedIn',
    salaryMin: 120000,
    salaryMax: 155000,
    currency: 'USD',
    location: 'San Francisco, CA',
    remoteType: 'On-site',
    notes: 'Rejected after screening. Needed more design system experience.',
    daysAgo: 28,
  },
  {
    company: 'CraftDesk',
    position: 'Senior UI Engineer',
    vacancyUrl: 'https://example.com/jobs/craftdesk-senior-ui-engineer',
    status: 'OFFER',
    source: 'Recruiter',
    salaryMin: 115000,
    salaryMax: 135000,
    currency: 'USD',
    location: 'Remote, US',
    remoteType: 'Remote',
    notes: 'Offer received. Compare benefits and equity terms.',
    daysAgo: 35,
    nextFollowUpDaysFromNow: 1,
  },
  {
    company: 'OrbitOps',
    position: 'Dashboard Engineer',
    vacancyUrl: 'https://example.com/jobs/orbitops-dashboard-engineer',
    status: 'APPLIED',
    source: 'Indeed',
    salaryMin: 78000,
    salaryMax: 98000,
    currency: 'USD',
    location: 'Chicago, IL',
    remoteType: 'Hybrid',
    notes: 'Role is dashboard-heavy. Good portfolio angle.',
    daysAgo: 2,
    nextFollowUpDaysFromNow: 6,
  },
  {
    company: 'BluePeak Systems',
    position: 'Software Engineer II',
    vacancyUrl: 'https://example.com/jobs/bluepeak-software-engineer-ii',
    status: 'ARCHIVED',
    source: 'Company careers page',
    salaryMin: 70000,
    salaryMax: 90000,
    currency: 'USD',
    location: 'Denver, CO',
    remoteType: 'On-site',
    notes: 'Archived because relocation requirement is too strict.',
    daysAgo: 40,
  },
  {
    company: 'HirePilot',
    position: 'Full Stack TypeScript Engineer',
    vacancyUrl: 'https://example.com/jobs/hirepilot-typescript-engineer',
    status: 'SCREENING',
    source: 'Twitter',
    salaryMin: 100000,
    salaryMax: 130000,
    currency: 'USD',
    location: 'Remote',
    remoteType: 'Remote',
    notes: 'Screening call complete. Waiting for take-home assignment.',
    daysAgo: 11,
    nextFollowUpDaysAgo: 1,
  },
  {
    company: 'MetricHouse',
    position: 'Analytics UI Developer',
    vacancyUrl: 'https://example.com/jobs/metrichouse-analytics-ui',
    status: 'TECHNICAL_INTERVIEW',
    source: 'LinkedIn',
    salaryMin: 88000,
    salaryMax: 115000,
    currency: 'USD',
    location: 'Boston, MA',
    remoteType: 'Hybrid',
    notes: 'Prepare chart accessibility and table performance examples.',
    daysAgo: 17,
    nextFollowUpDaysFromNow: 7,
  },
  {
    company: 'GreenGrid',
    position: 'Climate Tech Frontend Engineer',
    vacancyUrl: 'https://example.com/jobs/greengrid-frontend',
    status: 'APPLIED',
    source: 'Otta',
    salaryMin: 82000,
    salaryMax: 108000,
    currency: 'USD',
    location: 'Remote, Europe',
    remoteType: 'Remote',
    notes: 'Mission-aligned role. Mention data visualization work.',
    daysAgo: 6,
    nextFollowUpDaysFromNow: 2,
  },
  {
    company: 'StackFoundry',
    position: 'Application Developer',
    vacancyUrl: 'https://example.com/jobs/stackfoundry-app-developer',
    status: 'SAVED',
    source: 'Glassdoor',
    salaryMin: 75000,
    salaryMax: 95000,
    currency: 'USD',
    location: 'Remote',
    remoteType: 'Remote',
    notes: 'Review job description again before applying.',
    nextFollowUpDaysFromNow: 8,
  },
  {
    company: 'BrightCart',
    position: 'E-commerce Frontend Engineer',
    vacancyUrl: 'https://example.com/jobs/brightcart-frontend',
    status: 'REJECTED',
    source: 'Recruiter',
    salaryMin: 90000,
    salaryMax: 115000,
    currency: 'USD',
    location: 'Seattle, WA',
    remoteType: 'Hybrid',
    notes: 'Rejected after technical interview. Improve testing examples.',
    daysAgo: 31,
  },
  {
    company: 'CoreBridge',
    position: 'Backend-leaning Full Stack Engineer',
    vacancyUrl: 'https://example.com/jobs/corebridge-full-stack',
    status: 'FINAL_INTERVIEW',
    source: 'Referral',
    salaryMin: 105000,
    salaryMax: 145000,
    currency: 'USD',
    location: 'Remote, US',
    remoteType: 'Remote',
    notes: 'Final conversation about backend depth and ownership.',
    daysAgo: 24,
    nextFollowUpDaysFromNow: 3,
  },
  {
    company: 'PixelRail',
    position: 'Design Systems Engineer',
    vacancyUrl: 'https://example.com/jobs/pixelrail-design-systems',
    status: 'APPLIED',
    source: 'Company careers page',
    salaryMin: 98000,
    salaryMax: 128000,
    currency: 'USD',
    location: 'Portland, OR',
    remoteType: 'Hybrid',
    notes: 'Highlight component library and accessibility experience.',
    daysAgo: 1,
    nextFollowUpDaysFromNow: 9,
  },
];

writeFileSync(
  outputPath,
  `${JSON.stringify({ jobApplications }, null, 2)}\n`,
  'utf-8',
);

console.log(`Demo data written to ${outputPath}`);
console.log(`Seeded ${jobApplications.length} job applications.`);
```

Примечание: у записи `HirePilot` follow-up в исходном `prisma/seed.ts` — `daysAgo(1)` (просроченный follow-up), поэтому здесь `nextFollowUpDaysAgo: 1`, а не `nextFollowUpDaysFromNow`; у остальных — `nextFollowUpDaysFromNow`, как в оригинале.

- [ ] **Шаг 2: Добавить npm-скрипт**

В `package.json`, внутри `"scripts"`, добавить:

```json
"demo:generate": "node scripts/generate-demo-data.mjs",
```

- [ ] **Шаг 3: Запустить, чтобы получить `public/data/demo.json`**

Выполнить: `npm run demo:generate`
Ожидается: выводит `Demo data written to .../public/data/demo.json` и `Seeded 16 job applications.`; `public/data/demo.json` теперь существует.

- [ ] **Шаг 4: Коммит**

```bash
git add scripts/generate-demo-data.mjs public/data/demo.json package.json
git commit -m "Add the static demo dataset and its generator script"
```

---

### Задача 7: Заполнить пустую базу из демо-набора

**Файлы:**
- Создать: `app/lib/db/seed.ts`
- Создать: `app/plugins/seed-demo-data.client.ts`

**Интерфейсы:**
- Использует: `jobTrackerDb` (Задача 3), `public/data/demo.json` (Задача 6).
- Результат: `seedDemoDataIfEmpty()`, вызывается один раз при старте приложения плагином.

- [ ] **Шаг 1: Написать логику заполнения**

```typescript
import { jobTrackerDb } from '~/lib/db/schema';
import type { JobApplication } from '~/utils/job-applications';
import type { JobApplicationStatus } from '~/utils/job-statuses';

type DemoJobApplication = {
  company: string;
  position: string;
  vacancyUrl: string;
  status: JobApplicationStatus;
  source: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  location?: string;
  remoteType?: string;
  notes?: string;
  daysAgo?: number;
  nextFollowUpDaysFromNow?: number;
  nextFollowUpDaysAgo?: number;
};

type DemoDataFile = {
  jobApplications: DemoJobApplication[];
};

function resolveDaysAgo(days: number): string {
  const date = new Date();
  date.setHours(9, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function resolveDaysFromNow(days: number): string {
  const date = new Date();
  date.setHours(10, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export async function seedDemoDataIfEmpty(): Promise<void> {
  const count = await jobTrackerDb.jobApplication.count();

  if (count > 0) {
    return;
  }

  const demoData = await $fetch<DemoDataFile>('/data/demo.json');
  const now = new Date().toISOString();

  const records: JobApplication[] = demoData.jobApplications.map((entry) => ({
    id: crypto.randomUUID(),
    company: entry.company,
    position: entry.position,
    vacancyUrl: entry.vacancyUrl,
    status: entry.status,
    source: entry.source,
    salaryMin: entry.salaryMin ?? null,
    salaryMax: entry.salaryMax ?? null,
    currency: entry.currency ?? null,
    location: entry.location ?? null,
    remoteType: entry.remoteType ?? null,
    notes: entry.notes ?? null,
    appliedAt:
      entry.daysAgo !== undefined ? resolveDaysAgo(entry.daysAgo) : null,
    nextFollowUpAt:
      entry.nextFollowUpDaysFromNow !== undefined
        ? resolveDaysFromNow(entry.nextFollowUpDaysFromNow)
        : entry.nextFollowUpDaysAgo !== undefined
          ? resolveDaysAgo(entry.nextFollowUpDaysAgo)
          : null,
    createdAt: now,
    updatedAt: now,
  }));

  await jobTrackerDb.jobApplication.bulkAdd(records);
}
```

- [ ] **Шаг 2: Подключить к старту приложения**

```typescript
import { seedDemoDataIfEmpty } from '~/lib/db/seed';

export default defineNuxtPlugin(async () => {
  await seedDemoDataIfEmpty();
});
```

- [ ] **Шаг 3: Проверка**

Выполнить: `npm run typecheck`
Ожидается: никаких новых ошибок.

Ручная проверка (разработчик, после того как приложение заработает в Phase D/E): открыть приложение с очищенным хранилищем браузера для dev-origin (DevTools → Application → IndexedDB → удалить `job-tracker`), убедиться, что `/jobs` и дашборд показывают 16 засеянных заявок с датами, выглядящими свежими; перезагрузить страницу и убедиться, что данные остались и не были засеяны повторно (счётчик остаётся на 16, а не 32).

- [ ] **Шаг 4: Коммит**

```bash
git add app/lib/db/seed.ts app/plugins/seed-demo-data.client.ts
git commit -m "Seed the local database from the demo dataset on first run"
```

---

## Phase D — Конфигурация Nuxt и снятие авторизации

### Задача 8: Сделать приложение только клиентским, убрать модуль Supabase

**Файлы:**
- Изменить: `nuxt.config.ts`

- [ ] **Шаг 1: Обновить конфиг**

Заменить содержимое `nuxt.config.ts` на:

```typescript
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/ui', '@pinia/nuxt'],
  ssr: false,
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          href: '/favicon-16.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon-32.png',
        },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
    },
  },
});
```

Убраны: `@nuxtjs/supabase` из `modules`, блок `supabase: { redirect: false }`, `routeRules['/auth/callback']` (страница `auth/callback.vue` удаляется в этой же задаче — см. Шаг 2). Пакет `@nuxtjs/supabase` пока остаётся установленным, но неиспользуемым — он удаляется вместе с остальным бэкендом в Phase G; так проще держать чистый typecheck на каждом шаге.

- [ ] **Шаг 2: Проверка**

Выполнить: `npm run typecheck`
Ожидается: новые ошибки в файлах, использующих `useSupabaseUser`/`useSupabaseClient`/`serverSupabaseUser` (`app/components/auth/Login.vue`, `app/components/auth/Logout.vue`, `app/pages/auth/callback.vue`, `app/layouts/default.vue`, `server/utils/auth.ts`) — ожидаемо, исправляется в Задаче 9.

- [ ] **Шаг 3: Коммит**

```bash
git add nuxt.config.ts
git commit -m "Run the app client-only; drop the Supabase module wiring"
```

---

### Задача 9: Убрать UI авторизации

**Файлы:**
- Изменить: `app/layouts/default.vue`
- Удалить: `app/components/auth/Login.vue`
- Удалить: `app/components/auth/Logout.vue`
- Удалить: `app/pages/auth/callback.vue`
- Удалить: `app/plugins/auth-refresh.client.ts`

**Интерфейсы:**
- Результат: шапка приложения показывает только логотип (без скрытой формы логина) и основную навигацию — никакого состояния входа нигде во фронтенде.

- [ ] **Шаг 1: Удалить файлы авторизации**

```bash
git rm app/components/auth/Login.vue app/components/auth/Logout.vue app/pages/auth/callback.vue app/plugins/auth-refresh.client.ts
```

- [ ] **Шаг 2: Обновить `app/layouts/default.vue`**

Заменить:

```html
<UContainer class="flex h-16 items-center justify-between gap-6">
  <AuthLogin />

  <div class="hidden md:block">
    <MainMenu />
  </div>

  <div class="flex items-center gap-2">
    <ClientOnly>
      <AuthLogout />
    </ClientOnly>

    <UButton to="/jobs/new" icon="i-lucide-plus" size="sm">
      New application
    </UButton>
  </div>
</UContainer>
```

На:

```html
<UContainer class="flex h-16 items-center justify-between gap-6">
  <NuxtLink to="/" class="flex items-center gap-3">
    <span
      class="flex size-9 items-center justify-center rounded-md bg-primary text-sm font-semibold text-inverted"
    >
      JT
    </span>
    <span class="text-sm font-semibold text-highlighted">
      Job Tracker
    </span>
  </NuxtLink>

  <div class="hidden md:block">
    <MainMenu />
  </div>

  <div class="flex items-center gap-2">
    <UButton to="/jobs/new" icon="i-lucide-plus" size="sm">
      New application
    </UButton>
  </div>
</UContainer>
```

- [ ] **Шаг 3: Проверка**

Выполнить: `npm run typecheck`
Ожидается: никаких ошибок, связанных с Supabase, во фронтенде (`server/utils/auth.ts` всё ещё существует и импортирует `#supabase/server` — это ожидаемо до Phase G, но им уже никто не пользуется на клиенте, так как страницы Phase E будут вызывать репозиторий напрямую, минуя `getRequestActor`; сам `server/utils/auth.ts` перестаёт вызываться после Задачи 10).

- [ ] **Шаг 4: Коммит**

```bash
git add app/layouts/default.vue
git commit -m "Remove the auth UI; the app has no login anymore"
```

---

## Phase E — Подключить страницы и компоненты к локальному слою данных

### Задача 10: Подключить список заявок (`/jobs`) к репозиторию

**Файлы:**
- Изменить: `app/pages/jobs/index.vue`

**Интерфейсы:**
- Использует: `listJobApplications`, `getJobMeta` (Задача 5).
- `JobsStatusCards.vue` и `JobsListFilters.vue` не меняются — они уже принимают `jobMeta` как проп и ничего не знают о транспорте данных.

- [ ] **Шаг 1: Заменить блок загрузки данных**

Заменить:

```typescript
const {
  data: jobPage,
  pending,
  error,
  refresh,
} = await useFetch<JobApplicationsResponse>('/api/jobs', {
  query: listQuery,
});

const {
  data: jobMeta,
  pending: metaPending,
  error: metaError,
  refresh: refreshMeta,
} = await useFetch<JobMetaResponse>('/api/jobs/meta', {
  query: computed(() => ({
    company: selectedCompanyFilter.value,
    search: normalizedSearch.value || undefined,
  })),
});
```

На:

```typescript
import {
  getJobMeta,
  listJobApplications,
} from '~/lib/db/repositories/jobApplicationRepository';

const jobPage = ref<JobApplicationsResponse>();
const jobMeta = ref<JobMetaResponse>();
const pending = ref(false);
const metaPending = ref(false);
const error = ref<Error | null>(null);
const metaError = ref<Error | null>(null);

async function refresh() {
  pending.value = true;
  error.value = null;

  try {
    jobPage.value = await listJobApplications(listQuery.value);
  } catch (fetchError) {
    error.value = fetchError as Error;
  } finally {
    pending.value = false;
  }
}

async function refreshMeta() {
  metaPending.value = true;
  metaError.value = null;

  try {
    jobMeta.value = await getJobMeta({
      company: selectedCompanyFilter.value,
      search: normalizedSearch.value || undefined,
    });
  } catch (fetchError) {
    metaError.value = fetchError as Error;
  } finally {
    metaPending.value = false;
  }
}

watch(listQuery, refresh, { immediate: true });
watch(
  () => [selectedCompanyFilter.value, normalizedSearch.value],
  refreshMeta,
  { immediate: true },
);
```

(Остальная часть `<script setup>` — вычисляемые `jobList`/`totalItems`/`totalPages`/`pageStart`/`pageEnd`, `watch` для сброса страницы, `refreshAll`, тосты об ошибках — не меняется; шаблон тоже не меняется.)

- [ ] **Шаг 2: Добавить кнопки экспорта/импорта JSON (см. Задачу 13 — реализация модуля экспорта/импорта там; здесь только разметка и импорт компонента)**

Эта часть выполняется в Задаче 13 вместе с самим модулем `export-import.ts`, чтобы не создавать промежуточный битый импорт. На этом шаге ничего дополнительно не добавляем.

- [ ] **Шаг 3: Проверка**

Выполнить: `npm run typecheck`
Ожидается: никаких новых ошибок из `app/pages/jobs/index.vue`.

Ручная проверка (разработчик, после Задачи 12): открыть `/jobs`, убедиться, что рендерятся 16 засеянных заявок, фильтры по статусу/компании/поиску работают, пагинация работает.

- [ ] **Шаг 4: Коммит**

```bash
git add app/pages/jobs/index.vue
git commit -m "Wire the jobs list page to the local repository"
```

---

### Задача 11: Подключить дашборд (`/`) к репозиторию

**Файлы:**
- Изменить: `app/pages/index.vue`

**Интерфейсы:**
- Использует: `listJobApplications`, `getJobMeta` (Задача 5). `DashboardOverview.vue`, `DashboardFollowUpQueue.vue`, `DashboardRecentApplications.vue`, `DashboardStatusSummary.vue` не меняются — они принимают `jobs`/`stats` как props.

- [ ] **Шаг 1: Заменить блок загрузки данных**

Заменить:

```typescript
const dashboardPageSize = 100;

const fetchJobsPage = (page: number) =>
  $fetch<JobApplicationsResponse>('/api/jobs', {
    query: {
      page,
      perPage: dashboardPageSize,
    },
  });

const {
  data: allJobs,
  pending,
  error,
  refresh,
} = await useAsyncData('dashboard-jobs', async () => {
  const firstPage = await fetchJobsPage(1);
  const jobs: JobApplication[] = [...firstPage.items];

  if (firstPage.totalPages > 1) {
    const pageNumbers = Array.from(
      { length: firstPage.totalPages - 1 },
      (_, index) => index + 2,
    );
    const pages = await Promise.all(pageNumbers.map(fetchJobsPage));

    for (const page of pages) {
      jobs.push(...page.items);
    }
  }

  return jobs;
});

const { data: dashboardMeta } =
  await useFetch<JobMetaResponse>('/api/jobs/meta');
```

На:

```typescript
import {
  getJobMeta,
  listJobApplications,
} from '~/lib/db/repositories/jobApplicationRepository';

const allJobs = ref<JobApplication[]>([]);
const dashboardMeta = ref<JobMetaResponse>();
const pending = ref(false);
const error = ref<Error | null>(null);

async function refresh() {
  pending.value = true;
  error.value = null;

  try {
    const [page, meta] = await Promise.all([
      listJobApplications({ perPage: Number.MAX_SAFE_INTEGER }),
      getJobMeta(),
    ]);

    allJobs.value = page.items;
    dashboardMeta.value = meta;
  } catch (fetchError) {
    error.value = fetchError as Error;
  } finally {
    pending.value = false;
  }
}

await refresh();
```

- [ ] **Шаг 2: Обновить привязки в шаблоне**

Заменить `:stats="dashboardMeta?.stats"` — без изменений (уже так называется в `dashboardMeta`). Заменить `jobs` (было `computed(() => allJobs.value ?? [])`) — убрать этот `computed`, использовать `allJobs` напрямую в шаблоне (`:jobs="allJobs"` вместо `:jobs="jobs"` в трёх местах: `DashboardOverview`, `DashboardFollowUpQueue`, `DashboardRecentApplications`, `DashboardStatusSummary`).

- [ ] **Шаг 3: Проверка**

Выполнить: `npm run typecheck`
Ожидается: никаких новых ошибок из `app/pages/index.vue`.

Ручная проверка (разработчик): открыть `/`, убедиться, что дашборд показывает суммарную статистику и списки по 16 засеянным заявкам.

- [ ] **Шаг 4: Коммит**

```bash
git add app/pages/index.vue
git commit -m "Wire the dashboard to the local repository"
```

---

### Задача 12: Подключить создание, редактирование, детальную страницу и удаление

**Файлы:**
- Изменить: `app/pages/jobs/new.vue`
- Изменить: `app/pages/jobs/[id]/edit.vue`
- Изменить: `app/pages/jobs/[id]/index.vue`
- Изменить: `app/components/jobs/DeleteJob.vue`

**Интерфейсы:**
- Использует: `createJobApplication`, `updateJobApplication`, `getJobApplication`, `deleteJobApplication` (Задача 5).
- `JobsJobForm.vue` не меняется — он уже только формирует значение и эмитит `submit`/`clear-server-error`, ничего не зная о транспорте.
- `handleApiFormError`/`extractApiFormFieldErrors` (`app/utils/form-errors.ts`) не меняются — благодаря открытому предложению №7 (`RepositoryError.data.fieldErrors`) они продолжают работать без изменений.

- [ ] **Шаг 1: Обновить `app/pages/jobs/new.vue`**

Заменить:

```typescript
const createJob = async (value: Record<string, unknown>) => {
  pending.value = true;
  serverFieldErrors.value = {};

  try {
    const job = await $fetch<{ id: string }>('/api/jobs', {
      method: 'POST',
      body: value,
    });

    toast.add({ title: 'Application created', color: 'success' });
    await router.push(`/jobs/${job.id}`);
  } catch (error) {
    if (
      handleApiFormError({
        error,
        fields: jobFormFields,
        setFieldError: setServerError,
        showToast: (message) => {
          toast.add({ title: message, color: 'error' });
        },
        fallbackMessage: 'Failed to create application',
      })
    ) {
      return;
    }
  } finally {
    pending.value = false;
  }
};
```

На:

```typescript
import { createJobApplication } from '~/lib/db/repositories/jobApplicationRepository';

const createJob = async (value: Record<string, unknown>) => {
  pending.value = true;
  serverFieldErrors.value = {};

  try {
    const job = await createJobApplication(value);

    toast.add({ title: 'Application created', color: 'success' });
    await router.push(`/jobs/${job.id}`);
  } catch (error) {
    if (
      handleApiFormError({
        error,
        fields: jobFormFields,
        setFieldError: setServerError,
        showToast: (message) => {
          toast.add({ title: message, color: 'error' });
        },
        fallbackMessage: 'Failed to create application',
      })
    ) {
      return;
    }
  } finally {
    pending.value = false;
  }
};
```

- [ ] **Шаг 2: Обновить `app/pages/jobs/[id]/edit.vue`**

Заменить блок загрузки:

```typescript
const { data: job, error } = await useFetch<JobApplication>(
  () => `/api/jobs/${id.value}`,
);
```

На:

```typescript
import { getJobApplication, updateJobApplication } from '~/lib/db/repositories/jobApplicationRepository';

const job = ref<JobApplication>();
const error = ref<Error | null>(null);

try {
  job.value = await getJobApplication(id.value);
} catch (loadError) {
  error.value = loadError as Error;
}
```

Заменить `updateJob`:

```typescript
const updateJob = async (value: Record<string, unknown>) => {
  pending.value = true;
  serverFieldErrors.value = {};

  try {
    await updateJobApplication(id.value, value);

    toast.add({ title: 'Application updated', color: 'success' });
    await router.push(`/jobs/${id.value}`);
  } catch (updateError) {
    if (
      handleApiFormError({
        error: updateError,
        fields: jobFormFields,
        setFieldError: setServerError,
        showToast: (message) => {
          toast.add({ title: message, color: 'error' });
        },
        fallbackMessage: 'Failed to update application',
      })
    ) {
      return;
    }
  } finally {
    pending.value = false;
  }
};
```

(Убрать неиспользуемый `updateEndpoint`.)

- [ ] **Шаг 3: Обновить `app/pages/jobs/[id]/index.vue`**

Заменить блок загрузки и `updateStatus`:

```typescript
import { getJobApplication, updateJobApplication } from '~/lib/db/repositories/jobApplicationRepository';

const job = ref<JobApplication>();
const error = ref<Error | null>(null);

async function loadJob() {
  try {
    job.value = await getJobApplication(id.value);
    error.value = null;
  } catch (loadError) {
    error.value = loadError as Error;
  }
}

await loadJob();

const updateStatus = async (status: JobApplicationStatus) => {
  if (!job.value || job.value.status === status) {
    return;
  }

  statusPending.value = true;
  errorMessage.value = '';

  try {
    job.value = await updateJobApplication(id.value, { status });
  } catch (statusError) {
    errorMessage.value =
      statusError instanceof Error
        ? statusError.message
        : 'Failed to update status';
  } finally {
    statusPending.value = false;
  }
};
```

- [ ] **Шаг 4: Обновить `app/components/jobs/DeleteJob.vue`**

Заменить:

```typescript
const deleteJob = async () => {
  deletePending.value = true;

  try {
    await $fetch(deleteEndpoint.value, {
      method: 'DELETE',
    });

    open.value = false;
    toast.add({ title: 'Application deleted', color: 'success' });
    await router.push('/jobs');
  } catch (deleteError) {
    const errorMessage =
      deleteError instanceof Error
        ? deleteError.message
        : 'Failed to delete application';
    toast.add({ title: errorMessage, color: 'error' });
  } finally {
    deletePending.value = false;
  }
};
```

На:

```typescript
import { deleteJobApplication } from '~/lib/db/repositories/jobApplicationRepository';

const deleteJob = async () => {
  deletePending.value = true;

  try {
    await deleteJobApplication(props.jobId);

    open.value = false;
    toast.add({ title: 'Application deleted', color: 'success' });
    await router.push('/jobs');
  } catch (deleteError) {
    const errorMessage =
      deleteError instanceof Error
        ? deleteError.message
        : 'Failed to delete application';
    toast.add({ title: errorMessage, color: 'error' });
  } finally {
    deletePending.value = false;
  }
};
```

(Убрать неиспользуемый `deleteEndpoint`.)

- [ ] **Шаг 5: Проверка**

Выполнить: `npm run typecheck`
Ожидается: никаких новых ошибок ни в одном из четырёх файлов.

Ручная проверка (разработчик): создать новую заявку (проверить ошибку валидации, например пустую компанию, и ошибку дубликата `vacancyUrl`), убедиться, что попадает на детальную страницу; отредактировать её; поменять статус на детальной странице через селект; удалить заявку и убедиться, что список обновился.

- [ ] **Шаг 6: Коммит**

```bash
git add app/pages/jobs/new.vue "app/pages/jobs/[id]/edit.vue" "app/pages/jobs/[id]/index.vue" app/components/jobs/DeleteJob.vue
git commit -m "Wire create, edit, detail, and delete flows to the local repository"
```

---

### Задача 13: Экспорт/импорт JSON на странице `/jobs`

**Файлы:**
- Создать: `app/lib/db/export-import.ts`
- Создать: `app/components/jobs/DataActions.vue`
- Изменить: `app/pages/jobs/index.vue`

**Интерфейсы:**
- Использует: `jobTrackerDb` (Задача 3).
- Результат: `exportJobApplicationsData()`, `downloadJobApplicationsExport()`, `importJobApplicationsData(file)` — используются только `JobsDataActions.vue`.

- [ ] **Шаг 1: Написать модуль экспорта/импорта**

```typescript
import { jobTrackerDb } from '~/lib/db/schema';
import type { JobApplication } from '~/utils/job-applications';

export type JobApplicationsExport = {
  version: 1;
  exportedAt: string;
  data: {
    jobApplications: JobApplication[];
  };
};

export async function exportJobApplicationsData(): Promise<JobApplicationsExport> {
  const jobApplications = await jobTrackerDb.jobApplication.toArray();

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: { jobApplications },
  };
}

export function downloadJobApplicationsExport(
  exportData: JobApplicationsExport,
): void {
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `job-applications-export-${exportData.exportedAt.slice(0, 10)}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

export async function importJobApplicationsData(file: File): Promise<void> {
  const text = await file.text();
  const parsed = JSON.parse(text) as JobApplicationsExport;

  if (parsed.version !== 1 || !parsed.data?.jobApplications) {
    throw new Error('Unsupported export file format');
  }

  await jobTrackerDb.transaction(
    'rw',
    jobTrackerDb.jobApplication,
    async () => {
      await jobTrackerDb.jobApplication.clear();
      await jobTrackerDb.jobApplication.bulkAdd(parsed.data.jobApplications);
    },
  );
}
```

- [ ] **Шаг 2: Написать `app/components/jobs/DataActions.vue`**

```vue
<script setup lang="ts">
import {
  downloadJobApplicationsExport,
  exportJobApplicationsData,
  importJobApplicationsData,
} from '~/lib/db/export-import';

const emit = defineEmits<{
  imported: [];
}>();

const toast = useToast();
const fileInput = ref<HTMLInputElement | null>(null);
const importing = ref(false);

async function exportData() {
  const exportData = await exportJobApplicationsData();
  downloadJobApplicationsExport(exportData);
}

function openImportDialog() {
  fileInput.value?.click();
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  const confirmed = window.confirm(
    'Importing will replace all local job applications with the contents of this file. Continue?',
  );

  if (!confirmed) {
    input.value = '';
    return;
  }

  try {
    importing.value = true;
    await importJobApplicationsData(file);

    toast.add({
      title: 'Import complete',
      description: 'The local job applications were replaced with the imported file.',
    });

    emit('imported');
  } catch (error) {
    toast.add({
      title: 'Import failed',
      description: error instanceof Error ? error.message : 'Could not import the file',
      color: 'error',
    });
  } finally {
    importing.value = false;
    input.value = '';
  }
}
</script>

<template>
  <div class="flex items-center gap-2">
    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-download"
      @click="exportData"
    >
      Export JSON
    </UButton>
    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-upload"
      :loading="importing"
      @click="openImportDialog"
    >
      Import JSON
    </UButton>
    <input
      ref="fileInput"
      type="file"
      accept="application/json"
      class="sr-only"
      @change="handleFileChange"
    >
  </div>
</template>
```

- [ ] **Шаг 3: Добавить компонент на страницу `/jobs`**

В `app/pages/jobs/index.vue`, в блок заголовка страницы (рядом с "Applications"/описанием), добавить:

```html
<div
  class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
>
  <div>
    <h1 class="text-2xl font-semibold tracking-tight text-highlighted">
      Applications
    </h1>
    <p class="mt-1 text-sm text-muted">
      Track active applications, interview stages, and follow-ups.
    </p>
  </div>

  <JobsDataActions @imported="refreshAll" />
</div>
```

- [ ] **Шаг 4: Проверка**

Выполнить: `npm run typecheck`
Ожидается: никаких новых ошибок из `export-import.ts`, `DataActions.vue` или `jobs/index.vue`.

Ручная проверка (разработчик): открыть `/jobs`, нажать «Export JSON», убедиться, что скачивается файл с массивом `jobApplications`; нажать «Import JSON» с этим же файлом, подтвердить диалог в браузере, убедиться, что список не изменился по содержимому (импорт того же экспорта — no-op по данным); отредактировать один статус, импортировать снова тот же файл и убедиться, что изменение статуса откатилось (импорт — replace-all).

- [ ] **Шаг 5: Коммит**

```bash
git add app/lib/db/export-import.ts app/components/jobs/DataActions.vue app/pages/jobs/index.vue
git commit -m "Add JSON export/import for job applications on the jobs page"
```

---

## Phase F — Проверить новый путь, прежде чем трогать старый бэкенд

### Задача 14: Полный проход проверки

**Файлы:** нет (только проверка)

- [ ] **Шаг 1: Проверка типов**

Выполнить: `npm run typecheck` (или эквивалент — уточнить точное имя скрипта в `package.json`, если `typecheck` там не заведён; на момент написания плана в `package.json` нет отдельного `typecheck`, значит первым шагом этой задачи нужно добавить `"typecheck": "nuxt typecheck"` в `scripts`, если ещё не существует).
Ожидается: никаких ошибок нигде в `app/`.

- [ ] **Шаг 2: Линтер**

Выполнить: `npm run lint`
Ожидается: никаких ошибок. `server/`, `prisma/`, `test/server-api.test.ts` на этом этапе всё ещё существуют и по-прежнему проходят линт чисто — они удаляются в Phase G, а не изменяются здесь.

- [ ] **Шаг 3: Сборка**

Выполнить: `npm run build`
Ожидается: сборка проходит успешно. Поскольку в Задаче 8 выставлен `ssr: false`, это даёт только клиентский бандл; `server/api` всё ещё существует, но теперь не используется ни одной страницей.

- [ ] **Шаг 4: Ручное дымовое тестирование (разработчик)**

С очищенной IndexedDB для dev-origin (DevTools браузера → Application → IndexedDB → удалить `job-tracker`):

1. Открыть приложение — дашборд показывает 16 засеянных заявок и статистику.
2. Открыть `/jobs` — список показывает 16 строк, фильтры по статусу/компании/поиску работают, пагинация работает.
3. Создать новую заявку, попробовать создать с уже существующим `vacancyUrl` — должна показаться ошибка "Vacancy URL already exists" под полем.
4. Открыть детальную страницу заявки, поменять статус через селект, убедиться, что изменение сохранилось после перезагрузки страницы.
5. Отредактировать заявку через страницу `/jobs/:id/edit`, убедиться, что изменения сохранились.
6. Удалить заявку, убедиться, что список и дашборд обновились.
7. На `/jobs` нажать «Export JSON», убедиться, что скачивается файл со всеми текущими заявками.
8. Импортировать этот файл через «Import JSON» — убедиться, что появляется диалог подтверждения браузера, и после подтверждения список соответствует экспортированному снимку.
9. Полностью перезагрузить приложение (жёсткая перезагрузка) — убедиться, что демо-данные не пересеваются заново (счётчик не удваивается) и все изменения сохранились.
10. Убедиться, что нигде в UI не осталось следов входа/авторизации (ни формы логина, ни кнопки Sign Out).

Не автоматизировать это инструментом, управляющим браузером, если не попросили — это ручной проход разработчика согласно общим инструкциям проекта.

- [ ] **Шаг 5: Отчёт и пауза**

Не переходить к Phase G, пока разработчик не подтвердит, что все проверки из Шага 4 прошли. Если что-то не работает — исправить и заново пройти Шаги 1–4, прежде чем двигаться дальше.

---

## Phase G — Убрать старый бэкенд (только после того, как Phase F подтверждена)

### Задача 15: Удалить серверный API и серверные утилиты

**Файлы:**
- Удалить: `server/api/` (весь каталог)
- Удалить: `server/utils/prisma.ts`, `server/utils/job-api.ts`, `server/utils/jobs.ts`, `server/utils/auth.ts`
- Удалить: `test/server-api.test.ts`

- [ ] **Шаг 1: Удалить файлы**

```bash
git rm -r server/api
git rm server/utils/prisma.ts server/utils/job-api.ts server/utils/jobs.ts server/utils/auth.ts
git rm test/server-api.test.ts
```

- [ ] **Шаг 2: Проверка**

Выполнить: `npm run typecheck && npm run lint`
Ожидается: никаких ошибок — после Phase E ничего в `app/` не импортирует из `server/`.

- [ ] **Шаг 3: Коммит**

```bash
git commit -m "Remove the server API and server-side data/auth utilities"
```

---

### Задача 16: Убрать зависимости бэкенда, скрипты и тулчейн Prisma

**Файлы:**
- Изменить: `package.json`
- Удалить: `prisma/seed.ts`, `prisma.config.ts`, `generated/prisma`
- Оставить: `prisma/schema.prisma` (в урезанном виде, только как документация — уже сделано в Задаче 1)

- [ ] **Шаг 1: Убрать рантайм-зависимости бэкенда**

Выполнить:

```bash
npm uninstall @nuxtjs/supabase @prisma/adapter-pg @prisma/client prisma dotenv
```

Оставить `tsx`, только если на него по-прежнему ссылается что-то за пределами `prisma/` и `server/` (например `package.json` → `test`); на момент написания плана `test` уже удалён в Задаче 15, так что `tsx` тоже можно убрать, если больше ничто его не импортирует — проверить: `grep -r "from 'tsx'" .` / поиск использования CLI `tsx` в `scripts`.

- [ ] **Шаг 2: Убрать теперь неиспользуемые npm-скрипты**

В `package.json` убрать:

```json
"start": "node start-preview.mjs",
"postinstall": "nuxt prepare && prisma generate",
"prisma:generate": "prisma generate",
"prisma:migrate": "prisma migrate dev",
"prisma:seed": "prisma db seed",
"prisma:studio": "prisma studio",
```

Заменить `"postinstall"` на:

```json
"postinstall": "nuxt prepare",
```

- [ ] **Шаг 3: Удалить рантайм-артефакты Prisma и Render-скрипт запуска**

```bash
git rm prisma/seed.ts prisma.config.ts start-preview.mjs
git rm -r generated
```

`prisma/schema.prisma` остаётся как документированный референс для схемы Dexie в `app/lib/db/schema.ts`.

- [ ] **Шаг 4: Проверка**

Выполнить: `npm run typecheck && npm run lint && npm run build`
Ожидается: все три команды проходят успешно без единой ссылки на удалённые пакеты.

- [ ] **Шаг 5: Коммит**

```bash
git add package.json package-lock.json prisma/schema.prisma
git commit -m "Remove Supabase, Prisma runtime toolchain, and the Render start script"
```

---

### Задача 17: Убрать устаревшие документы и очистить `.env`

**Файлы:**
- Удалить: `docs/auth-plan.md`, `docs/auth-summary.md`, `docs/db-change-plan.md`, `docs/deploy.md`

- [ ] **Шаг 1: Удалить устаревшие документы**

```bash
git rm docs/auth-plan.md docs/auth-summary.md docs/db-change-plan.md docs/deploy.md
```

Эти документы описывают Supabase Auth, миграцию SQLite→Postgres и Render-деплой серверной версии — всё это неактуально после этой фазы.

- [ ] **Шаг 2: Ручная очистка (разработчик, без коммита)**

Убрать `DATABASE_URL`, `DIRECT_URL`, `NUXT_PUBLIC_SUPABASE_URL`, `NUXT_PUBLIC_SUPABASE_KEY`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` из локального файла `.env` и из `.env.example` — они не нужны клиентскому приложению без бэкенда. `.env` не отслеживается git, поэтому этот план не может сделать это за вас.

- [ ] **Шаг 3: Проверка**

Выполнить: `npm run build`
Ожидается: успешно, без ссылок на удалённые документы (это гигиена репозитория, не зависимость сборки).

- [ ] **Шаг 4: Коммит**

```bash
git commit -m "Remove stale Supabase/Prisma/Render docs"
```

---

### Задача 18: Обновить документ передачи проекта и решить вопрос деплоя, финальная проверка

**Файлы:**
- Изменить: `docs/project-state.md`

- [ ] **Шаг 1: Обновить разделы «Important Decisions» и «Current State»**

Заменить строку `SQLite is the local database backend.` (и всё, что говорит про Prisma/Supabase как бэкенд) на: `Store all data client-side in IndexedDB via Dexie.js; no server, no auth, no isDemo split.` Добавить строку о том, что `prisma/schema.prisma` — это только документация формы данных. Обновить `Current State`, описав локальную архитектуру вместо (уже удалённого) состояния Prisma/Supabase.

- [ ] **Шаг 2: Открытый вопрос — куда деплоить чисто клиентское приложение**

Текущий Render-деплой (`docs/deploy.md`, уже удалён в Задаче 17) обслуживал серверный Nitro-пресет; после этой фазы приложение — статический клиентский бандл (`npm run build` с `ssr: false`). Куда именно его деплоить (Render как static site, Cloudflare Pages, GitHub Pages, Netlify и т.п.) — решение, которое не было принято пользователем как часть этого плана. Зафиксировать это как открытый вопрос в `docs/project-state.md` → `Next Steps`, не решать молча.

- [ ] **Шаг 3: Финальная полная проверка**

Выполнить: `npm run typecheck && npm run lint && npm run build`
Ожидается: все команды проходят успешно.

- [ ] **Шаг 4: Коммит**

```bash
git add docs/project-state.md
git commit -m "Update the project handoff doc for the local-first architecture"
```

---

## Итог того, что даёт Step 1

- Никакого бэкенда, никакой авторизации: одна локальная база IndexedDB на браузер (Dexie.js), повторяющая `prisma/schema.prisma` (без `isDemo`).
- Первый запуск заполняет себя 16 демо-заявками из `public/data/demo.json`, сгенерированного `scripts/generate-demo-data.mjs` (наследник `prisma/seed.ts`). `docs/data.json` (106 реальных записей) этим планом нигде не используется.
- Экспорт/импорт всей таблицы job applications в JSON — две кнопки на странице `/jobs`.
- Старый бэкенд (Supabase Auth, Supabase Postgres/Prisma, `server/api`, Render-скрипт запуска) убирается только после того, как новый путь полностью проверен.
- Открытый вопрос на будущее: куда и как деплоить итоговое клиентское приложение (Render изменился с сервера на статику — само решение о хостинге не входит в этот план).
