create table if not exists public.arca_tenant_credentials (
  company_id uuid primary key references public.companies(id) on delete cascade,
  private_key_secret_id uuid,
  certificate_secret_id uuid,
  csr_pem text,
  certificate_subject text,
  certificate_expires_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.arca_tenant_credentials enable row level security;
revoke all on table public.arca_tenant_credentials from anon, authenticated;

create or replace function public.arca_vault_upsert_secret(p_secret_id uuid, p_name text, p_secret text, p_description text default '')
returns uuid
language plpgsql
security definer
set search_path = 'public','vault','pg_temp'
as $$
declare
  v_role text := coalesce(current_setting('request.jwt.claim.role', true),'');
  v_id uuid;
begin
  if v_role <> 'service_role' then raise exception 'Operación restringida'; end if;
  if p_secret is null or length(p_secret) < 16 then raise exception 'Secreto inválido'; end if;
  if p_secret_id is null then
    v_id := vault.create_secret(p_secret, p_name, p_description);
  else
    perform vault.update_secret(p_secret_id, p_secret, p_name, p_description);
    v_id := p_secret_id;
  end if;
  return v_id;
end;
$$;

create or replace function public.arca_vault_read_secret(p_secret_id uuid)
returns text
language plpgsql
security definer
set search_path = 'public','vault','pg_temp'
as $$
declare
  v_role text := coalesce(current_setting('request.jwt.claim.role', true),'');
  v_secret text;
begin
  if v_role <> 'service_role' then raise exception 'Operación restringida'; end if;
  select decrypted_secret into v_secret from vault.decrypted_secrets where id = p_secret_id;
  return v_secret;
end;
$$;

revoke all on function public.arca_vault_upsert_secret(uuid,text,text,text) from public, anon, authenticated;
revoke all on function public.arca_vault_read_secret(uuid) from public, anon, authenticated;
grant execute on function public.arca_vault_upsert_secret(uuid,text,text,text) to service_role;
grant execute on function public.arca_vault_read_secret(uuid) to service_role;
