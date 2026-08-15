create or replace function private.assign_primary_branch()
returns trigger
language plpgsql
security definer
set search_path = 'public', 'pg_temp'
as $$
begin
  if new.branch_id is null then
    select b.id into new.branch_id from public.branches b where b.company_id=new.company_id and b.is_primary=true and b.active=true order by b.created_at asc limit 1;
  end if;
  if new.branch_id is null or not exists(select 1 from public.branches b where b.id=new.branch_id and b.company_id=new.company_id and b.active=true) then
    raise exception 'Sucursal inválida para este comercio';
  end if;
  return new;
end
$$;
revoke all on function private.assign_primary_branch() from public, anon, authenticated;

alter table public.products add column branch_id uuid;
alter table public.sales add column branch_id uuid;
alter table public.cash_registers add column branch_id uuid;
alter table public.cash_movements add column branch_id uuid;
alter table public.purchases add column branch_id uuid;
alter table public.returns add column branch_id uuid;
alter table public.stock_movements add column branch_id uuid;
alter table public.suspended_sales add column branch_id uuid;
alter table public.promotions add column branch_id uuid;
alter table public.cash_register_history add column branch_id uuid;
alter table public.sales_deleted_archive add column branch_id uuid;

alter table public.products disable trigger enforce_subscription_write;
alter table public.sales disable trigger enforce_subscription_write;
alter table public.cash_registers disable trigger enforce_subscription_write;
alter table public.cash_movements disable trigger enforce_subscription_write;
alter table public.purchases disable trigger enforce_subscription_write;
alter table public.returns disable trigger enforce_subscription_write;
alter table public.stock_movements disable trigger enforce_subscription_write;
alter table public.suspended_sales disable trigger enforce_subscription_write;
alter table public.promotions disable trigger enforce_subscription_write;
alter table public.finance_expenses disable trigger enforce_subscription_write;

update public.products t set branch_id=b.id from public.branches b where t.branch_id is null and b.company_id=t.company_id and b.is_primary=true and b.active=true;
update public.sales t set branch_id=b.id from public.branches b where t.branch_id is null and b.company_id=t.company_id and b.is_primary=true and b.active=true;
update public.cash_registers t set branch_id=b.id from public.branches b where t.branch_id is null and b.company_id=t.company_id and b.is_primary=true and b.active=true;
update public.cash_movements t set branch_id=b.id from public.branches b where t.branch_id is null and b.company_id=t.company_id and b.is_primary=true and b.active=true;
update public.purchases t set branch_id=b.id from public.branches b where t.branch_id is null and b.company_id=t.company_id and b.is_primary=true and b.active=true;
update public.returns t set branch_id=b.id from public.branches b where t.branch_id is null and b.company_id=t.company_id and b.is_primary=true and b.active=true;
update public.stock_movements t set branch_id=b.id from public.branches b where t.branch_id is null and b.company_id=t.company_id and b.is_primary=true and b.active=true;
update public.suspended_sales t set branch_id=b.id from public.branches b where t.branch_id is null and b.company_id=t.company_id and b.is_primary=true and b.active=true;
update public.promotions t set branch_id=b.id from public.branches b where t.branch_id is null and b.company_id=t.company_id and b.is_primary=true and b.active=true;
update public.cash_register_history t set branch_id=b.id from public.branches b where t.branch_id is null and b.company_id=t.company_id and b.is_primary=true and b.active=true;
update public.sales_deleted_archive t set branch_id=b.id from public.branches b where t.branch_id is null and b.company_id=t.company_id and b.is_primary=true and b.active=true;
update public.finance_expenses t set branch_id=b.id from public.branches b where t.branch_id is null and b.company_id=t.company_id and b.is_primary=true and b.active=true;

alter table public.products enable trigger enforce_subscription_write;
alter table public.sales enable trigger enforce_subscription_write;
alter table public.cash_registers enable trigger enforce_subscription_write;
alter table public.cash_movements enable trigger enforce_subscription_write;
alter table public.purchases enable trigger enforce_subscription_write;
alter table public.returns enable trigger enforce_subscription_write;
alter table public.stock_movements enable trigger enforce_subscription_write;
alter table public.suspended_sales enable trigger enforce_subscription_write;
alter table public.promotions enable trigger enforce_subscription_write;
alter table public.finance_expenses enable trigger enforce_subscription_write;

alter table public.products alter column branch_id set not null;
alter table public.sales alter column branch_id set not null;
alter table public.cash_registers alter column branch_id set not null;
alter table public.cash_movements alter column branch_id set not null;
alter table public.purchases alter column branch_id set not null;
alter table public.returns alter column branch_id set not null;
alter table public.stock_movements alter column branch_id set not null;
alter table public.suspended_sales alter column branch_id set not null;
alter table public.promotions alter column branch_id set not null;
alter table public.cash_register_history alter column branch_id set not null;
alter table public.sales_deleted_archive alter column branch_id set not null;
alter table public.finance_expenses alter column branch_id set not null;

alter table public.products add constraint products_branch_fkey foreign key(company_id,branch_id) references public.branches(company_id,id);
alter table public.sales add constraint sales_branch_fkey foreign key(company_id,branch_id) references public.branches(company_id,id);
alter table public.cash_registers add constraint cash_registers_branch_fkey foreign key(company_id,branch_id) references public.branches(company_id,id);
alter table public.cash_movements add constraint cash_movements_branch_fkey foreign key(company_id,branch_id) references public.branches(company_id,id);
alter table public.purchases add constraint purchases_branch_fkey foreign key(company_id,branch_id) references public.branches(company_id,id);
alter table public.returns add constraint returns_branch_fkey foreign key(company_id,branch_id) references public.branches(company_id,id);
alter table public.stock_movements add constraint stock_movements_branch_fkey foreign key(company_id,branch_id) references public.branches(company_id,id);
alter table public.suspended_sales add constraint suspended_sales_branch_fkey foreign key(company_id,branch_id) references public.branches(company_id,id);
alter table public.promotions add constraint promotions_branch_fkey foreign key(company_id,branch_id) references public.branches(company_id,id);
alter table public.cash_register_history add constraint cash_register_history_branch_fkey foreign key(company_id,branch_id) references public.branches(company_id,id);
alter table public.sales_deleted_archive add constraint sales_deleted_archive_branch_fkey foreign key(company_id,branch_id) references public.branches(company_id,id);
alter table public.finance_expenses add constraint finance_expenses_branch_fkey foreign key(company_id,branch_id) references public.branches(company_id,id);

create index products_company_branch_idx on public.products(company_id,branch_id) where active=true;
create index sales_company_branch_sold_idx on public.sales(company_id,branch_id,sold_at desc);
create index cash_registers_company_branch_idx on public.cash_registers(company_id,branch_id);
create index cash_movements_company_branch_idx on public.cash_movements(company_id,branch_id,occurred_at desc);
create index purchases_company_branch_idx on public.purchases(company_id,branch_id,purchased_at desc);

alter table public.products drop constraint products_company_id_barcode_key;
alter table public.products add constraint products_company_branch_barcode_key unique(company_id,branch_id,barcode);

drop trigger if exists assign_primary_branch_products on public.products;
create trigger assign_primary_branch_products before insert on public.products for each row execute function private.assign_primary_branch();
drop trigger if exists assign_primary_branch_sales on public.sales;
create trigger assign_primary_branch_sales before insert on public.sales for each row execute function private.assign_primary_branch();
drop trigger if exists assign_primary_branch_cash_registers on public.cash_registers;
create trigger assign_primary_branch_cash_registers before insert on public.cash_registers for each row execute function private.assign_primary_branch();
drop trigger if exists assign_primary_branch_cash_movements on public.cash_movements;
create trigger assign_primary_branch_cash_movements before insert on public.cash_movements for each row execute function private.assign_primary_branch();
drop trigger if exists assign_primary_branch_purchases on public.purchases;
create trigger assign_primary_branch_purchases before insert on public.purchases for each row execute function private.assign_primary_branch();
drop trigger if exists assign_primary_branch_returns on public.returns;
create trigger assign_primary_branch_returns before insert on public.returns for each row execute function private.assign_primary_branch();
drop trigger if exists assign_primary_branch_stock_movements on public.stock_movements;
create trigger assign_primary_branch_stock_movements before insert on public.stock_movements for each row execute function private.assign_primary_branch();
drop trigger if exists assign_primary_branch_suspended_sales on public.suspended_sales;
create trigger assign_primary_branch_suspended_sales before insert on public.suspended_sales for each row execute function private.assign_primary_branch();
drop trigger if exists assign_primary_branch_promotions on public.promotions;
create trigger assign_primary_branch_promotions before insert on public.promotions for each row execute function private.assign_primary_branch();
drop trigger if exists assign_primary_branch_cash_history on public.cash_register_history;
create trigger assign_primary_branch_cash_history before insert on public.cash_register_history for each row execute function private.assign_primary_branch();
drop trigger if exists assign_primary_branch_sales_archive on public.sales_deleted_archive;
create trigger assign_primary_branch_sales_archive before insert on public.sales_deleted_archive for each row execute function private.assign_primary_branch();
drop trigger if exists assign_primary_branch_finance on public.finance_expenses;
create trigger assign_primary_branch_finance before insert on public.finance_expenses for each row execute function private.assign_primary_branch();

drop policy if exists "authenticated users can read company products" on public.products;
drop policy if exists products_insert_granular on public.products;
drop policy if exists products_update_granular on public.products;
drop policy if exists products_delete_granular on public.products;
create policy products_branch_select on public.products for select to authenticated using (company_id=public.current_user_company_id() and public.can_access_branch(branch_id));
create policy products_branch_insert on public.products for insert to authenticated with check (company_id=public.current_user_company_id() and public.can_access_branch(branch_id) and (public.branch_has_permission(branch_id,'can_edit_products',array['manager','supervisor']) or public.branch_has_permission(branch_id,'can_manage_stock',array['manager','supervisor']) or public.branch_has_permission(branch_id,'can_import_export_products',array['manager','supervisor'])));
create policy products_branch_update on public.products for update to authenticated using (company_id=public.current_user_company_id() and public.can_access_branch(branch_id) and (public.branch_has_permission(branch_id,'can_edit_products',array['manager','supervisor']) or public.branch_has_permission(branch_id,'can_manage_stock',array['manager','supervisor']) or public.branch_has_permission(branch_id,'can_import_export_products',array['manager','supervisor']))) with check (company_id=public.current_user_company_id() and public.can_access_branch(branch_id));
create policy products_branch_delete on public.products for delete to authenticated using (company_id=public.current_user_company_id() and public.can_access_branch(branch_id) and (public.branch_has_permission(branch_id,'can_edit_products',array['manager','supervisor']) or public.branch_has_permission(branch_id,'can_manage_stock',array['manager','supervisor'])));

drop policy if exists sales_tenant_select on public.sales;
drop policy if exists sales_authorized_insert on public.sales;
drop policy if exists sales_authorized_update on public.sales;
create policy sales_branch_select on public.sales for select to authenticated using (company_id=public.current_user_company_id() and public.can_access_branch(branch_id));
create policy sales_branch_insert on public.sales for insert to authenticated with check (company_id=public.current_user_company_id() and public.branch_has_permission(branch_id,'can_sell',array['cashier','seller','manager','supervisor']));
create policy sales_branch_update on public.sales for update to authenticated using (company_id=public.current_user_company_id() and public.branch_has_permission(branch_id,'can_sell',array['cashier','seller','manager','supervisor'])) with check (company_id=public.current_user_company_id() and public.can_access_branch(branch_id));

drop policy if exists cash_registers_tenant_select on public.cash_registers;
create policy cash_registers_branch_select on public.cash_registers for select to authenticated using (company_id=public.current_user_company_id() and public.can_access_branch(branch_id));
create policy cash_registers_branch_insert on public.cash_registers for insert to authenticated with check (company_id=public.current_user_company_id() and public.branch_has_permission(branch_id,'can_open_close_cash',array['cashier','manager','supervisor']));
create policy cash_registers_branch_update on public.cash_registers for update to authenticated using (company_id=public.current_user_company_id() and public.branch_has_permission(branch_id,'can_open_close_cash',array['cashier','manager','supervisor'])) with check (company_id=public.current_user_company_id() and public.can_access_branch(branch_id));

drop policy if exists cash_movements_authorized_select on public.cash_movements;
drop policy if exists cash_movements_authorized_insert on public.cash_movements;
create policy cash_movements_branch_select on public.cash_movements for select to authenticated using (company_id=public.current_user_company_id() and public.can_access_branch(branch_id) and public.branch_has_permission(branch_id,'can_open_close_cash',array['cashier','manager','supervisor']));
create policy cash_movements_branch_insert on public.cash_movements for insert to authenticated with check (company_id=public.current_user_company_id() and public.branch_has_permission(branch_id,'can_open_close_cash',array['cashier','manager','supervisor']));

drop policy if exists purchases_tenant_select on public.purchases;
drop policy if exists purchases_authorized_write on public.purchases;
create policy purchases_branch_select on public.purchases for select to authenticated using (company_id=public.current_user_company_id() and public.can_access_branch(branch_id));
create policy purchases_branch_write on public.purchases for all to authenticated using (company_id=public.current_user_company_id() and public.branch_has_permission(branch_id,'can_manage_purchases',array['manager','supervisor'])) with check (company_id=public.current_user_company_id() and public.branch_has_permission(branch_id,'can_manage_purchases',array['manager','supervisor']));

drop policy if exists promotions_select_company on public.promotions;
drop policy if exists promotions_insert_granular on public.promotions;
drop policy if exists promotions_update_granular on public.promotions;
drop policy if exists promotions_delete_granular on public.promotions;
create policy promotions_branch_select on public.promotions for select to authenticated using (company_id=public.current_user_company_id() and public.can_access_branch(branch_id));
create policy promotions_branch_insert on public.promotions for insert to authenticated with check (company_id=public.current_user_company_id() and public.branch_has_permission(branch_id,'can_manage_promotions',array['manager','supervisor']));
create policy promotions_branch_update on public.promotions for update to authenticated using (company_id=public.current_user_company_id() and public.branch_has_permission(branch_id,'can_manage_promotions',array['manager','supervisor'])) with check (company_id=public.current_user_company_id() and public.can_access_branch(branch_id));
create policy promotions_branch_delete on public.promotions for delete to authenticated using (company_id=public.current_user_company_id() and public.branch_has_permission(branch_id,'can_manage_promotions',array['manager','supervisor']));

drop policy if exists tenant_all on public.returns;
create policy returns_branch_access on public.returns for all to authenticated using (company_id=public.current_user_company_id() and public.can_access_branch(branch_id)) with check (company_id=public.current_user_company_id() and public.can_access_branch(branch_id));
drop policy if exists tenant_all on public.stock_movements;
create policy stock_movements_branch_access on public.stock_movements for all to authenticated using (company_id=public.current_user_company_id() and public.can_access_branch(branch_id)) with check (company_id=public.current_user_company_id() and public.can_access_branch(branch_id));
drop policy if exists tenant_all on public.suspended_sales;
create policy suspended_sales_branch_access on public.suspended_sales for all to authenticated using (company_id=public.current_user_company_id() and public.can_access_branch(branch_id)) with check (company_id=public.current_user_company_id() and public.can_access_branch(branch_id));

drop policy if exists finance_expenses_tenant_access on public.finance_expenses;
create policy finance_expenses_branch_access on public.finance_expenses for all to authenticated using (company_id=public.current_user_company_id() and public.branch_has_permission(branch_id,'can_manage_finances',array['manager','supervisor'])) with check (company_id=public.current_user_company_id() and public.branch_has_permission(branch_id,'can_manage_finances',array['manager','supervisor']));

create or replace function public.persist_sale_atomic(p_sale jsonb)
returns boolean
language plpgsql
security definer
set search_path='public','pg_temp'
as $$
declare
  v_company uuid := public.current_user_company_id(); v_branch uuid; v_sale_id uuid; v_sale_company uuid;
  v_details jsonb := coalesce(p_sale->'details','{}'::jsonb); v_items jsonb := coalesce(p_sale->'details'->'items','[]'::jsonb);
  v_item jsonb; v_product_id uuid; v_qty numeric; v_stock numeric; v_allow_without_stock boolean:=false; v_max_discount numeric:=100;
  v_subtotal numeric; v_total numeric; v_discount numeric; v_items_subtotal numeric:=0; v_items_count integer:=0; v_existing_company uuid;
begin
  if auth.uid() is null or v_company is null then raise exception 'Usuario o suscripción no disponibles'; end if;
  begin v_sale_id := (p_sale->>'id')::uuid; v_sale_company := (p_sale->>'company_id')::uuid; v_branch := nullif(p_sale->>'branch_id','')::uuid; exception when others then raise exception 'Identificador de venta inválido'; end;
  if v_sale_company<>v_company then raise exception 'La venta no pertenece a tu comercio'; end if;
  if v_branch is null then select id into v_branch from public.branches where company_id=v_company and is_primary=true and active=true order by created_at limit 1; end if;
  if not public.branch_has_permission(v_branch,'can_sell',array['cashier','seller','manager','supervisor']) then raise exception 'No tenés permiso para registrar ventas en esta sucursal'; end if;
  perform pg_advisory_xact_lock(hashtext(v_sale_id::text)); select s.company_id into v_existing_company from public.sales s where s.id=v_sale_id limit 1;
  if found then if v_existing_company<>v_company then raise exception 'La venta ya existe en otro comercio'; end if; return false; end if;
  v_subtotal:=greatest(0,coalesce((p_sale->>'subtotal')::numeric,0)); v_total:=greatest(0,coalesce((p_sale->>'total')::numeric,0)); v_discount:=greatest(0,coalesce((v_details->>'discount_amount')::numeric,v_subtotal-v_total,0));
  if v_total<=0 or v_subtotal<v_total then raise exception 'Totales de venta inválidos'; end if;
  select coalesce((c.sales_settings->>'allowNegativeStock')::boolean,false),greatest(0,least(100,coalesce((c.sales_settings->>'maxDiscount')::numeric,100))) into v_allow_without_stock,v_max_discount from public.companies c where c.id=v_company;
  if v_discount>(v_subtotal*v_max_discount/100.0)+0.01 then raise exception 'El descuento supera el máximo permitido'; end if;
  if abs((v_subtotal-v_discount)-v_total)>0.02 then raise exception 'El total no coincide con el subtotal y descuento'; end if;
  if jsonb_typeof(v_items)<>'array' or jsonb_array_length(v_items)=0 then raise exception 'La venta no contiene productos'; end if;
  for v_item in select value from jsonb_array_elements(v_items) loop
    v_qty:=coalesce((v_item->>'qty')::numeric,0); if v_qty<=0 then raise exception 'Cantidad de producto inválida'; end if;
    if coalesce((v_item->>'unit_price')::numeric,-1)<0 then raise exception 'Precio de producto inválido'; end if;
    if abs(coalesce((v_item->>'line_total')::numeric,-1)-((v_item->>'unit_price')::numeric*v_qty))>0.02 then raise exception 'Subtotal de producto inválido'; end if;
    v_items_subtotal:=v_items_subtotal+coalesce((v_item->>'line_total')::numeric,0); v_items_count:=v_items_count+greatest(1,ceil(v_qty)::integer);
  end loop;
  if abs(v_items_subtotal-v_subtotal)>0.02 then raise exception 'El subtotal no coincide con los productos'; end if;
  if nullif(p_sale->>'customer_id','') is not null and not exists(select 1 from public.customers c where c.id=(p_sale->>'customer_id')::uuid and c.company_id=v_company) then raise exception 'El cliente no pertenece a tu comercio'; end if;
  insert into public.sales(id,company_id,branch_id,customer_id,receipt_type,payment_method,subtotal,total,fiscal_status,cae,receipt_number,sold_at,items_count,details)
  values(v_sale_id,v_company,v_branch,nullif(p_sale->>'customer_id','')::uuid,coalesce(nullif(p_sale->>'receipt_type',''),'ticket'),coalesce(nullif(p_sale->>'payment_method',''),'Efectivo'),v_subtotal,v_total,coalesce(nullif(p_sale->>'fiscal_status',''),'pending'),nullif(p_sale->>'cae',''),nullif(p_sale->>'receipt_number',''),coalesce((p_sale->>'sold_at')::timestamptz,now()),coalesce((p_sale->>'items_count')::integer,v_items_count),v_details);
  for v_item in select value from jsonb_array_elements(v_items) loop
    if coalesce(v_item->>'product_id','') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then continue; end if;
    v_product_id:=(v_item->>'product_id')::uuid; v_qty:=(v_item->>'qty')::numeric;
    select p.stock into v_stock from public.products p where p.id=v_product_id and p.company_id=v_company and p.branch_id=v_branch and p.active=true for update;
    if not found then raise exception 'Producto no disponible en esta sucursal'; end if;
    if not v_allow_without_stock and v_stock<v_qty then raise exception 'Stock insuficiente para %',coalesce(v_item->>'name','un producto'); end if;
    update public.products set stock=greatest(0,stock-v_qty),updated_at=now() where id=v_product_id and company_id=v_company and branch_id=v_branch;
  end loop;
  return true;
end
$$;
revoke all on function public.persist_sale_atomic(jsonb) from public, anon;
grant execute on function public.persist_sale_atomic(jsonb) to authenticated;

create or replace function public.delete_sale_restore_stock(p_sale_id uuid)
returns jsonb language plpgsql security definer set search_path='public','pg_temp'
as $$
declare v_uid uuid:=auth.uid(); v_company uuid:=public.current_user_company_id(); v_sale public.sales%rowtype; v_item record; v_json_item jsonb; v_restored integer:=0;
begin
  if v_uid is null or v_company is null then raise exception 'Usuario no autenticado'; end if;
  select * into v_sale from public.sales where id=p_sale_id and company_id=v_company for update;
  if not found then raise exception 'Venta no encontrada para este comercio'; end if;
  if not public.branch_has_permission(v_sale.branch_id,'can_delete_sales','{}'::text[]) then raise exception 'Tu usuario no tiene permiso para eliminar ventas'; end if;
  insert into public.sales_deleted_archive(company_id,branch_id,sale_id,deleted_by,had_cae,fiscal_status,receipt_number,cae,sale_record) values(v_company,v_sale.branch_id,v_sale.id,v_uid,v_sale.cae is not null,v_sale.fiscal_status,v_sale.receipt_number,v_sale.cae,to_jsonb(v_sale));
  for v_item in select product_id,sum(quantity)::numeric qty from public.sale_items where sale_id=p_sale_id and product_id is not null group by product_id loop
    update public.products set stock=stock+greatest(0,coalesce(v_item.qty,0)),updated_at=now() where id=v_item.product_id and company_id=v_company and branch_id=v_sale.branch_id; if found then v_restored:=v_restored+1; end if;
  end loop;
  if v_restored=0 then for v_json_item in select value from jsonb_array_elements(coalesce(v_sale.details->'items','[]'::jsonb)) loop if nullif(v_json_item->>'product_id','') is not null then update public.products set stock=stock+greatest(0,coalesce((v_json_item->>'qty')::numeric,0)),updated_at=now() where id=(v_json_item->>'product_id')::uuid and company_id=v_company and branch_id=v_sale.branch_id; if found then v_restored:=v_restored+1; end if; end if; end loop; end if;
  delete from public.account_movements where sale_id=p_sale_id and company_id=v_company; delete from public.sales where id=p_sale_id and company_id=v_company and branch_id=v_sale.branch_id;
  return jsonb_build_object('ok',true,'sale_id',p_sale_id,'stock_products_restored',v_restored,'fiscal_invoice_preserved_in_archive',v_sale.cae is not null);
end
$$;
revoke all on function public.delete_sale_restore_stock(uuid) from public, anon;
grant execute on function public.delete_sale_restore_stock(uuid) to authenticated;

create or replace function public.close_cash_register_authorized(p_register_id uuid,p_closing_amount numeric default null)
returns jsonb language plpgsql security definer set search_path='public','pg_temp'
as $$
declare v_uid uuid:=auth.uid(); v_company uuid:=public.current_user_company_id(); v_row public.cash_registers%rowtype; v_now timestamptz:=now(); v_sales_total numeric:=0; v_sales_count integer:=0; v_cash_sales numeric:=0; v_income numeric:=0; v_expense numeric:=0; v_egress numeric:=0; v_expected numeric:=0; v_closing numeric; v_payments jsonb:='{}'::jsonb; v_summary jsonb; v_history uuid;
begin
  if v_uid is null or v_company is null then raise exception 'Usuario no autenticado'; end if;
  select * into v_row from public.cash_registers where id=p_register_id and company_id=v_company and status='open' for update; if not found then raise exception 'La caja ya está cerrada o no pertenece a este comercio'; end if;
  if not public.branch_has_permission(v_row.branch_id,'can_open_close_cash',array['cashier','manager','supervisor']) then raise exception 'Tu usuario no tiene permiso para cerrar la caja'; end if;
  select coalesce(sum(total),0),count(*) into v_sales_total,v_sales_count from public.sales where company_id=v_company and branch_id=v_row.branch_id and sold_at>=v_row.opened_at and sold_at<=v_now;
  select coalesce(sum(total),0) into v_cash_sales from public.sales where company_id=v_company and branch_id=v_row.branch_id and sold_at>=v_row.opened_at and sold_at<=v_now and lower(coalesce(payment_method,'')) like '%efect%';
  select coalesce(jsonb_object_agg(payment_method,total),'{}'::jsonb) into v_payments from (select coalesce(nullif(payment_method,''),'Sin informar') payment_method,round(sum(total)::numeric,2) total from public.sales where company_id=v_company and branch_id=v_row.branch_id and sold_at>=v_row.opened_at and sold_at<=v_now group by 1) q;
  select coalesce(sum(amount) filter(where kind='income'),0),coalesce(sum(amount) filter(where kind='expense'),0),coalesce(sum(amount) filter(where kind='egress'),0) into v_income,v_expense,v_egress from public.cash_movements where company_id=v_company and branch_id=v_row.branch_id and occurred_at>=v_row.opened_at and occurred_at<=v_now;
  v_expected:=coalesce(v_row.opening_amount,0)+v_cash_sales+v_income-v_expense-v_egress; v_closing:=coalesce(p_closing_amount,v_expected);
  v_summary:=jsonb_build_object('sales_total',round(v_sales_total,2),'sales_count',v_sales_count,'payments',v_payments,'cash_sales',round(v_cash_sales,2),'income',round(v_income,2),'expenses',round(v_expense,2),'egress',round(v_egress,2),'expected_cash',round(v_expected,2),'counted_cash',round(v_closing,2),'difference',round(v_closing-v_expected,2),'opening_amount',coalesce(v_row.opening_amount,0),'opened_at',v_row.opened_at,'closed_at',v_now,'branch_id',v_row.branch_id);
  insert into public.cash_register_history(company_id,branch_id,cash_register_id,opened_at,closed_at,opening_amount,closing_amount,opened_by,closed_by,summary) values(v_company,v_row.branch_id,v_row.id,v_row.opened_at,v_now,coalesce(v_row.opening_amount,0),v_closing,v_row.opened_by,v_uid,v_summary) returning id into v_history;
  update public.cash_registers set status='closed',closed_at=v_now,closed_by=v_uid,closing_amount=v_closing,close_summary=v_summary where id=v_row.id returning * into v_row;
  return to_jsonb(v_row)||jsonb_build_object('history_id',v_history);
end
$$;
revoke all on function public.close_cash_register_authorized(uuid,numeric) from public, anon;
grant execute on function public.close_cash_register_authorized(uuid,numeric) to authenticated;

create or replace function public.apply_percentage_promotion(p_product_ids uuid[],p_discount_percent numeric,p_name text default null)
returns table(product_id uuid,original_price numeric,new_price numeric,promotion_id uuid)
language plpgsql security definer set search_path='public','pg_temp'
as $$
declare v_company uuid:=public.current_user_company_id(); v_product record; v_base numeric; v_new numeric; v_promo uuid;
begin
  if v_company is null then raise exception 'Usuario no autenticado'; end if;
  if p_discount_percent is null or p_discount_percent<=0 or p_discount_percent>=100 then raise exception 'El descuento debe ser mayor a 0 y menor a 100'; end if;
  if coalesce(array_length(p_product_ids,1),0)=0 then raise exception 'Seleccioná al menos un producto'; end if;
  for v_product in select p.id,p.price,p.branch_id from public.products p where p.company_id=v_company and p.active=true and p.id=any(p_product_ids) for update loop
    if not public.branch_has_permission(v_product.branch_id,'can_manage_promotions',array['manager','supervisor']) then raise exception 'Tu usuario no tiene permiso para administrar promociones en esta sucursal'; end if;
    v_base:=null; select pr.original_price into v_base from public.promotions pr where pr.company_id=v_company and pr.branch_id=v_product.branch_id and pr.product_id=v_product.id and pr.type='percent_discount' and pr.active=true order by pr.created_at desc limit 1; v_base:=coalesce(v_base,v_product.price,0);
    update public.promotions set active=false where company_id=v_company and branch_id=v_product.branch_id and product_id=v_product.id and type='percent_discount' and active=true;
    v_new:=round((v_base*(100-p_discount_percent)/100.0)::numeric,2); update public.products set price=v_new,updated_at=now() where id=v_product.id and company_id=v_company and branch_id=v_product.branch_id;
    insert into public.promotions(company_id,branch_id,name,type,product_id,active,discount_percent,original_price,starts_at) values(v_company,v_product.branch_id,coalesce(nullif(trim(p_name),''),'Oferta '||trim(to_char(p_discount_percent,'FM999990D##'))||'%'),'percent_discount',v_product.id,true,p_discount_percent,v_base,now()) returning id into v_promo;
    product_id:=v_product.id; original_price:=v_base; new_price:=v_new; promotion_id:=v_promo; return next;
  end loop;
end
$$;
revoke all on function public.apply_percentage_promotion(uuid[],numeric,text) from public, anon;
grant execute on function public.apply_percentage_promotion(uuid[],numeric,text) to authenticated;

create or replace function public.remove_percentage_promotion(p_promotion_id uuid)
returns jsonb language plpgsql security definer set search_path='public','pg_temp'
as $$
declare v_company uuid:=public.current_user_company_id(); v_promo public.promotions%rowtype;
begin
  if v_company is null then raise exception 'Usuario no autenticado'; end if;
  select * into v_promo from public.promotions where id=p_promotion_id and company_id=v_company and type='percent_discount' and active=true for update; if not found then raise exception 'Promoción no encontrada o ya inactiva'; end if;
  if not public.branch_has_permission(v_promo.branch_id,'can_manage_promotions',array['manager','supervisor']) then raise exception 'Tu usuario no tiene permiso para administrar promociones en esta sucursal'; end if;
  update public.products set price=coalesce(v_promo.original_price,price),updated_at=now() where id=v_promo.product_id and company_id=v_company and branch_id=v_promo.branch_id;
  update public.promotions set active=false where id=v_promo.id;
  return jsonb_build_object('ok',true,'product_id',v_promo.product_id,'restored_price',v_promo.original_price);
end
$$;
revoke all on function public.remove_percentage_promotion(uuid) from public, anon;
grant execute on function public.remove_percentage_promotion(uuid) to authenticated;
