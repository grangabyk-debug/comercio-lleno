create table if not exists public.whatsapp_cloud_conversations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_phone text not null,
  customer_name text,
  status text not null default 'open' check (status in ('open','closed','blocked')),
  unread_count integer not null default 0 check (unread_count >= 0),
  last_message_preview text,
  last_message_at timestamptz,
  last_inbound_at timestamptz,
  last_outbound_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, customer_phone)
);

create index if not exists whatsapp_cloud_conversations_company_last_idx
  on public.whatsapp_cloud_conversations(company_id, last_message_at desc nulls last);

create table if not exists public.whatsapp_cloud_messages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  conversation_id uuid not null references public.whatsapp_cloud_conversations(id) on delete cascade,
  external_message_id text,
  direction text not null check (direction in ('inbound','outbound')),
  message_type text not null default 'text',
  body text not null default '',
  status text not null default 'received',
  payload jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists whatsapp_cloud_messages_external_unique
  on public.whatsapp_cloud_messages(external_message_id)
  where external_message_id is not null;
create index if not exists whatsapp_cloud_messages_conversation_created_idx
  on public.whatsapp_cloud_messages(conversation_id, created_at desc);
create index if not exists whatsapp_cloud_messages_company_created_idx
  on public.whatsapp_cloud_messages(company_id, created_at desc);

alter table public.whatsapp_cloud_conversations enable row level security;
alter table public.whatsapp_cloud_messages enable row level security;

grant select on public.whatsapp_cloud_conversations, public.whatsapp_cloud_messages to authenticated;
grant all on public.whatsapp_cloud_conversations, public.whatsapp_cloud_messages to service_role;

drop policy if exists whatsapp_cloud_conversations_tenant_read on public.whatsapp_cloud_conversations;
create policy whatsapp_cloud_conversations_tenant_read on public.whatsapp_cloud_conversations
for select to authenticated
using (company_id = public.current_user_company_id());

drop policy if exists whatsapp_cloud_messages_tenant_read on public.whatsapp_cloud_messages;
create policy whatsapp_cloud_messages_tenant_read on public.whatsapp_cloud_messages
for select to authenticated
using (company_id = public.current_user_company_id());
