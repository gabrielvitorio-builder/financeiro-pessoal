-- Migration v2: plano mensal, conquistas e onboarding flags
-- Idempotente, não apaga dados existentes.

create table if not exists public.monthly_plan (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null, -- 'YYYY-MM'
  planned_savings numeric not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, month)
);

alter table public.monthly_plan enable row level security;

drop policy if exists "monthly_plan_select_own" on public.monthly_plan;
create policy "monthly_plan_select_own" on public.monthly_plan
  for select using (auth.uid() = user_id);

drop policy if exists "monthly_plan_insert_own" on public.monthly_plan;
create policy "monthly_plan_insert_own" on public.monthly_plan
  for insert with check (auth.uid() = user_id);

drop policy if exists "monthly_plan_update_own" on public.monthly_plan;
create policy "monthly_plan_update_own" on public.monthly_plan
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "monthly_plan_delete_own" on public.monthly_plan;
create policy "monthly_plan_delete_own" on public.monthly_plan
  for delete using (auth.uid() = user_id);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null, -- ex: 'house_1000', 'income_10000_first_month'
  unlocked_at timestamptz not null default now(),
  unique (user_id, code)
);

alter table public.achievements enable row level security;

drop policy if exists "achievements_select_own" on public.achievements;
create policy "achievements_select_own" on public.achievements
  for select using (auth.uid() = user_id);

drop policy if exists "achievements_insert_own" on public.achievements;
create policy "achievements_insert_own" on public.achievements
  for insert with check (auth.uid() = user_id);

drop policy if exists "achievements_delete_own" on public.achievements;
create policy "achievements_delete_own" on public.achievements
  for delete using (auth.uid() = user_id);

alter table if exists public.financial_settings
  add column if not exists onboarding_step int default 0;
