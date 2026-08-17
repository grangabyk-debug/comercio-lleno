create table if not exists public.company_promo_limits (
  company_id uuid primary key references public.companies(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  product_limit integer not null default 1000 check (product_limit > 0),
  products_unlimited boolean not null default false,
  fiscal_base_limit integer not null default 500 check (fiscal_base_limit > 0),
  fiscal_extended_limit integer not null default 2500 check (fiscal_extended_limit >= fiscal_base_limit),
  fiscal_extended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feature_purchases (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null,
  feature text not null check (feature in ('products_unlimited','fiscal_2500')),
  amount numeric(12,2) not null default 4900,
  currency text not null default 'ARS',
  status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  mp_preference_id text,
  mp_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz
);
create index if not exists feature_purchases_company_feature_idx on public.feature_purchases(company_id, feature, created_at desc);
create unique index if not exists feature_purchases_mp_payment_uidx on public.feature_purchases(mp_payment_id) where mp_payment_id is not null;

alter table public.company_promo_limits enable row level security;
alter table public.feature_purchases enable row level security;

create or replace function public.current_company_id()
returns uuid language sql stable security definer set search_path='public','pg_temp' as $$
  select company_id from public.profiles where id=auth.uid() and active is distinct from false limit 1
$$;

create or replace function public.get_promo_usage_limits()
returns jsonb language plpgsql security definer set search_path='public','pg_temp' as $$
declare cid uuid := public.current_company_id(); lim public.company_promo_limits%rowtype; branch uuid; products_count integer := 0; fiscal_count integer := 0;
begin
  if cid is null then raise exception 'Sin comercio asociado'; end if;
  select * into lim from public.company_promo_limits where company_id=cid;
  if not found then return jsonb_build_object('managed',false,'legacy',true); end if;
  select id into branch from public.branches where company_id=cid and active=true and is_primary=true order by created_at limit 1;
  select count(*) into products_count from public.products where company_id=cid and active=true and (branch is null or branch_id=branch);
  select count(*) into fiscal_count from public.sales where company_id=cid and fiscal_status='authorized' and cae is not null;
  return jsonb_build_object('managed',true,'legacy',false,'product_count',products_count,'product_limit',lim.product_limit,'products_unlimited',lim.products_unlimited,'fiscal_count',fiscal_count,'fiscal_limit',case when lim.fiscal_extended then lim.fiscal_extended_limit else lim.fiscal_base_limit end,'fiscal_base_limit',lim.fiscal_base_limit,'fiscal_extended_limit',lim.fiscal_extended_limit,'fiscal_extended',lim.fiscal_extended,'upgrade_price',4900);
end$$;
revoke all on function public.get_promo_usage_limits() from public,anon;
grant execute on function public.get_promo_usage_limits() to authenticated;

create or replace function public.enforce_promo_product_limit()
returns trigger language plpgsql security definer set search_path='public','pg_temp' as $$
declare lim public.company_promo_limits%rowtype; current_count integer;
begin
  select * into lim from public.company_promo_limits where company_id=new.company_id;
  if not found or lim.products_unlimited then return new; end if;
  select count(*) into current_count from public.products where company_id=new.company_id and active=true and ((new.branch_id is null and branch_id is null) or branch_id=new.branch_id);
  if current_count >= lim.product_limit then raise exception using errcode='P0001', message='LIMITE_PRODUCTOS_PROMO: Alcanzaste el límite de 1.000 productos. Desbloqueá carga ilimitada por $4.900.'; end if;
  return new;
end$$;
drop trigger if exists enforce_promo_product_limit on public.products;
create trigger enforce_promo_product_limit before insert on public.products for each row execute function public.enforce_promo_product_limit();

create or replace function public.promo_fiscal_limit_status(p_company_id uuid)
returns jsonb language plpgsql security definer set search_path='public','pg_temp' as $$
declare lim public.company_promo_limits%rowtype; used integer; allowed integer;
begin
  select * into lim from public.company_promo_limits where company_id=p_company_id;
  if not found then return jsonb_build_object('managed',false,'allowed',true); end if;
  select count(*) into used from public.sales where company_id=p_company_id and fiscal_status='authorized' and cae is not null;
  allowed:=case when lim.fiscal_extended then lim.fiscal_extended_limit else lim.fiscal_base_limit end;
  return jsonb_build_object('managed',true,'allowed',used<allowed,'used',used,'limit',allowed,'extended',lim.fiscal_extended,'upgrade_available',not lim.fiscal_extended,'upgrade_price',4900);
end$$;
revoke all on function public.promo_fiscal_limit_status(uuid) from public,anon,authenticated;
grant execute on function public.promo_fiscal_limit_status(uuid) to service_role;

grant select on public.company_promo_limits to authenticated;
grant select on public.feature_purchases to authenticated;
drop policy if exists company_promo_limits_select on public.company_promo_limits;
create policy company_promo_limits_select on public.company_promo_limits for select to authenticated using (company_id=public.current_company_id());
drop policy if exists feature_purchases_select on public.feature_purchases;
create policy feature_purchases_select on public.feature_purchases for select to authenticated using (company_id=public.current_company_id());

create or replace function public.enroll_future_trial_signup_in_plan_impulso()
returns trigger language plpgsql security definer set search_path='public','pg_temp' as $$
begin
  if new.status = 'trialing' then insert into public.company_promo_limits(company_id) values (new.company_id) on conflict (company_id) do nothing; end if;
  return new;
end$$;
drop trigger if exists enroll_future_trial_signup_in_plan_impulso on public.company_subscriptions;
create trigger enroll_future_trial_signup_in_plan_impulso after insert on public.company_subscriptions for each row execute function public.enroll_future_trial_signup_in_plan_impulso();