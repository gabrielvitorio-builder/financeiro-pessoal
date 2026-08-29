-- Ajustes de schema necessários para o app (idempotente)

alter table if exists public.accounts
  add column if not exists is_reserve boolean default false,
  add column if not exists is_available boolean default true;

alter table if exists public.goals
  add column if not exists goal_type text default 'custom',
  add column if not exists priority int default 0,
  add column if not exists description text;

alter table if exists public.assets
  add column if not exists asset_type text default 'other';

alter table if exists public.liabilities
  add column if not exists liability_type text default 'other';

alter table if exists public.installments
  add column if not exists credit_card_id uuid references public.credit_cards(id) on delete set null;

alter table if exists public.financial_settings
  add column if not exists monthly_income_goal numeric default 10000,
  add column if not exists house_goal_value numeric default 50000,
  add column if not exists house_goal_months int default 12,
  add column if not exists onboarding_completed boolean default false;

-- Garantir RLS ligado (não recria policies existentes)
alter table public.accounts enable row level security;
alter table public.credit_cards enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.installments enable row level security;
alter table public.assets enable row level security;
alter table public.liabilities enable row level security;
alter table public.goals enable row level security;
alter table public.financial_settings enable row level security;