alter table public.companies
  add column if not exists receipt_settings jsonb not null default '{}'::jsonb;
