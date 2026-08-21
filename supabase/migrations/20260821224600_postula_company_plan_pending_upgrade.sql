alter table public.pm_company_subscriptions
  add column if not exists pending_plan text check (pending_plan in ('impulso','seleccion','escala','empresa')),
  add column if not exists pending_provider_subscription_id text,
  add column if not exists pending_started_at timestamptz;
create index if not exists pm_company_subscriptions_pending_provider_idx on public.pm_company_subscriptions(provider,pending_provider_subscription_id);
