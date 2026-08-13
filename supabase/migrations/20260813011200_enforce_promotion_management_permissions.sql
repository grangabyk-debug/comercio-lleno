drop policy if exists "tenant_all" on public.promotions;
drop policy if exists "promotions_company_isolation" on public.promotions;
drop policy if exists "authenticated users can manage company promotions" on public.promotions;

create policy promotions_select_company on public.promotions
for select to authenticated
using (company_id = current_user_company_id());

create policy promotions_insert_granular on public.promotions
for insert to authenticated
with check (
  company_id = current_user_company_id()
  and coalesce((select p.active from public.profiles p where p.id=auth.uid()),false)
  and (
    current_user_role()='owner'
    or coalesce((select (p.permissions->>'can_manage_promotions')::boolean from public.profiles p where p.id=auth.uid()), current_user_role()='supervisor', false)
  )
);

create policy promotions_update_granular on public.promotions
for update to authenticated
using (
  company_id = current_user_company_id()
  and coalesce((select p.active from public.profiles p where p.id=auth.uid()),false)
  and (
    current_user_role()='owner'
    or coalesce((select (p.permissions->>'can_manage_promotions')::boolean from public.profiles p where p.id=auth.uid()), current_user_role()='supervisor', false)
  )
)
with check (company_id = current_user_company_id());

create policy promotions_delete_granular on public.promotions
for delete to authenticated
using (
  company_id = current_user_company_id()
  and coalesce((select p.active from public.profiles p where p.id=auth.uid()),false)
  and (
    current_user_role()='owner'
    or coalesce((select (p.permissions->>'can_manage_promotions')::boolean from public.profiles p where p.id=auth.uid()), current_user_role()='supervisor', false)
  )
);
