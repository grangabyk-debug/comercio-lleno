create or replace function public.authorize_ai_request()
returns jsonb
language plpgsql
security definer
set search_path = 'public', 'auth', 'pg_temp'
as $$
declare
  v_uid uuid := auth.uid();
  v_company uuid;
  v_role text;
  v_permissions jsonb;
  v_effective_permissions jsonb;
  v_active boolean;
  v_company_name text;
  v_10m integer;
  v_day integer;
begin
  if v_uid is null then raise exception 'Sesión requerida'; end if;
  if not exists(select 1 from auth.users u where u.id = v_uid) then raise exception 'Usuario de autenticación inválido'; end if;

  select p.company_id, p.role, p.permissions, p.active, c.name
    into v_company, v_role, v_permissions, v_active, v_company_name
  from public.profiles p
  join public.companies c on c.id = p.company_id
  where p.id = v_uid
  limit 1;

  if v_company is null or v_active is distinct from true then raise exception 'Usuario sin perfil activo de Comercio Lleno'; end if;

  select count(*) into v_10m from public.ai_request_log where user_id = v_uid and created_at >= now() - interval '10 minutes';
  select count(*) into v_day from public.ai_request_log where user_id = v_uid and created_at >= now() - interval '24 hours';
  if v_10m >= 60 then raise exception 'Límite temporal de consultas IA alcanzado. Esperá unos minutos.'; end if;
  if v_day >= 500 then raise exception 'Límite diario de consultas IA alcanzado.'; end if;

  insert into public.ai_request_log(user_id, company_id) values(v_uid, v_company);
  delete from public.ai_request_log where created_at < now() - interval '30 days';

  v_effective_permissions := coalesce(v_permissions,'{}'::jsonb)
    || jsonb_build_object(
      'can_view_reports',
      coalesce(
        (v_permissions->>'can_view_reports')::boolean,
        v_role in ('owner','manager','supervisor'),
        false
      )
    );

  return jsonb_build_object(
    'user_id', v_uid,
    'company_id', v_company,
    'role', v_role,
    'permissions', v_effective_permissions,
    'company_name', coalesce(v_company_name,'Comercio Lleno')
  );
end;
$$;

revoke all on function public.authorize_ai_request() from public, anon;
grant execute on function public.authorize_ai_request() to authenticated, service_role;
