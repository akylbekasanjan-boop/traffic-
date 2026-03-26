# Анкета предзаписи + статистика (2-недельные срезы)

Функции:
- Форма на `/`: поле `номер` + `имя`, запись в Supabase
- Дедупликация: один `номер` = одно заполнение
- Админская статистика на `/stats` по паролю
- Cron обновляет таблицу `stats_snapshots` (2-недельные окна)

## 1) Подготовка Supabase
1. Создайте проект в [Supabase](https://supabase.com/).
2. В Dashboard откройте **SQL Editor** и выполните содержимое файла:
   - `supabase/migrations/0001_init.sql`
3. В Dashboard возьмите:
   - `NEXT_PUBLIC_SUPABASE_URL` (Project Settings → API)
   - `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API → Service role key)

## 2) Настройка переменных окружения
Скопируйте `web/.env.example` в `web/.env.local` и заполните значения.

Нужные переменные:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STATS_PASSWORD`
- `STATS_JWT_SECRET`
- `CRON_SECRET`

## 3) Локальный запуск
```bash
npm run dev
```
Откройте:
- форма: `http://localhost:3000/`
- статистика: `http://localhost:3000/stats`

## 4) Деплой на Vercel
1. В Vercel создайте проект Next.js, указав **root directory = `web`**.
2. Добавьте в Project Settings → Environment Variables значения:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STATS_PASSWORD`
   - `STATS_JWT_SECRET`
3. В `web/vercel.json` уже задан cron:
   - ежедневно дергается `GET /api/cron/update-stats`
   - endpoint idempotent: создаёт максимум один срез на 2-недельное окно

После деплоя:
- люди заполняют по URL формы (главная страница)
- вам доступна статистика по `.../stats`
