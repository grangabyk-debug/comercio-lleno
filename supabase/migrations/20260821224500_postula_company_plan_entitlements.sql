create table if not exists public.pm_company_subscriptions (
  company_id uuid primary key references public.pm_companies(id) on delete cascade,
  plan text not null default 'gratis' check (plan in ('gratis','impulso','seleccion','escala','empresa')),
  status text not null default 'inactive' check (status in ('inactive','pending','authorized','paused','cancelled')),
  provider text,
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists pm_company_subscriptions_provider_idx on public.pm_company_subscriptions(provider,provider_subscription_id);
alter table public.pm_company_subscriptions enable row level security;
drop policy if exists pm_company_subscriptions_member_read on public.pm_company_subscriptions;
create policy pm_company_subscriptions_member_read on public.pm_company_subscriptions for select to authenticated using (public.pm_is_company_member(company_id));
revoke insert, update, delete on public.pm_company_subscriptions from authenticated, anon;
grant select on public.pm_company_subscriptions to authenticated;
