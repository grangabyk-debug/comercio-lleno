create table if not exists public.sales_deleted_archive (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  sale_id uuid not null,
  deleted_by uuid not null,
  deleted_at timestamptz not null default now(),
  had_cae boolean not null default false,
  fiscal_status text,
  receipt_number text,
  cae text,
  sale_record jsonb not null
);

create index if not exists sales_deleted_archive_company_deleted_idx
  on public.sales_deleted_archive(company_id, deleted_at desc);

alter table public.sales_deleted_archive enable row level security;

drop policy if exists sales_deleted_archive_owner_read on public.sales_deleted_archive;
create policy sales_deleted_archive_owner_read
on public.sales_deleted_archive
for select
to authenticated
using (
  company_id = (select p.company_id from public.profiles p where p.id = auth.uid())
  and (select p.role = 'owner' and p.active from public.profiles p where p.id = auth.uid())
);

create or replace function public.delete_sale_restore_stock(p_sale_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_company uuid;
  v_role text;
  v_active boolean;
  v_sale public.sales%rowtype;
  v_item record;
  v_json_item jsonb;
  v_restored integer := 0;
begin
  if v_uid is null then raise exception 'Usuario no autenticado'; end if;

  select company_id, role, active into v_company, v_role, v_active
  from public.profiles where id = v_uid;

  if v_company is null or coalesce(v_active,false) is false or v_role <> 'owner' then
    raise exception 'Solo el propietario puede eliminar ventas';
  end if;

  select * into v_sale from public.sales
  where id = p_sale_id and company_id = v_company for update;
  if not found then raise exception 'Venta no encontrada para este comercio'; end if;

  insert into public.sales_deleted_archive(company_id,sale_id,deleted_by,had_cae,fiscal_status,receipt_number,cae,sale_record)
  values (v_company,v_sale.id,v_uid,v_sale.cae is not null,v_sale.fiscal_status,v_sale.receipt_number,v_sale.cae,to_jsonb(v_sale));

  for v_item in
    select product_id, sum(quantity)::numeric as qty
    from public.sale_items where sale_id = p_sale_id and product_id is not null group by product_id
  loop
    update public.products set stock = stock + greatest(0,coalesce(v_item.qty,0)), updated_at = now()
    where id = v_item.product_id and company_id = v_company;
    if found then v_restored := v_restored + 1; end if;
  end loop;

  if v_restored = 0 then
    for v_json_item in select value from jsonb_array_elements(coalesce(v_sale.details->'items','[]'::jsonb))
    loop
      if nullif(v_json_item->>'product_id','') is not null then
        update public.products
        set stock = stock + greatest(0,coalesce((v_json_item->>'qty')::numeric,0)), updated_at = now()
        where id = (v_json_item->>'product_id')::uuid and company_id = v_company;
        if found then v_restored := v_restored + 1; end if;
      end if;
    end loop;
  end if;

  delete from public.account_movements where sale_id = p_sale_id and company_id = v_company;
  delete from public.sales where id = p_sale_id and company_id = v_company;

  return jsonb_build_object('ok',true,'sale_id',p_sale_id,'stock_products_restored',v_restored,'fiscal_invoice_preserved_in_archive',v_sale.cae is not null);
end;
$$;

revoke all on function public.delete_sale_restore_stock(uuid) from public;
revoke all on function public.delete_sale_restore_stock(uuid) from anon;
grant execute on function public.delete_sale_restore_stock(uuid) to authenticated;
