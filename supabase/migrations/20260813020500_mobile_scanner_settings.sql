alter table public.companies
  add column if not exists mobile_settings jsonb not null default '{"scanner_enabled": true}'::jsonb;

update public.companies
set mobile_settings = jsonb_build_object('scanner_enabled', true)
where mobile_settings is null or jsonb_typeof(mobile_settings) <> 'object';
