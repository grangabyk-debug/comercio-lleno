create table if not exists public.mercadopago_point_connections (
  company_id uuid primary key references public.companies(id) on delete cascade,
  mp_user_id text,
  access_token_cipher text,
  refresh_token_cipher text,
  token_expires_at timestamptz,
  terminal_id text,
  terminal_mode text,
  terminal_store_id text,
  terminal_pos_id text,
  status text not null default 'disconnected',
  connected_by uuid,
  connected_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mercadopago_point_connections_status_check check (status in ('connected','disconnected','error'))
);

create table if not exists public.mercadopago_point_oauth_states (
  state text primary key,
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null,
  code_verifier text not null,
  return_url text,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists mercadopago_point_oauth_states_expiry_idx
  on public.mercadopago_point_oauth_states(expires_at);

create table if not exists public.mercadopago_point_orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  sale_id text not null,
  mp_order_id text unique,
  external_reference text not null,
  terminal_id text not null,
  amount numeric(14,2) not null check (amount > 0),
  idempotency_key text not null unique,
  status text not null default 'creating',
  status_detail text,
  payment_id text,
  payment_status text,
  raw_summary jsonb not null default '{}'::jsonb,
  created_by uuid,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, sale_id)
);

create index if not exists mercadopago_point_orders_company_created_idx
  on public.mercadopago_point_orders(company_id, created_at desc);
create index if not exists mercadopago_point_orders_mp_order_idx
  on public.mercadopago_point_orders(mp_order_id);

create table if not exists public.mercadopago_point_webhook_events (
  event_key text primary key,
  event_type text,
  action text,
  mp_order_id text,
  mp_user_id text,
  payload_summary jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now()
);

alter table public.mercadopago_point_connections enable row level security;
alter table public.mercadopago_point_oauth_states enable row level security;
alter table public.mercadopago_point_orders enable row level security;
alter table public.mercadopago_point_webhook_events enable row level security;

revoke all on table public.mercadopago_point_connections from anon, authenticated;
revoke all on table public.mercadopago_point_oauth_states from anon, authenticated;
revoke all on table public.mercadopago_point_orders from anon, authenticated;
revoke all on table public.mercadopago_point_webhook_events from anon, authenticated;
