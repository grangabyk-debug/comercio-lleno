revoke all on function public.comercio_has_permission(text,boolean) from public,anon;
grant execute on function public.comercio_has_permission(text,boolean) to authenticated,service_role;
