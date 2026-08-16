alter table public.mercadopago_point_connections
  add column if not exists connection_mode text not null default 'oauth'
  check (connection_mode in ('oauth','own'));

-- La primera integración productiva de Comercio Lleno es propia.
-- Los comercios de terceros continúan usando OAuth por tenant.
update public.mercadopago_point_connections
set connection_mode='own'
where company_id='f6b2992b-2fe8-47d6-be29-620468c059dd';
