create schema if not exists private;

create extension if not exists pg_net with schema extensions;

create or replace function private.notify_central_new_company()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  webhook_secret text;
begin
  select decrypted_secret
    into webhook_secret
  from vault.decrypted_secrets
  where name = 'central_support_push_webhook_secret'
  limit 1;

  if webhook_secret is not null then
    perform net.http_post(
      url := 'https://pejkycdttogpmmdntzuq.supabase.co/functions/v1/support-push',
      headers := jsonb_build_object(
        'Content-Type','application/json',
        'x-support-secret',webhook_secret
      ),
      body := jsonb_build_object(
        'eventType','new_registration',
        'companyId',new.id,
        'tenantName',new.name,
        'body','Se registró un nuevo comercio en Comercio Lleno.'
      ),
      timeout_milliseconds := 5000
    );
  end if;

  return new;
end;
$$;

revoke all on function private.notify_central_new_company() from public, anon, authenticated;

drop trigger if exists central_new_company_push on public.companies;
create trigger central_new_company_push
after insert on public.companies
for each row execute function private.notify_central_new_company();

comment on function private.notify_central_new_company() is
  'Envía a Central Llena una notificación push asíncrona cuando se registra un comercio nuevo.';
