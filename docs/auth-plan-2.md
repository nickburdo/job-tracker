# Authentication Plan

## Create Google Cloud OAuth Client

- [x] Зайти в [Google Cloud Console](https://console.cloud.google.com?utm_source=chatgpt.com)
- [x] APIs & Services → Credentials → Create Credentials → OAuth Client ID
- [x] Выбрать Application type (Web application)
- [x] Ввести имя 
- [x] Открыть в другой вкладке Supabase → Authentication → Sign In/Providers → Google
- [x] Скопировать Callback URL из Supabase в поле `Authorized redirect URIs` в Google Cloud
- [x] Скопировать этот же URI также в поле `Authorized JavaScript origins` в Google Cloud и удалить `/auth/v1/callback` в конце (оставить только домен Supabase проекта)
- [x] Создать OAuth Client
- [x] Скопировать `Client ID` и `Client secret` в соответствующие поля Google провайдера в Supabase
- [x] Включить `Enable Sign in with Google` в Supabase и сохранить провайдер 

## Configure Supabase

### Authentication -> Sign In/Providers:

[x] Проверить включение провайдеров:
- Email (включен по умолчанию)
- Google (включен в предыдущем разделе)

### Authentication -> URL Configuration:

-[x] Site URL:
http://localhost:3000

-[x] Redirect URLs:
http://localhost:3000/**
https://твой-домен/**

## Add DB column

-[x] добавить в схему новую колонку:

`prisma/schema.prisma`: 
```prisma
model JobApplication {
  // ...
  isDemo Boolean @default(false)
}
```

-[x]  запустить миграцию
```bash
npx prisma migrate dev --name add_is_demo
```

## Fix Admin

-[x] Создать/впустить админа через Supabase Auth
-[x] Взять UUID админа из Authentication → Users
-[x] Заменить `PASTE_ADMIN_SUPABASE_USER_ID_HERE` на UUID и выполнить в SQL editor:
```
create schema if not exists private;

create table if not exists private.admin_users (user_id uuid primary key);

insert into private.admin_users (user_id)
values ('PASTE_ADMIN_SUPABASE_USER_ID_HERE')
    on conflict do nothing;
```
-[x] проверить:
```
select * from private.admin_users;
```
должна быть строка с UUID админа

## RLS for table

-[x] создать функцию `private.is_admin()` (выполнить в SQL Editor):
```
create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = private, public
as $$
select exists (
    select 1
    from private.admin_users
    where user_id = auth.uid()
);
$$;
```
-[x] Включить RLS (выполнить в SQL Editor):
```
alter table public."job_tracker_job_applications"
enable row level security;
```
- Создать политики  (выполнить в SQL Editor):

-[x] `read`  
```
drop policy if exists "guest can read demo jobs"
on public."job_tracker_job_applications";

create policy "guest can read demo jobs"
on public."job_tracker_job_applications"
for select
to anon
using ("isDemo" = true);


drop policy if exists "admin can read all jobs"
on public."job_tracker_job_applications";

create policy "admin can read all jobs"
on public."job_tracker_job_applications"
for select
to authenticated
using (private.is_admin());
``` 
-[x] `guest insert`
```
drop policy if exists "guest can insert demo jobs"
on public."job_tracker_job_applications";

create policy "guest can insert demo jobs"
on public."job_tracker_job_applications"
for insert
to anon
with check ("isDemo" = true);
```
-[x] `guest update`
```
drop policy if exists "guest can update demo jobs"
on public."job_tracker_job_applications";

create policy "guest can update demo jobs"
on public."job_tracker_job_applications"
for update
to anon
using ("isDemo" = true)
with check ("isDemo" = true);
```
-[x] `guest delete`
```
drop policy if exists "guest can delete demo jobs"
on public."job_tracker_job_applications";

create policy "guest can delete demo jobs"
on public."job_tracker_job_applications"
for delete
to anon
using ("isDemo" = true);
```
-[x] `admin write`
```
drop policy if exists "admin can write all jobs"
on public."job_tracker_job_applications";

create policy "admin can write all jobs"
on public."job_tracker_job_applications"
for all
to authenticated
using (private.is_admin())
with check (private.is_admin());
```

## API update

В API реализовать:

-[ ] для `guest`: всегда добавлять where: { isDemo: true }
-[ ] для `guest` create/update: принудительно isDemo: true
-[ ] для `admin`: проверять `Supabase session/JWT` на сервере
-[ ] не доверять фронту