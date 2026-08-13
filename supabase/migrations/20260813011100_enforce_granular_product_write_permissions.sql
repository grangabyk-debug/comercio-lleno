drop policy if exists "authenticated users can manage company products" on public.products;
drop policy if exists "products_company_isolation" on public.products;

create policy products_insert_granular on public.products
for insert to authenticated
with check (
  company_id = current_user_company_id()
  and coalesce((select p.active from public.profiles p where p.id=auth.uid()),false)
  and (
    current_user_role()='owner'
    or coalesce((select (p.permissions->>'can_edit_products')::boolean from public.profiles p where p.id=auth.uid()),(select (p.permissions->>'can_manage_stock')::boolean from public.profiles p where p.id=auth.uid()),false)
    or coalesce((select (p.permissions->>'can_import_export_products')::boolean from public.profiles p where p.id=auth.uid()),false)
  )
);

create policy products_update_granular on public.products
for update to authenticated
using (
  company_id = current_user_company_id()
  and coalesce((select p.active from public.profiles p where p.id=auth.uid()),false)
  and (
    current_user_role()='owner'
    or coalesce((select (p.permissions->>'can_edit_products')::boolean from public.profiles p where p.id=auth.uid()),(select (p.permissions->>'can_manage_stock')::boolean from public.profiles p where p.id=auth.uid()),false)
    or coalesce((select (p.permissions->>'can_import_export_products')::boolean from public.profiles p where p.id=auth.uid()),false)
  )
)
with check (company_id = current_user_company_id());

create policy products_delete_granular on public.products
for delete to authenticated
using (
  company_id = current_user_company_id()
  and coalesce((select p.active from public.profiles p where p.id=auth.uid()),false)
  and (
    current_user_role()='owner'
    or coalesce((select (p.permissions->>'can_edit_products')::boolean from public.profiles p where p.id=auth.uid()),(select (p.permissions->>'can_manage_stock')::boolean from public.profiles p where p.id=auth.uid()),false)
  )
);
