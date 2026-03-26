-- Schema for:
-- 1) submissions (deduped by lead_number)
-- 2) stats_snapshots (2-week aligned windows)

create extension if not exists "pgcrypto";

create table if not exists public.submissions (
  lead_number text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists submissions_created_at_idx on public.submissions (created_at desc);

create table if not exists public.stats_snapshots (
  id uuid primary key default gen_random_uuid(),
  period_start timestamptz not null,
  period_end timestamptz not null,
  total_submissions integer not null,
  unique_leads integer not null,
  created_at timestamptz not null default now(),
  constraint stats_snapshots_period_start_unique unique (period_start)
);

create index if not exists stats_snapshots_period_end_idx on public.stats_snapshots (period_end desc);

-- Включаем RLS по умолчанию (без политик).
-- Наш сервер использует SUPABASE_SERVICE_ROLE_KEY, поэтому он обходит RLS.
-- Анонимный доступ по ошибке не сможет читать/писать.
alter table public.submissions enable row level security;
alter table public.stats_snapshots enable row level security;

