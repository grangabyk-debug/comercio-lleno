alter table public.companies add column if not exists owner_phone text;
alter table public.companies add column if not exists country text;
alter table public.companies add column if not exists province text;
alter table public.companies add column if not exists address text;
alter table public.companies add column if not exists onboarding_complete boolean not null default true;

alter table public.cash_registers add column if not exists opened_by uuid references auth.users(id) on delete set null;
alter table public.cash_registers add column if not exists closed_by uuid references auth.users(id) on delete set null;
alter table public.cash_registers add column if not exists close_summary jsonb not null default '{}'::jsonb;
create unique index if not exists cash_registers_one_open_per_company on public.cash_registers(company_id) where status='open';
create index if not exists cash_registers_company_opened_idx on public.cash_registers(company_id,opened_at desc);

create table if not exists public.branches(id uuid primary key default gen_random_uuid(),company_id uuid not null references public.companies(id) on delete cascade,name text not null,address text,country text,province text,is_primary boolean not null default false,active boolean not null default true,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create index if not exists branches_company_idx on public.branches(company_id,active);
create unique index if not exists branches_one_primary_per_company on public.branches(company_id) where is_primary=true and active=true;
alter table public.branches enable row level security;
drop policy if exists branches_tenant_select on public.branches;create policy branches_tenant_select on public.branches for select to authenticated using(company_id=public.current_user_company_id());
drop policy if exists branches_owner_write on public.branches;create policy branches_owner_write on public.branches for all to authenticated using(company_id=public.current_user_company_id() and public.current_user_role()='owner') with check(company_id=public.current_user_company_id() and public.current_user_role()='owner');
revoke all on public.branches from anon;grant select,insert,update,delete on public.branches to authenticated;
insert into public.branches(company_id,name,address,country,province,is_primary,active) select c.id,c.name,c.address,c.country,c.province,true,true from public.companies c where not exists(select 1 from public.branches b where b.company_id=c.id and b.active=true);

create table if not exists public.finance_expenses(id uuid primary key default gen_random_uuid(),company_id uuid not null references public.companies(id) on delete cascade,branch_id uuid references public.branches(id) on delete set null,category text not null default 'other',description text not null,amount numeric not null check(amount>=0),due_date date,paid_at timestamptz,status text not null default 'pending' check(status in('pending','paid')),recurrence text not null default 'once' check(recurrence in('once','monthly','yearly')),notes text,created_by uuid default auth.uid() references auth.users(id) on delete set null,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create index if not exists finance_expenses_company_due_idx on public.finance_expenses(company_id,due_date desc);create index if not exists finance_expenses_company_status_idx on public.finance_expenses(company_id,status);
alter table public.finance_expenses enable row level security;
drop policy if exists finance_expenses_tenant_access on public.finance_expenses;create policy finance_expenses_tenant_access on public.finance_expenses for all to authenticated using(company_id=public.current_user_company_id() and(public.current_user_role()='owner' or public.comercio_has_permission('can_manage_finances',false))) with check(company_id=public.current_user_company_id() and(public.current_user_role()='owner' or public.comercio_has_permission('can_manage_finances',false)));
revoke all on public.finance_expenses from anon;grant select,insert,update,delete on public.finance_expenses to authenticated;

update public.companies c set owner_phone=nullif(trim(coalesce(u.raw_user_meta_data->>'phone','')),'') from public.profiles p join auth.users u on u.id=p.id where p.company_id=c.id and p.role='owner' and c.owner_phone is null;

create or replace function public.open_cash_register_authorized(p_opening_amount numeric default 0) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare v_uid uuid:=auth.uid();v_company uuid;v_role text;v_permissions jsonb;v_active boolean;v_allowed boolean;v_row public.cash_registers%rowtype;
begin if v_uid is null then raise exception 'Usuario no autenticado';end if;select company_id,role,permissions,active into v_company,v_role,v_permissions,v_active from public.profiles where id=v_uid;v_allowed:=coalesce(v_active,false) and(v_role='owner' or coalesce((v_permissions->>'can_open_close_cash')::boolean,v_role in('cashier','manager','supervisor'),false));if v_company is null or not v_allowed then raise exception 'Tu usuario no tiene permiso para abrir la caja';end if;select * into v_row from public.cash_registers where company_id=v_company and status='open' order by opened_at desc limit 1;if found then raise exception 'Ya hay una caja abierta para este comercio';end if;insert into public.cash_registers(company_id,name,status,opening_amount,opened_at,opened_by,close_summary) values(v_company,'Caja principal','open',greatest(0,coalesce(p_opening_amount,0)),now(),v_uid,'{}'::jsonb) returning * into v_row;return to_jsonb(v_row);end;$$;
revoke all on function public.open_cash_register_authorized(numeric) from public,anon;grant execute on function public.open_cash_register_authorized(numeric) to authenticated,service_role;
