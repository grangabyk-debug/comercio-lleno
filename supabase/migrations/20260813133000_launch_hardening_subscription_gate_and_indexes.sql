create table if not exists public.trial_signup_attempts (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  challenge_hash text not null unique,
  email_hash text,
  succeeded boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.trial_signup_attempts enable row level security;
revoke all on table public.trial_signup_attempts from public, anon, authenticated;
create index if not exists trial_signup_attempts_ip_created_idx on public.trial_signup_attempts(ip_hash, created_at desc);
create index if not exists trial_signup_attempts_created_idx on public.trial_signup_attempts(created_at desc);

create or replace function public.current_user_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.company_id
  from public.profiles p
  where p.id = auth.uid()
    and p.active = true
    and (
      not exists (select 1 from public.company_subscriptions cs where cs.company_id = p.company_id)
      or exists (
        select 1 from public.company_subscriptions cs
        where cs.company_id = p.company_id
          and (cs.status = 'active' or (cs.status = 'trialing' and cs.trial_ends_at > now()))
      )
    )
  limit 1;
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid()
    and p.active = true
    and p.company_id = public.current_user_company_id()
  limit 1;
$$;

create or replace function public.comercio_has_permission(p_key text, p_legacy_supervisor_default boolean default false)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce((
    select p.active and p.company_id = public.current_user_company_id() and (
      p.role = 'owner'
      or coalesce((p.permissions ->> p_key)::boolean, p_legacy_supervisor_default and p.role = 'supervisor', false)
    )
    from public.profiles p
    where p.id = auth.uid()
  ), false)
$$;

create or replace function public.can_use_cash_register()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case
    when auth.uid() is null or public.current_user_company_id() is null then false
    when public.current_user_role()='owner' then true
    else coalesce(
      (select (p.permissions->>'can_open_close_cash')::boolean from public.profiles p where p.id=auth.uid() and p.active=true and p.company_id=public.current_user_company_id()),
      public.current_user_role() in ('cashier','manager','supervisor')
    )
  end
$$;

create or replace function public.enforce_company_subscription_write()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_company uuid;
  v_claims text := nullif(current_setting('request.jwt.claims', true), '');
  v_jwt_role text := coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    case when v_claims is not null then v_claims::jsonb->>'role' else null end
  );
begin
  if v_jwt_role = 'service_role' then
    if tg_op = 'DELETE' then return old; else return new; end if;
  end if;
  if auth.uid() is null then raise exception 'Usuario no autenticado'; end if;
  if tg_op = 'DELETE' then v_company := old.company_id; else v_company := new.company_id; end if;
  if v_company is null then raise exception 'Comercio no disponible'; end if;
  if exists (select 1 from public.company_subscriptions cs where cs.company_id = v_company)
     and not exists (
       select 1 from public.company_subscriptions cs
       where cs.company_id = v_company
         and (cs.status = 'active' or (cs.status = 'trialing' and cs.trial_ends_at > now()))
     ) then
    raise exception 'La suscripción de Comercio Lleno está vencida o requiere activación';
  end if;
  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;
revoke execute on function public.enforce_company_subscription_write() from public, anon, authenticated;
grant execute on function public.enforce_company_subscription_write() to service_role;

do $$
declare t text;
begin
  foreach t in array array[
    'products','customers','sales','cash_registers','cash_movements','suppliers','purchases',
    'stock_movements','price_history','customer_accounts','account_movements','suspended_sales',
    'promotions','returns','branches','finance_expenses','purchase_documents','arca_tenant_settings'
  ] loop
    execute format('drop trigger if exists enforce_subscription_write on public.%I', t);
    execute format('create trigger enforce_subscription_write before insert or update or delete on public.%I for each row execute function public.enforce_company_subscription_write()', t);
  end loop;
end $$;

create index if not exists account_movements_company_idx on public.account_movements(company_id);
create index if not exists account_movements_customer_idx on public.account_movements(customer_id);
create index if not exists account_movements_sale_idx on public.account_movements(sale_id) where sale_id is not null;
create index if not exists cash_movements_register_idx on public.cash_movements(cash_register_id) where cash_register_id is not null;
create index if not exists customer_accounts_customer_idx on public.customer_accounts(customer_id);
create index if not exists products_supplier_idx on public.products(supplier_id) where supplier_id is not null;
create index if not exists promotions_product_idx on public.promotions(product_id) where product_id is not null;
create index if not exists purchase_items_purchase_idx on public.purchase_items(purchase_id);
create index if not exists purchase_items_product_idx on public.purchase_items(product_id);
create index if not exists purchases_supplier_idx on public.purchases(supplier_id) where supplier_id is not null;
create index if not exists returns_company_idx on public.returns(company_id);
create index if not exists returns_sale_idx on public.returns(sale_id) where sale_id is not null;
create index if not exists sale_items_product_idx on public.sale_items(product_id);
create index if not exists sales_customer_idx on public.sales(customer_id) where customer_id is not null;
create index if not exists stock_movements_company_idx on public.stock_movements(company_id);
create index if not exists suppliers_company_idx on public.suppliers(company_id);
create index if not exists suspended_sales_company_idx on public.suspended_sales(company_id);
create index if not exists suspended_sales_customer_idx on public.suspended_sales(customer_id) where customer_id is not null;
drop index if exists public.products_company_barcode_uidx;
