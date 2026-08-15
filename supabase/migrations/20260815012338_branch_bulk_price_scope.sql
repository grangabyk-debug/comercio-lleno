create or replace function public.bulk_increase_product_prices(p_target text,p_percent numeric,p_branch_id uuid)
returns jsonb
language plpgsql
security definer
set search_path='public','pg_temp'
as $$
declare
  v_company uuid:=public.current_user_company_id();
  v_factor numeric;
  v_promoted integer:=0;
  v_regular integer:=0;
begin
  if auth.uid() is null or v_company is null then raise exception 'Usuario no autenticado'; end if;
  if not public.branch_has_permission(p_branch_id,'can_edit_products',array['manager','supervisor']) and not public.branch_has_permission(p_branch_id,'can_manage_stock',array['manager','supervisor']) then raise exception 'Sin permiso para modificar precios en esta sucursal'; end if;
  if p_target not in ('retail','wholesale') then raise exception 'Tipo de precio inválido'; end if;
  if p_percent is null or p_percent<=0 or p_percent>500 then raise exception 'El porcentaje debe ser mayor a 0 y hasta 500'; end if;
  v_factor:=1+(p_percent/100.0);
  if p_target='wholesale' then
    update public.products set wholesale_price=round(coalesce(wholesale_price,0)*v_factor,2),updated_at=now() where company_id=v_company and branch_id=p_branch_id and active=true;
    get diagnostics v_regular=row_count;
  else
    update public.promotions pr set original_price=round(coalesce(pr.original_price,p.price/nullif(1-coalesce(pr.discount_percent,0)/100.0,0))*v_factor,2)
    from public.products p where pr.company_id=v_company and pr.branch_id=p_branch_id and pr.active=true and pr.type='percent_discount' and pr.product_id=p.id and p.company_id=v_company and p.branch_id=p_branch_id and p.active=true;
    with latest_promo as (
      select distinct on(product_id) product_id,original_price,discount_percent from public.promotions where company_id=v_company and branch_id=p_branch_id and active=true and type='percent_discount' and product_id is not null order by product_id,created_at desc nulls last
    )
    update public.products p set price=round(coalesce(lp.original_price,p.price,0)*(1-coalesce(lp.discount_percent,0)/100.0),2),updated_at=now() from latest_promo lp where p.id=lp.product_id and p.company_id=v_company and p.branch_id=p_branch_id and p.active=true;
    get diagnostics v_promoted=row_count;
    update public.products p set price=round(coalesce(price,0)*v_factor,2),updated_at=now() where p.company_id=v_company and p.branch_id=p_branch_id and p.active=true and not exists(select 1 from public.promotions pr where pr.company_id=v_company and pr.branch_id=p_branch_id and pr.product_id=p.id and pr.active=true and pr.type='percent_discount');
    get diagnostics v_regular=row_count;
  end if;
  return jsonb_build_object('ok',true,'target',p_target,'percent',p_percent,'branch_id',p_branch_id,'updated',v_promoted+v_regular,'promoted',v_promoted);
end
$$;
revoke all on function public.bulk_increase_product_prices(text,numeric,uuid) from public,anon;
grant execute on function public.bulk_increase_product_prices(text,numeric,uuid) to authenticated;
