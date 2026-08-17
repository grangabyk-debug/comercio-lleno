create table if not exists public.branch_purchases (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null,
  branch_name text not null,
  branch_address text,
  amount numeric(12,2) not null default 4900,
  currency text not null default 'ARS',
  status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  mp_preference_id text,
  mp_payment_id text,
  created_branch_id uuid references public.branches(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists branch_purchases_company_idx
  on public.branch_purchases(company_id,created_at desc);

create unique index if not exists branch_purchases_payment_uidx
  on public.branch_purchases(mp_payment_id)
  where mp_payment_id is not null;

alter table public.branch_purchases enable row level security;
revoke all on table public.branch_purchases from anon, authenticated;
