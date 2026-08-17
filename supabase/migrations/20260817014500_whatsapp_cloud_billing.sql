alter table if exists public.whatsapp_cloud_accounts
  add column if not exists billing_status text not null default 'unconfigured',
  add column if not exists credit_line_id text,
  add column if not exists allocation_config_id text,
  add column if not exists billing_currency text;

alter table if exists public.whatsapp_cloud_accounts
  drop constraint if exists whatsapp_cloud_accounts_billing_status_check;

alter table if exists public.whatsapp_cloud_accounts
  add constraint whatsapp_cloud_accounts_billing_status_check
  check (billing_status in ('unconfigured','available','attached','error'));
