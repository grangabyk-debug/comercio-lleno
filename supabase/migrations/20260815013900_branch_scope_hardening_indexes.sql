create index if not exists cash_register_history_company_branch_idx on public.cash_register_history(company_id,branch_id);
create index if not exists finance_expenses_company_branch_idx on public.finance_expenses(company_id,branch_id);
create index if not exists promotions_company_branch_idx on public.promotions(company_id,branch_id);
create index if not exists returns_company_branch_idx on public.returns(company_id,branch_id);
create index if not exists sales_deleted_archive_company_branch_idx on public.sales_deleted_archive(company_id,branch_id);
create index if not exists stock_movements_company_branch_idx on public.stock_movements(company_id,branch_id);
create index if not exists suspended_sales_company_branch_idx on public.suspended_sales(company_id,branch_id);

create or replace function public.bulk_increase_product_prices(p_target text,p_percent numeric)
returns jsonb
language plpgsql
security definer
set search_path='public','pg_temp'
as $$
declare
  v_company uuid:=public.current_user_company_id();
  v_branch uuid;
begin
  if auth.uid() is null or v_company is null then raise exception 'Usuario no autenticado'; end if;
  select id into v_branch from public.branches where company_id=v_company and is_primary=true and active=true order by created_at asc limit 1;
  if v_branch is null then raise exception 'No hay una sucursal principal activa'; end if;
  return public.bulk_increase_product_prices(p_target,p_percent,v_branch);
end
$$;
revoke all on function public.bulk_increase_product_prices(text,numeric) from public,anon;
grant execute on function public.bulk_increase_product_prices(text,numeric) to authenticated;

alter policy branch_assignments_select on public.profile_branch_assignments using (profile_id=(select auth.uid()) or (company_id=public.current_user_company_id() and public.current_user_can_admin_branches()));
