create or replace function public.validate_authorized_sale_against_arca()
returns trigger
language plpgsql
security definer
set search_path = 'public', 'pg_temp'
as $$
begin
  if new.fiscal_status = 'authorized' or new.cae is not null then
    if new.cae is null or new.receipt_number is null then
      raise exception 'La venta autorizada requiere CAE y número de comprobante';
    end if;

    if not exists (
      select 1
      from public.arca_invoice_requests r
      where r.company_id = new.company_id
        and r.request_id = new.id::text
        and r.status = 'authorized'
        and r.cae = new.cae
        and r.receipt_number::text = new.receipt_number::text
        and abs(r.amount - new.total) < 0.01
    ) then
      raise exception 'La autorización fiscal no coincide con una autorización ARCA válida para esta venta';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.validate_authorized_sale_against_arca() from public, anon, authenticated;
grant execute on function public.validate_authorized_sale_against_arca() to service_role;

drop trigger if exists validate_authorized_sale_arca on public.sales;
create trigger validate_authorized_sale_arca
before insert or update on public.sales
for each row execute function public.validate_authorized_sale_against_arca();
