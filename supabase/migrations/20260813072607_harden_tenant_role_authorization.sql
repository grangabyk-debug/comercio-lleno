-- Defense in depth for privileged RPCs and tables
revoke execute on function public.save_mobile_settings(boolean,boolean,boolean) from public, anon;
grant execute on function public.save_mobile_settings(boolean,boolean,boolean) to authenticated;

-- Legacy self-service company creation bypassed the current guarded trial flow.
revoke execute on function public.create_my_company(text,text,text) from public, anon, authenticated;
grant execute on function public.create_my_company(text,text,text) to service_role;

-- These tables are server-managed for writes.
revoke all privileges on table public.company_subscriptions from anon;
revoke insert, update, delete, truncate, references, trigger on table public.company_subscriptions from authenticated;
grant select on table public.company_subscriptions to authenticated;

revoke all privileges on table public.sales_deleted_archive from anon;
revoke insert, update, delete, truncate, references, trigger on table public.sales_deleted_archive from authenticated;
grant select on table public.sales_deleted_archive to authenticated;

-- Fix a permissive legacy fallback: missing permissions must never imply price-edit permission.
create or replace function public.bulk_increase_product_prices(p_target text, p_percent numeric)
returns jsonb
language plpgsql
security definer
set search_path = 'public', 'pg_temp'
as $$
declare
  v_uid uuid := auth.uid();
  v_company uuid;
  v_role text;
  v_permissions jsonb;
  v_allowed boolean := false;
  v_factor numeric;
  v_promoted integer := 0;
  v_regular integer := 0;
begin
  if v_uid is null then raise exception 'Usuario no autenticado'; end if;
  select company_id, role, permissions into v_company, v_role, v_permissions
  from public.profiles where id = v_uid and active = true;
  if v_company is null then raise exception 'Usuario sin comercio activo'; end if;

  v_allowed := v_role = 'owner'
    or coalesce((v_permissions->>'can_edit_products')::boolean, false)
    or coalesce((v_permissions->>'can_manage_stock')::boolean, false)
    or (v_role in ('manager','supervisor') and coalesce(v_permissions,'{}'::jsonb) = '{}'::jsonb);
  if not v_allowed then raise exception 'Sin permiso para modificar precios'; end if;
  if p_target not in ('retail','wholesale') then raise exception 'Tipo de precio inválido'; end if;
  if p_percent is null or p_percent <= 0 or p_percent > 500 then raise exception 'El porcentaje debe ser mayor a 0 y hasta 500'; end if;
  v_factor := 1 + (p_percent / 100.0);

  if p_target = 'wholesale' then
    update public.products
    set wholesale_price = round(coalesce(wholesale_price,0) * v_factor, 2), updated_at = now()
    where company_id = v_company and active = true;
    get diagnostics v_regular = row_count;
  else
    update public.promotions pr
    set original_price = round(coalesce(pr.original_price, p.price / nullif(1 - coalesce(pr.discount_percent,0)/100.0,0)) * v_factor, 2)
    from public.products p
    where pr.company_id = v_company and pr.active = true and pr.type = 'percent_discount'
      and pr.product_id = p.id and p.company_id = v_company and p.active = true;

    with latest_promo as (
      select distinct on (product_id) product_id, original_price, discount_percent
      from public.promotions
      where company_id = v_company and active = true and type = 'percent_discount' and product_id is not null
      order by product_id, created_at desc nulls last
    )
    update public.products p
    set price = round(coalesce(lp.original_price,p.price,0) * (1 - coalesce(lp.discount_percent,0)/100.0), 2), updated_at = now()
    from latest_promo lp
    where p.id = lp.product_id and p.company_id = v_company and p.active = true;
    get diagnostics v_promoted = row_count;

    update public.products p
    set price = round(coalesce(price,0) * v_factor, 2), updated_at = now()
    where p.company_id = v_company and p.active = true
      and not exists (
        select 1 from public.promotions pr
        where pr.company_id = v_company and pr.product_id = p.id and pr.active = true and pr.type = 'percent_discount'
      );
    get diagnostics v_regular = row_count;
  end if;

  return jsonb_build_object('ok', true, 'target', p_target, 'percent', p_percent, 'updated', v_promoted + v_regular, 'promoted', v_promoted);
end;
$$;

-- SALES: separate broad tenant reads from permission-gated writes.
drop policy if exists "authenticated users can manage company sales" on public.sales;
drop policy if exists "role restrict sale writes" on public.sales;
drop policy if exists "sales_company_isolation" on public.sales;
drop policy if exists "sales_tenant_select" on public.sales;
drop policy if exists "sales_authorized_insert" on public.sales;
drop policy if exists "sales_authorized_update" on public.sales;

create policy sales_tenant_select on public.sales
for select to authenticated
using (company_id = public.current_user_company_id());

create policy sales_authorized_insert on public.sales
for insert to authenticated
with check (
  company_id = public.current_user_company_id()
  and coalesce((select p.active and (p.role in ('owner','cashier') or coalesce((p.permissions->>'can_sell')::boolean,false)) from public.profiles p where p.id=auth.uid()),false)
);

create policy sales_authorized_update on public.sales
for update to authenticated
using (
  company_id = public.current_user_company_id()
  and coalesce((select p.active and (p.role in ('owner','cashier') or coalesce((p.permissions->>'can_sell')::boolean,false)) from public.profiles p where p.id=auth.uid()),false)
)
with check (
  company_id = public.current_user_company_id()
  and coalesce((select p.active and (p.role in ('owner','cashier') or coalesce((p.permissions->>'can_sell')::boolean,false)) from public.profiles p where p.id=auth.uid()),false)
);

-- SALE ITEMS: tenant read, only users allowed to sell may write.
drop policy if exists "authenticated users can manage company sale items" on public.sale_items;
drop policy if exists "sale_items_company_isolation" on public.sale_items;
drop policy if exists "sale_items_tenant_select" on public.sale_items;
drop policy if exists "sale_items_authorized_write" on public.sale_items;

create policy sale_items_tenant_select on public.sale_items
for select to authenticated
using (exists (select 1 from public.sales s where s.id=sale_items.sale_id and s.company_id=public.current_user_company_id()));

create policy sale_items_authorized_write on public.sale_items
for all to authenticated
using (
  exists (select 1 from public.sales s where s.id=sale_items.sale_id and s.company_id=public.current_user_company_id())
  and coalesce((select p.active and (p.role in ('owner','cashier') or coalesce((p.permissions->>'can_sell')::boolean,false)) from public.profiles p where p.id=auth.uid()),false)
)
with check (
  exists (select 1 from public.sales s where s.id=sale_items.sale_id and s.company_id=public.current_user_company_id())
  and coalesce((select p.active and (p.role in ('owner','cashier') or coalesce((p.permissions->>'can_sell')::boolean,false)) from public.profiles p where p.id=auth.uid()),false)
);

-- CUSTOMERS: everyone in the tenant may read for POS, mutations honor configured permissions.
drop policy if exists "authenticated users can manage company customers" on public.customers;
drop policy if exists "customers_company_isolation" on public.customers;
drop policy if exists "customers_tenant_select" on public.customers;
drop policy if exists "customers_authorized_insert" on public.customers;
drop policy if exists "customers_authorized_update" on public.customers;

create policy customers_tenant_select on public.customers
for select to authenticated
using (company_id = public.current_user_company_id());

create policy customers_authorized_insert on public.customers
for insert to authenticated
with check (
  company_id = public.current_user_company_id()
  and public.comercio_has_permission('can_manage_customers', false)
);

create policy customers_authorized_update on public.customers
for update to authenticated
using (
  company_id = public.current_user_company_id()
  and (public.comercio_has_permission('can_edit_customers', false) or public.comercio_has_permission('can_manage_customers', false))
)
with check (company_id = public.current_user_company_id());

-- SUPPLIERS: tenant read; writes require supplier-management permission.
drop policy if exists tenant_all on public.suppliers;
drop policy if exists suppliers_tenant_select on public.suppliers;
drop policy if exists suppliers_authorized_write on public.suppliers;
create policy suppliers_tenant_select on public.suppliers
for select to authenticated using (company_id = public.current_user_company_id());
create policy suppliers_authorized_write on public.suppliers
for all to authenticated
using (company_id = public.current_user_company_id() and public.comercio_has_permission('can_manage_suppliers', false))
with check (company_id = public.current_user_company_id() and public.comercio_has_permission('can_manage_suppliers', false));

-- PURCHASES and documents: tenant read; writes require purchase-management permission.
drop policy if exists tenant_all on public.purchases;
drop policy if exists purchases_tenant_select on public.purchases;
drop policy if exists purchases_authorized_write on public.purchases;
create policy purchases_tenant_select on public.purchases
for select to authenticated using (company_id = public.current_user_company_id());
create policy purchases_authorized_write on public.purchases
for all to authenticated
using (company_id = public.current_user_company_id() and public.comercio_has_permission('can_manage_purchases', false))
with check (company_id = public.current_user_company_id() and public.comercio_has_permission('can_manage_purchases', false));

drop policy if exists tenant_all on public.purchase_documents;
drop policy if exists purchase_documents_tenant_select on public.purchase_documents;
drop policy if exists purchase_documents_authorized_write on public.purchase_documents;
create policy purchase_documents_tenant_select on public.purchase_documents
for select to authenticated using (company_id = public.current_user_company_id());
create policy purchase_documents_authorized_write on public.purchase_documents
for all to authenticated
using (company_id = public.current_user_company_id() and public.comercio_has_permission('can_manage_purchases', false))
with check (company_id = public.current_user_company_id() and public.comercio_has_permission('can_manage_purchases', false));

drop policy if exists tenant_purchase_items on public.purchase_items;
drop policy if exists purchase_items_tenant_select on public.purchase_items;
drop policy if exists purchase_items_authorized_write on public.purchase_items;
create policy purchase_items_tenant_select on public.purchase_items
for select to authenticated
using (exists (select 1 from public.purchases p where p.id=purchase_items.purchase_id and p.company_id=public.current_user_company_id()));
create policy purchase_items_authorized_write on public.purchase_items
for all to authenticated
using (
  exists (select 1 from public.purchases p where p.id=purchase_items.purchase_id and p.company_id=public.current_user_company_id())
  and public.comercio_has_permission('can_manage_purchases', false)
)
with check (
  exists (select 1 from public.purchases p where p.id=purchase_items.purchase_id and p.company_id=public.current_user_company_id())
  and public.comercio_has_permission('can_manage_purchases', false)
);

-- Private purchase files must obey the same role permission as purchase rows.
drop policy if exists commerce_purchase_docs_select on storage.objects;
drop policy if exists commerce_purchase_docs_insert on storage.objects;
drop policy if exists commerce_purchase_docs_delete on storage.objects;

create policy commerce_purchase_docs_select on storage.objects
for select to authenticated
using (
  bucket_id='purchase-documents'
  and (storage.foldername(name))[1] = public.current_user_company_id()::text
  and public.comercio_has_permission('can_manage_purchases', false)
);
create policy commerce_purchase_docs_insert on storage.objects
for insert to authenticated
with check (
  bucket_id='purchase-documents'
  and (storage.foldername(name))[1] = public.current_user_company_id()::text
  and public.comercio_has_permission('can_manage_purchases', false)
);
create policy commerce_purchase_docs_delete on storage.objects
for delete to authenticated
using (
  bucket_id='purchase-documents'
  and (storage.foldername(name))[1] = public.current_user_company_id()::text
  and public.comercio_has_permission('can_manage_purchases', false)
);
