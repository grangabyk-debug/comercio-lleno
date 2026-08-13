create or replace function public.save_mobile_settings(p_scanner_enabled boolean)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_company uuid;
  v_role text;
  v_settings jsonb;
begin
  if v_uid is null then raise exception 'Usuario no autenticado'; end if;
  select company_id, role into v_company, v_role from public.profiles where id = v_uid and active = true;
  if v_company is null or v_role <> 'owner' then raise exception 'Solo el propietario puede cambiar la configuración móvil'; end if;
  v_settings := jsonb_build_object('scanner_enabled', coalesce(p_scanner_enabled, true));
  update public.companies set mobile_settings = v_settings where id = v_company;
  return v_settings;
end;
$$;

revoke all on function public.save_mobile_settings(boolean) from public, anon;
grant execute on function public.save_mobile_settings(boolean) to authenticated, service_role;
