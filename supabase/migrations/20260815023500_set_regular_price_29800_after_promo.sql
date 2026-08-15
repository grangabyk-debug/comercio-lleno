alter table public.company_subscriptions
  alter column regular_price_amount set default 29800;

update public.company_subscriptions
set regular_price_amount = 29800,
    updated_at = now()
where regular_price_amount = 39900
  and promo_completed_at is null
  and coalesce(promo_paid_cycles, 0) < coalesce(promo_cycles, 3);
