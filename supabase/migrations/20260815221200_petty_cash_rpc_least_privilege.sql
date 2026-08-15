revoke execute on function public.get_petty_cash_state(uuid) from public, anon;
revoke execute on function public.register_petty_cash_movement(uuid,text,numeric,text) from public, anon;
grant execute on function public.get_petty_cash_state(uuid) to authenticated;
grant execute on function public.register_petty_cash_movement(uuid,text,numeric,text) to authenticated;
