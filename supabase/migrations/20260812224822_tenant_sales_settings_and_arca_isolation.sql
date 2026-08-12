alter table public.companies
  add column if not exists sales_settings jsonb not null
  default '{"allowNegativeStock":false,"timeFormat":"24","maxDiscount":100}'::jsonb;

update public.companies
set sales_settings = '{"allowNegativeStock":false,"timeFormat":"24","maxDiscount":100}'::jsonb || coalesce(sales_settings,'{}'::jsonb);

create table if not exists public.arca_tenant_settings (
  company_id uuid primary key references public.companies(id) on delete cascade,
  enabled boolean not null default false,
  environment text not null default 'homologacion' check (environment in ('homologacion','produccion')),
  tax_id text not null,
  point_of_sale integer not null default 1 check (point_of_sale > 0),
  receipt_type integer not null default 11 check (receipt_type > 0),
  credential_slot text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.arca_tenant_settings enable row level security;
revoke all on public.arca_tenant_settings from anon;
revoke insert, update, delete on public.arca_tenant_settings from authenticated;
grant select on public.arca_tenant_settings to authenticated;
grant all on public.arca_tenant_settings to service_role;

drop policy if exists arca_tenant_settings_read_own on public.arca_tenant_settings;
create policy arca_tenant_settings_read_own on public.arca_tenant_settings
for select to authenticated
using (company_id = public.current_user_company_id());

insert into public.arca_tenant_settings(company_id,enabled,environment,tax_id,point_of_sale,receipt_type,credential_slot,updated_at)
select id,true,'homologacion',regexp_replace(tax_id,'\D','','g'),1,11,'pilot_default',now()
from public.companies
where regexp_replace(coalesce(tax_id,''),'\D','','g')='20384224076'
on conflict (company_id) do update set
  enabled=excluded.enabled,
  environment=excluded.environment,
  tax_id=excluded.tax_id,
  point_of_sale=excluded.point_of_sale,
  receipt_type=excluded.receipt_type,
  credential_slot=excluded.credential_slot,
  updated_at=now();

delete from public.arca_wsaa_cache c
where not exists (
  select 1 from public.arca_tenant_settings s
  where s.company_id=c.company_id and s.enabled=true
);
