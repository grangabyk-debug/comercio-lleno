create schema if not exists private;

create or replace function public.current_user_can_admin_branches()
returns boolean
language sql
stable
security definer
set search_path = 'public', 'pg_temp'
as $$
  select coalesce((
    select p.active = true and p.company_id = public.current_user_company_id() and p.role in ('owner','supervisor')
    from public.profiles p
    where p.id = auth.uid()
  ), false)
$$;
revoke all on function public.current_user_can_admin_branches() from public, anon;
grant execute on function public.current_user_can_admin_branches() to authenticated;

alter table public.branches add constraint branches_company_id_id_key unique (company_id,id);

create table public.profile_branch_assignments (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  branch_id uuid not null,
  role text not null check (role in ('seller','manager','cashier','supervisor')),
  permissions jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (profile_id, branch_id),
  constraint profile_branch_assignments_branch_fkey foreign key (company_id,branch_id) references public.branches(company_id,id) on delete cascade
);
create index profile_branch_assignments_company_branch_idx on public.profile_branch_assignments(company_id,branch_id) where active=true;
create index profile_branch_assignments_profile_idx on public.profile_branch_assignments(profile_id) where active=true;
alter table public.profile_branch_assignments enable row level security;

insert into public.profile_branch_assignments(profile_id,company_id,branch_id,role,permissions,active)
select p.id,p.company_id,b.id,p.role,coalesce(p.permissions,'{}'::jsonb),true
from public.profiles p
join public.branches b on b.company_id=p.company_id and b.is_primary=true and b.active=true
where p.active=true and p.role in ('seller','manager','cashier','supervisor');

create or replace function public.can_access_branch(p_branch uuid)
returns boolean
language sql
stable
security definer
set search_path = 'public', 'pg_temp'
as $$
  select case
    when auth.uid() is null or p_branch is null or public.current_user_company_id() is null then false
    when public.current_user_role() in ('owner','supervisor') then exists(
      select 1 from public.branches b
      where b.id=p_branch and b.company_id=public.current_user_company_id() and b.active=true
    )
    else exists(
      select 1
      from public.profile_branch_assignments a
      join public.branches b on b.id=a.branch_id and b.company_id=a.company_id and b.active=true
      where a.profile_id=auth.uid()
        and a.company_id=public.current_user_company_id()
        and a.branch_id=p_branch
        and a.active=true
    )
  end
$$;
revoke all on function public.can_access_branch(uuid) from public, anon;
grant execute on function public.can_access_branch(uuid) to authenticated;

create or replace function public.branch_has_permission(p_branch uuid, p_key text, p_default_roles text[] default '{}'::text[])
returns boolean
language plpgsql
stable
security definer
set search_path = 'public', 'pg_temp'
as $$
declare
  v_company uuid := public.current_user_company_id();
  v_role text;
  v_permissions jsonb;
  v_active boolean;
begin
  if auth.uid() is null or v_company is null or p_branch is null or not public.can_access_branch(p_branch) then return false; end if;
  select p.role,p.permissions,p.active into v_role,v_permissions,v_active
  from public.profiles p where p.id=auth.uid() and p.company_id=v_company limit 1;
  if not found or v_active is not true then return false; end if;
  if v_role='owner' then return true; end if;
  if v_role='supervisor' then return coalesce((v_permissions->>p_key)::boolean, v_role=any(p_default_roles), false); end if;
  select a.role,a.permissions,a.active into v_role,v_permissions,v_active
  from public.profile_branch_assignments a
  where a.profile_id=auth.uid() and a.company_id=v_company and a.branch_id=p_branch and a.active=true limit 1;
  if not found or v_active is not true then return false; end if;
  return coalesce((v_permissions->>p_key)::boolean, v_role=any(p_default_roles), false);
end
$$;
revoke all on function public.branch_has_permission(uuid,text,text[]) from public, anon;
grant execute on function public.branch_has_permission(uuid,text,text[]) to authenticated;

create or replace function private.enforce_branch_limit()
returns trigger
language plpgsql
security definer
set search_path = 'public', 'pg_temp'
as $$
declare v_count integer;
begin
  if tg_op='INSERT' or (new.active=true and old.active=false) then
    select count(*) into v_count from public.branches where company_id=new.company_id and active=true and (tg_op='INSERT' or id<>new.id);
    if v_count >= 5 then raise exception 'El comercio admite hasta 5 sucursales.'; end if;
  end if;
  return new;
end
$$;
revoke all on function private.enforce_branch_limit() from public, anon, authenticated;
drop trigger if exists enforce_branch_limit on public.branches;
create trigger enforce_branch_limit before insert or update of active on public.branches for each row execute function private.enforce_branch_limit();

create policy branch_assignments_select on public.profile_branch_assignments for select to authenticated using (profile_id=auth.uid() or (company_id=public.current_user_company_id() and public.current_user_can_admin_branches()));
create policy branch_assignments_admin_insert on public.profile_branch_assignments for insert to authenticated with check (company_id=public.current_user_company_id() and public.current_user_can_admin_branches() and exists(select 1 from public.profiles p where p.id=profile_id and p.company_id=company_id and p.active=true and p.role<>'owner'));
create policy branch_assignments_admin_update on public.profile_branch_assignments for update to authenticated using (company_id=public.current_user_company_id() and public.current_user_can_admin_branches()) with check (company_id=public.current_user_company_id() and public.current_user_can_admin_branches());
create policy branch_assignments_admin_delete on public.profile_branch_assignments for delete to authenticated using (company_id=public.current_user_company_id() and public.current_user_can_admin_branches());

drop policy if exists branches_owner_write on public.branches;
drop policy if exists branches_tenant_select on public.branches;
create policy branches_accessible_select on public.branches for select to authenticated using (company_id=public.current_user_company_id() and public.can_access_branch(id));
create policy branches_admin_insert on public.branches for insert to authenticated with check (company_id=public.current_user_company_id() and public.current_user_can_admin_branches());
create policy branches_admin_update on public.branches for update to authenticated using (company_id=public.current_user_company_id() and public.current_user_can_admin_branches()) with check (company_id=public.current_user_company_id() and public.current_user_can_admin_branches());
create policy branches_admin_delete on public.branches for delete to authenticated using (company_id=public.current_user_company_id() and public.current_user_can_admin_branches() and is_primary=false);

drop policy if exists "owners can read company profiles" on public.profiles;
create policy "admins can read company profiles" on public.profiles for select to authenticated using (id=auth.uid() or (company_id=public.current_user_company_id() and public.current_user_can_admin_branches()));
drop policy if exists "owners can update company staff" on public.profiles;
create policy "admins can update company staff" on public.profiles for update to authenticated using (company_id=public.current_user_company_id() and public.current_user_can_admin_branches() and (public.current_user_role()='owner' or role<>'owner')) with check (company_id=public.current_user_company_id() and public.current_user_can_admin_branches() and (public.current_user_role()='owner' or role<>'owner'));
