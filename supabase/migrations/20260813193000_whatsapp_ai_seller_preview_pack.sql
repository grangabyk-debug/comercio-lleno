create table if not exists public.company_feature_entitlements (
  company_id uuid not null references public.companies(id) on delete cascade,
  feature_key text not null,
  enabled boolean not null default false,
  plan_code text,
  source text not null default 'central_llena',
  notes text,
  updated_at timestamptz not null default now(),
  primary key (company_id, feature_key),
  constraint company_feature_entitlements_key_check check (feature_key in ('whatsapp_ai_seller','whatsapp_automations'))
);

create table if not exists public.company_admin_controls (
  company_id uuid primary key references public.companies(id) on delete cascade,
  access_paused boolean not null default false,
  pause_reason text,
  updated_at timestamptz not null default now()
);

create table if not exists public.whatsapp_ai_conversations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  customer_phone text not null,
  remote_jid text,
  instance_name text not null,
  status text not null default 'active' check (status in ('active','awaiting_confirmation','confirmed','closed','human')),
  cart jsonb not null default '{"items":[]}'::jsonb,
  context jsonb not null default '{}'::jsonb,
  last_inbound_at timestamptz,
  last_outbound_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, customer_phone, instance_name)
);

create table if not exists public.whatsapp_ai_messages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  conversation_id uuid not null references public.whatsapp_ai_conversations(id) on delete cascade,
  external_message_id text,
  direction text not null check (direction in ('inbound','outbound','system')),
  body text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists whatsapp_ai_messages_external_unique
  on public.whatsapp_ai_messages(company_id, external_message_id)
  where external_message_id is not null;
create index if not exists whatsapp_ai_messages_conversation_created_idx
  on public.whatsapp_ai_messages(conversation_id, created_at);

create table if not exists public.whatsapp_ai_orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  conversation_id uuid not null references public.whatsapp_ai_conversations(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  customer_phone text not null,
  status text not null default 'draft' check (status in ('draft','confirmed','sale_created','cancelled')),
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null default 0,
  total numeric not null default 0,
  sale_id uuid references public.sales(id) on delete set null,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists whatsapp_ai_orders_company_status_idx on public.whatsapp_ai_orders(company_id,status,created_at desc);
create unique index if not exists whatsapp_ai_orders_sale_unique on public.whatsapp_ai_orders(sale_id) where sale_id is not null;

alter table public.company_feature_entitlements enable row level security;
alter table public.company_admin_controls enable row level security;
alter table public.whatsapp_ai_conversations enable row level security;
alter table public.whatsapp_ai_messages enable row level security;
alter table public.whatsapp_ai_orders enable row level security;

revoke all on public.company_feature_entitlements from anon, authenticated;
revoke all on public.company_admin_controls from anon, authenticated;
grant select on public.company_feature_entitlements to authenticated;
grant select on public.company_admin_controls to authenticated;
grant all on public.company_feature_entitlements to service_role;
grant all on public.company_admin_controls to service_role;

drop policy if exists feature_entitlements_tenant_read on public.company_feature_entitlements;
create policy feature_entitlements_tenant_read on public.company_feature_entitlements for select to authenticated
using (company_id = public.current_user_company_id());

drop policy if exists admin_controls_tenant_read on public.company_admin_controls;
create policy admin_controls_tenant_read on public.company_admin_controls for select to authenticated
using (company_id = public.current_user_company_id());

grant select,insert,update,delete on public.whatsapp_ai_conversations to authenticated;
grant select,insert,update,delete on public.whatsapp_ai_messages to authenticated;
grant select,insert,update,delete on public.whatsapp_ai_orders to authenticated;
grant all on public.whatsapp_ai_conversations,public.whatsapp_ai_messages,public.whatsapp_ai_orders to service_role;

drop policy if exists whatsapp_ai_conversations_tenant on public.whatsapp_ai_conversations;
create policy whatsapp_ai_conversations_tenant on public.whatsapp_ai_conversations for all to authenticated
using (company_id = public.current_user_company_id()) with check (company_id = public.current_user_company_id());

drop policy if exists whatsapp_ai_messages_tenant on public.whatsapp_ai_messages;
create policy whatsapp_ai_messages_tenant on public.whatsapp_ai_messages for all to authenticated
using (company_id = public.current_user_company_id()) with check (company_id = public.current_user_company_id());

drop policy if exists whatsapp_ai_orders_tenant on public.whatsapp_ai_orders;
create policy whatsapp_ai_orders_tenant on public.whatsapp_ai_orders for all to authenticated
using (company_id = public.current_user_company_id()) with check (company_id = public.current_user_company_id());

create or replace function public.persist_whatsapp_sale_atomic(p_company_id uuid, p_order_id uuid, p_sale jsonb)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role text := coalesce(auth.role(), '');
  v_current_company uuid := public.current_user_company_id();
  v_sale_id uuid;
  v_details jsonb := coalesce(p_sale->'details', '{}'::jsonb);
  v_items jsonb := coalesce(p_sale->'details'->'items', '[]'::jsonb);
  v_item jsonb;
  v_product_id uuid;
  v_qty numeric;
  v_stock numeric;
  v_subtotal numeric;
  v_total numeric;
  v_items_subtotal numeric := 0;
  v_items_count integer := 0;
  v_allow_without_stock boolean := false;
  v_existing_sale uuid;
begin
  if v_role <> 'service_role' then
    if auth.uid() is null or v_current_company is null or v_current_company <> p_company_id then
      raise exception 'No autorizado';
    end if;
    if not exists (select 1 from public.profiles where id=auth.uid() and company_id=p_company_id and active=true and role='owner') then
      raise exception 'Sólo el propietario puede confirmar una venta de prueba por WhatsApp';
    end if;
  end if;

  select sale_id into v_existing_sale from public.whatsapp_ai_orders where id=p_order_id and company_id=p_company_id for update;
  if not found then raise exception 'Pedido de WhatsApp inexistente'; end if;
  if v_existing_sale is not null then return v_existing_sale; end if;

  begin v_sale_id := (p_sale->>'id')::uuid; exception when others then raise exception 'Identificador de venta inválido'; end;
  v_subtotal := greatest(0,coalesce((p_sale->>'subtotal')::numeric,0));
  v_total := greatest(0,coalesce((p_sale->>'total')::numeric,0));
  if v_total <= 0 or abs(v_subtotal-v_total) > .02 then raise exception 'Totales inválidos'; end if;
  if jsonb_typeof(v_items) <> 'array' or jsonb_array_length(v_items)=0 then raise exception 'Pedido sin productos'; end if;

  for v_item in select value from jsonb_array_elements(v_items) loop
    v_qty := coalesce((v_item->>'qty')::numeric,0);
    if v_qty <= 0 then raise exception 'Cantidad inválida'; end if;
    if coalesce((v_item->>'unit_price')::numeric,-1) < 0 then raise exception 'Precio inválido'; end if;
    if abs(coalesce((v_item->>'line_total')::numeric,-1)-((v_item->>'unit_price')::numeric*v_qty)) > .02 then raise exception 'Subtotal inválido'; end if;
    v_items_subtotal := v_items_subtotal + coalesce((v_item->>'line_total')::numeric,0);
    v_items_count := v_items_count + greatest(1,ceil(v_qty)::integer);
  end loop;
  if abs(v_items_subtotal-v_subtotal) > .02 then raise exception 'El total no coincide con los productos'; end if;

  select coalesce((sales_settings->>'allowNegativeStock')::boolean,false) into v_allow_without_stock from public.companies where id=p_company_id;

  insert into public.sales(id,company_id,customer_id,receipt_type,payment_method,subtotal,total,fiscal_status,cae,receipt_number,sold_at,items_count,details)
  values (v_sale_id,p_company_id,nullif(p_sale->>'customer_id','')::uuid,'ticket','Pedido WhatsApp',v_subtotal,v_total,'pending',null,null,now(),v_items_count,v_details);

  for v_item in select value from jsonb_array_elements(v_items) loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'qty')::numeric;
    select stock into v_stock from public.products where id=v_product_id and company_id=p_company_id and active=true for update;
    if not found then raise exception 'Producto no disponible: %',coalesce(v_item->>'name','Producto'); end if;
    if not v_allow_without_stock and v_stock < v_qty then raise exception 'Stock insuficiente para %',coalesce(v_item->>'name','Producto'); end if;
    update public.products set stock=greatest(0,stock-v_qty),updated_at=now() where id=v_product_id and company_id=p_company_id;
  end loop;

  update public.whatsapp_ai_orders set status='sale_created',sale_id=v_sale_id,confirmed_at=coalesce(confirmed_at,now()),updated_at=now() where id=p_order_id and company_id=p_company_id;
  return v_sale_id;
end;
$$;

revoke execute on function public.persist_whatsapp_sale_atomic(uuid,uuid,jsonb) from public,anon;
grant execute on function public.persist_whatsapp_sale_atomic(uuid,uuid,jsonb) to authenticated,service_role;
