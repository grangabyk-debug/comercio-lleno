alter table public.promotions add column if not exists discount_percent numeric;
alter table public.promotions add column if not exists original_price numeric;

alter table public.promotions drop constraint if exists promotions_discount_percent_check;
alter table public.promotions add constraint promotions_discount_percent_check
  check (discount_percent is null or (discount_percent > 0 and discount_percent < 100));

create unique index if not exists promotions_one_active_percent_discount_per_product
  on public.promotions(company_id, product_id)
  where active = true and type = 'percent_discount';

create or replace function public.comercio_has_permission(p_key text, p_legacy_supervisor_default boolean default false)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce((
    select p.active and (
      p.role = 'owner'
      or coalesce((p.permissions ->> p_key)::boolean, p_legacy_supervisor_default and p.role = 'supervisor', false)
    )
    from public.profiles p
    where p.id = auth.uid()
  ), false)
$$;
revoke all on function public.comercio_has_permission(text, boolean) from public, anon;
grant execute on function public.comercio_has_permission(text, boolean) to authenticated, service_role;

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
  v_permissions jsonb;
  v_active boolean;
  v_sale public.sales%rowtype;
  v_item record;
  v_json_item jsonb;
  v_restored integer := 0;
  v_allowed boolean := false;
begin
  if v_uid is null then raise exception 'Usuario no autenticado'; end if;
  select company_id, role, permissions, active into v_company, v_role, v_permissions, v_active
  from public.profiles where id = v_uid;
  v_allowed := coalesce(v_active,false) and (v_role = 'owner' or coalesce((v_permissions->>'can_delete_sales')::boolean,false));
  if v_company is null or not v_allowed then raise exception 'Tu usuario no tiene permiso para eliminar ventas'; end if;

  select * into v_sale from public.sales where id = p_sale_id and company_id = v_company for update;
  if not found then raise exception 'Venta no encontrada para este comercio'; end if;

  insert into public.sales_deleted_archive(company_id,sale_id,deleted_by,had_cae,fiscal_status,receipt_number,cae,sale_record)
  values(v_company,v_sale.id,v_uid,v_sale.cae is not null,v_sale.fiscal_status,v_sale.receipt_number,v_sale.cae,to_jsonb(v_sale));

  for v_item in select product_id,sum(quantity)::numeric as qty from public.sale_items where sale_id=p_sale_id and product_id is not null group by product_id
  loop
    update public.products set stock=stock+greatest(0,coalesce(v_item.qty,0)),updated_at=now() where id=v_item.product_id and company_id=v_company;
    if found then v_restored:=v_restored+1; end if;
  end loop;

  if v_restored=0 then
    for v_json_item in select value from jsonb_array_elements(coalesce(v_sale.details->'items','[]'::jsonb))
    loop
      if nullif(v_json_item->>'product_id','') is not null then
        update public.products set stock=stock+greatest(0,coalesce((v_json_item->>'qty')::numeric,0)),updated_at=now()
        where id=(v_json_item->>'product_id')::uuid and company_id=v_company;
        if found then v_restored:=v_restored+1; end if;
      end if;
    end loop;
  end if;

  delete from public.account_movements where sale_id=p_sale_id and company_id=v_company;
  delete from public.sales where id=p_sale_id and company_id=v_company;
  return jsonb_build_object('ok',true,'sale_id',p_sale_id,'stock_products_restored',v_restored,'fiscal_invoice_preserved_in_archive',v_sale.cae is not null);
end;
$$;
revoke all on function public.delete_sale_restore_stock(uuid) from public, anon;
grant execute on function public.delete_sale_restore_stock(uuid) to authenticated, service_role;

create or replace function public.update_customer_authorized(p_customer_id uuid,p_name text,p_phone text,p_email text,p_tax_id text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_company uuid;v_role text;v_permissions jsonb;v_active boolean;v_allowed boolean;
begin
  select company_id,role,permissions,active into v_company,v_role,v_permissions,v_active from public.profiles where id=auth.uid();
  v_allowed:=coalesce(v_active,false) and (v_role='owner' or coalesce((v_permissions->>'can_edit_customers')::boolean,(v_permissions->>'can_manage_customers')::boolean,false));
  if not v_allowed then raise exception 'Tu usuario no tiene permiso para editar clientes'; end if;
  update public.customers set name=trim(p_name),phone=nullif(trim(coalesce(p_phone,'')),''),email=nullif(trim(coalesce(p_email,'')),''),tax_id=nullif(trim(coalesce(p_tax_id,'')),'') where id=p_customer_id and company_id=v_company;
  if not found then raise exception 'Cliente no encontrado para este comercio'; end if;
end;
$$;

create or replace function public.delete_customer_authorized(p_customer_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_company uuid;v_role text;v_permissions jsonb;v_active boolean;
begin
  select company_id,role,permissions,active into v_company,v_role,v_permissions,v_active from public.profiles where id=auth.uid();
  if not (coalesce(v_active,false) and (v_role='owner' or coalesce((v_permissions->>'can_delete_customers')::boolean,false))) then raise exception 'Tu usuario no tiene permiso para eliminar clientes'; end if;
  delete from public.customers where id=p_customer_id and company_id=v_company;
  if not found then raise exception 'Cliente no encontrado para este comercio'; end if;
end;
$$;
revoke all on function public.update_customer_authorized(uuid,text,text,text,text) from public, anon;
revoke all on function public.delete_customer_authorized(uuid) from public, anon;
grant execute on function public.update_customer_authorized(uuid,text,text,text,text) to authenticated, service_role;
grant execute on function public.delete_customer_authorized(uuid) to authenticated, service_role;

create or replace function public.apply_percentage_promotion(p_product_ids uuid[],p_discount_percent numeric,p_name text default null)
returns table(product_id uuid,original_price numeric,new_price numeric,promotion_id uuid)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_company uuid;v_role text;v_permissions jsonb;v_active boolean;v_product record;v_base numeric;v_new numeric;v_promo uuid;
begin
  select p.company_id,p.role,p.permissions,p.active into v_company,v_role,v_permissions,v_active from public.profiles p where p.id=auth.uid();
  if not (coalesce(v_active,false) and (v_role='owner' or coalesce((v_permissions->>'can_manage_promotions')::boolean,v_role='supervisor',false))) then raise exception 'Tu usuario no tiene permiso para administrar promociones'; end if;
  if p_discount_percent is null or p_discount_percent<=0 or p_discount_percent>=100 then raise exception 'El descuento debe ser mayor a 0 y menor a 100'; end if;
  if coalesce(array_length(p_product_ids,1),0)=0 then raise exception 'Seleccioná al menos un producto'; end if;
  for v_product in select p.id,p.price from public.products p where p.company_id=v_company and p.active=true and p.id=any(p_product_ids) for update
  loop
    v_base:=null;
    select pr.original_price into v_base from public.promotions pr where pr.company_id=v_company and pr.product_id=v_product.id and pr.type='percent_discount' and pr.active=true order by pr.created_at desc limit 1;
    v_base:=coalesce(v_base,v_product.price,0);
    update public.promotions pr set active=false where pr.company_id=v_company and pr.product_id=v_product.id and pr.type='percent_discount' and pr.active=true;
    v_new:=round((v_base*(100-p_discount_percent)/100.0)::numeric,2);
    update public.products p set price=v_new,updated_at=now() where p.id=v_product.id and p.company_id=v_company;
    insert into public.promotions(company_id,name,type,product_id,active,discount_percent,original_price,starts_at)
    values(v_company,coalesce(nullif(trim(p_name),''),'Oferta '||trim(to_char(p_discount_percent,'FM999990D##'))||'%'),'percent_discount',v_product.id,true,p_discount_percent,v_base,now()) returning id into v_promo;
    product_id:=v_product.id;original_price:=v_base;new_price:=v_new;promotion_id:=v_promo;return next;
  end loop;
end;
$$;

create or replace function public.remove_percentage_promotion(p_promotion_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_company uuid;v_role text;v_permissions jsonb;v_active boolean;v_promo public.promotions%rowtype;
begin
  select company_id,role,permissions,active into v_company,v_role,v_permissions,v_active from public.profiles where id=auth.uid();
  if not (coalesce(v_active,false) and (v_role='owner' or coalesce((v_permissions->>'can_manage_promotions')::boolean,v_role='supervisor',false))) then raise exception 'Tu usuario no tiene permiso para administrar promociones'; end if;
  select * into v_promo from public.promotions where id=p_promotion_id and company_id=v_company and type='percent_discount' and active=true for update;
  if not found then raise exception 'Promoción no encontrada o ya inactiva'; end if;
  update public.products set price=coalesce(v_promo.original_price,price),updated_at=now() where id=v_promo.product_id and company_id=v_company;
  update public.promotions set active=false where id=v_promo.id;
  return jsonb_build_object('ok',true,'product_id',v_promo.product_id,'restored_price',v_promo.original_price);
end;
$$;
revoke all on function public.apply_percentage_promotion(uuid[],numeric,text) from public, anon;
revoke all on function public.remove_percentage_promotion(uuid) from public, anon;
grant execute on function public.apply_percentage_promotion(uuid[],numeric,text) to authenticated, service_role;
grant execute on function public.remove_percentage_promotion(uuid) to authenticated, service_role;

create or replace function public.enrich_sale_promotion_details()
returns trigger
language plpgsql
set search_path=public,pg_temp
as $$
declare v_item jsonb;v_items jsonb:='[]'::jsonb;v_pid uuid;v_original numeric;v_discount numeric;v_paid numeric;v_qty numeric;v_saving numeric;v_total_saving numeric:=0;
begin
  if new.details is null or jsonb_typeof(new.details->'items')<>'array' then return new; end if;
  for v_item in select value from jsonb_array_elements(new.details->'items')
  loop
    begin v_pid:=nullif(v_item->>'product_id','')::uuid; exception when others then v_pid:=null; end;
    if v_pid is not null then
      select p.original_price,p.discount_percent into v_original,v_discount from public.promotions p where p.company_id=new.company_id and p.product_id=v_pid and p.type='percent_discount' and p.active=true order by p.created_at desc limit 1;
      if found and v_original is not null then
        v_paid:=coalesce((v_item->>'unit_price')::numeric,0);v_qty:=coalesce((v_item->>'qty')::numeric,0);v_saving:=greatest(0,(v_original-v_paid)*v_qty);v_total_saving:=v_total_saving+v_saving;
        v_item:=v_item||jsonb_build_object('original_unit_price',v_original,'promotion_discount_percent',v_discount,'promotion_savings',v_saving);
      end if;
    end if;
    v_items:=v_items||jsonb_build_array(v_item);
  end loop;
  new.details:=jsonb_set(coalesce(new.details,'{}'::jsonb),'{items}',v_items,true)||jsonb_build_object('promotion_savings',v_total_saving);
  return new;
end;
$$;
drop trigger if exists trg_enrich_sale_promotion_details on public.sales;
create trigger trg_enrich_sale_promotion_details before insert on public.sales for each row execute function public.enrich_sale_promotion_details();
