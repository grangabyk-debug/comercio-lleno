create or replace function public.persist_sale_atomic(p_sale jsonb)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_company uuid := public.current_user_company_id();
  v_profile record;
  v_sale_id uuid;
  v_sale_company uuid;
  v_details jsonb := coalesce(p_sale->'details', '{}'::jsonb);
  v_items jsonb := coalesce(p_sale->'details'->'items', '[]'::jsonb);
  v_item jsonb;
  v_product_id uuid;
  v_qty numeric;
  v_stock numeric;
  v_allow_without_stock boolean := false;
  v_max_discount numeric := 100;
  v_subtotal numeric;
  v_total numeric;
  v_discount numeric;
  v_items_subtotal numeric := 0;
  v_items_count integer := 0;
  v_existing_company uuid;
begin
  if auth.uid() is null or v_company is null then raise exception 'Usuario o suscripción no disponibles'; end if;

  select p.role, p.permissions, p.active into v_profile
  from public.profiles p
  where p.id = auth.uid() and p.company_id = v_company
  limit 1;

  if not found or v_profile.active is not true or not (
    v_profile.role in ('owner','cashier')
    or coalesce((v_profile.permissions->>'can_sell')::boolean, false)
  ) then raise exception 'No tenés permiso para registrar ventas'; end if;

  begin
    v_sale_id := (p_sale->>'id')::uuid;
    v_sale_company := (p_sale->>'company_id')::uuid;
  exception when others then
    raise exception 'Identificador de venta inválido';
  end;
  if v_sale_company <> v_company then raise exception 'La venta no pertenece a tu comercio'; end if;

  perform pg_advisory_xact_lock(hashtext(v_sale_id::text));
  select s.company_id into v_existing_company from public.sales s where s.id = v_sale_id limit 1;
  if found then
    if v_existing_company <> v_company then raise exception 'La venta ya existe en otro comercio'; end if;
    return false;
  end if;

  v_subtotal := greatest(0, coalesce((p_sale->>'subtotal')::numeric, 0));
  v_total := greatest(0, coalesce((p_sale->>'total')::numeric, 0));
  v_discount := greatest(0, coalesce((v_details->>'discount_amount')::numeric, v_subtotal - v_total, 0));
  if v_total <= 0 or v_subtotal < v_total then raise exception 'Totales de venta inválidos'; end if;

  select
    coalesce((c.sales_settings->>'allowNegativeStock')::boolean, false),
    greatest(0, least(100, coalesce((c.sales_settings->>'maxDiscount')::numeric, 100)))
  into v_allow_without_stock, v_max_discount
  from public.companies c where c.id = v_company;

  if v_discount > (v_subtotal * v_max_discount / 100.0) + 0.01 then raise exception 'El descuento supera el máximo permitido'; end if;
  if abs((v_subtotal - v_discount) - v_total) > 0.02 then raise exception 'El total no coincide con el subtotal y descuento'; end if;
  if jsonb_typeof(v_items) <> 'array' or jsonb_array_length(v_items) = 0 then raise exception 'La venta no contiene productos'; end if;

  for v_item in select value from jsonb_array_elements(v_items)
  loop
    v_qty := coalesce((v_item->>'qty')::numeric, 0);
    if v_qty <= 0 then raise exception 'Cantidad de producto inválida'; end if;
    if coalesce((v_item->>'unit_price')::numeric, -1) < 0 then raise exception 'Precio de producto inválido'; end if;
    if abs(coalesce((v_item->>'line_total')::numeric, -1) - ((v_item->>'unit_price')::numeric * v_qty)) > 0.02 then raise exception 'Subtotal de producto inválido'; end if;
    v_items_subtotal := v_items_subtotal + coalesce((v_item->>'line_total')::numeric, 0);
    v_items_count := v_items_count + greatest(1, ceil(v_qty)::integer);
  end loop;
  if abs(v_items_subtotal - v_subtotal) > 0.02 then raise exception 'El subtotal no coincide con los productos'; end if;

  if nullif(p_sale->>'customer_id','') is not null and not exists (
    select 1 from public.customers c
    where c.id = (p_sale->>'customer_id')::uuid and c.company_id = v_company
  ) then raise exception 'El cliente no pertenece a tu comercio'; end if;

  insert into public.sales(id, company_id, customer_id, receipt_type, payment_method, subtotal, total, fiscal_status, cae, receipt_number, sold_at, items_count, details)
  values (
    v_sale_id, v_company, nullif(p_sale->>'customer_id','')::uuid,
    coalesce(nullif(p_sale->>'receipt_type',''), 'ticket'), coalesce(nullif(p_sale->>'payment_method',''), 'Efectivo'),
    v_subtotal, v_total, coalesce(nullif(p_sale->>'fiscal_status',''), 'pending'),
    nullif(p_sale->>'cae',''), nullif(p_sale->>'receipt_number',''),
    coalesce((p_sale->>'sold_at')::timestamptz, now()), coalesce((p_sale->>'items_count')::integer, v_items_count), v_details
  );

  for v_item in select value from jsonb_array_elements(v_items)
  loop
    if coalesce(v_item->>'product_id','') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then continue; end if;
    v_product_id := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'qty')::numeric;
    select p.stock into v_stock from public.products p
    where p.id = v_product_id and p.company_id = v_company and p.active = true
    for update;
    if not found then raise exception 'Producto no disponible en este comercio'; end if;
    if not v_allow_without_stock and v_stock < v_qty then raise exception 'Stock insuficiente para %', coalesce(v_item->>'name', 'un producto'); end if;
    update public.products set stock = greatest(0, stock - v_qty), updated_at = now()
    where id = v_product_id and company_id = v_company;
  end loop;
  return true;
end;
$$;

revoke execute on function public.persist_sale_atomic(jsonb) from public, anon;
grant execute on function public.persist_sale_atomic(jsonb) to authenticated;
