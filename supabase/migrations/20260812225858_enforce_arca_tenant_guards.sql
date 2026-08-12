create or replace function public.enforce_enabled_arca_tenant()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.arca_tenant_settings s
    where s.company_id = new.company_id and s.enabled = true
  ) then
    raise exception 'ARCA is not enabled for this tenant' using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_enabled_arca_tenant() from public, anon, authenticated;
grant execute on function public.enforce_enabled_arca_tenant() to service_role;

drop trigger if exists enforce_arca_cache_tenant on public.arca_wsaa_cache;
create trigger enforce_arca_cache_tenant
before insert or update of company_id on public.arca_wsaa_cache
for each row execute function public.enforce_enabled_arca_tenant();

drop trigger if exists enforce_arca_request_tenant on public.arca_invoice_requests;
create trigger enforce_arca_request_tenant
before insert or update of company_id on public.arca_invoice_requests
for each row execute function public.enforce_enabled_arca_tenant();

delete from public.arca_wsaa_cache w
where not exists (
  select 1 from public.arca_tenant_settings s
  where s.company_id=w.company_id and s.enabled=true
);
