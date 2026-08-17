create table if not exists public.whatsapp_cloud_accounts (
  company_id uuid primary key references public.companies(id) on delete cascade,
  waba_id text not null unique,
  phone_number_id text,
  meta_business_id text,
  display_phone_number text,
  verified_name text,
  quality_rating text,
  name_status text,
  status text not null default 'pending' check (status in ('pending','connected','error','disconnected')),
  subscribed boolean not null default false,
  registered boolean not null default false,
  onboarding_source text not null default 'embedded_signup',
  connected_at timestamptz,
  last_webhook_at timestamptz,
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists whatsapp_cloud_accounts_phone_unique
  on public.whatsapp_cloud_accounts(phone_number_id)
  where phone_number_id is not null;
create index if not exists whatsapp_cloud_accounts_waba_idx on public.whatsapp_cloud_accounts(waba_id);

create table if not exists public.whatsapp_cloud_events (
  event_key text primary key,
  company_id uuid references public.companies(id) on delete cascade,
  waba_id text,
  phone_number_id text,
  event_type text not null default 'unknown',
  external_message_id text,
  payload jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text
);

create index if not exists whatsapp_cloud_events_company_received_idx
  on public.whatsapp_cloud_events(company_id, received_at desc);
create index if not exists whatsapp_cloud_events_phone_idx
  on public.whatsapp_cloud_events(phone_number_id, received_at desc);
create index if not exists whatsapp_cloud_events_external_message_idx
  on public.whatsapp_cloud_events(external_message_id)
  where external_message_id is not null;

alter table public.whatsapp_cloud_accounts enable row level security;
alter table public.whatsapp_cloud_events enable row level security;

grant select,insert,update,delete on public.whatsapp_cloud_accounts to authenticated;
grant select on public.whatsapp_cloud_events to authenticated;
grant all on public.whatsapp_cloud_accounts, public.whatsapp_cloud_events to service_role;

drop policy if exists whatsapp_cloud_accounts_tenant_read on public.whatsapp_cloud_accounts;
create policy whatsapp_cloud_accounts_tenant_read on public.whatsapp_cloud_accounts
for select to authenticated
using (company_id = public.current_user_company_id());

drop policy if exists whatsapp_cloud_accounts_owner_insert on public.whatsapp_cloud_accounts;
create policy whatsapp_cloud_accounts_owner_insert on public.whatsapp_cloud_accounts
for insert to authenticated
with check (
  company_id = public.current_user_company_id()
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.company_id = public.current_user_company_id()
      and p.active = true
      and p.role = 'owner'
  )
);

drop policy if exists whatsapp_cloud_accounts_owner_update on public.whatsapp_cloud_accounts;
create policy whatsapp_cloud_accounts_owner_update on public.whatsapp_cloud_accounts
for update to authenticated
using (
  company_id = public.current_user_company_id()
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.company_id = public.current_user_company_id()
      and p.active = true
      and p.role = 'owner'
  )
)
with check (
  company_id = public.current_user_company_id()
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.company_id = public.current_user_company_id()
      and p.active = true
      and p.role = 'owner'
  )
);

drop policy if exists whatsapp_cloud_accounts_owner_delete on public.whatsapp_cloud_accounts;
create policy whatsapp_cloud_accounts_owner_delete on public.whatsapp_cloud_accounts
for delete to authenticated
using (
  company_id = public.current_user_company_id()
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.company_id = public.current_user_company_id()
      and p.active = true
      and p.role = 'owner'
  )
);

drop policy if exists whatsapp_cloud_events_tenant_read on public.whatsapp_cloud_events;
create policy whatsapp_cloud_events_tenant_read on public.whatsapp_cloud_events
for select to authenticated
using (company_id = public.current_user_company_id());
