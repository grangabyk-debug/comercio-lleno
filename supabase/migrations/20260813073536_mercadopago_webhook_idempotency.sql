create table if not exists public.mercadopago_webhook_events (
  request_id text primary key,
  data_id text not null default '',
  event_type text not null default '',
  processed_at timestamptz not null default now()
);

alter table public.mercadopago_webhook_events enable row level security;
revoke all privileges on table public.mercadopago_webhook_events from public, anon, authenticated;
grant select, insert, update, delete on table public.mercadopago_webhook_events to service_role;

create index if not exists mercadopago_webhook_events_processed_at_idx
  on public.mercadopago_webhook_events(processed_at desc);
