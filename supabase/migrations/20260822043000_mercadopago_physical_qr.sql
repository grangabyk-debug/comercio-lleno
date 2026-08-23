-- PREVIEW ONLY. Keeps the physical/static QR selection separate from Point terminal settings.
alter table public.mercadopago_point_connections add column if not exists qr_pos_id text;
alter table public.mercadopago_point_connections add column if not exists qr_external_pos_id text;
alter table public.mercadopago_point_connections add column if not exists qr_store_id text;
alter table public.mercadopago_point_connections add column if not exists qr_external_store_id text;
alter table public.mercadopago_point_connections add column if not exists qr_name text;
alter table public.mercadopago_point_connections add column if not exists qr_image_url text;
alter table public.mercadopago_point_connections add column if not exists qr_template_url text;
alter table public.mercadopago_point_connections add column if not exists qr_linked_at timestamptz;
