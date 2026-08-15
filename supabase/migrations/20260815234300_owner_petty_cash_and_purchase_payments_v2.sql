-- Caja chica: ajuste de propietario auditado + motivo obligatorio en retiros.
alter table public.petty_cash_movements drop constraint if exists petty_cash_movements_kind_check;
alter table public.petty_cash_movements add constraint petty_cash_movements_kind_check
check (kind in ('cash_to_petty','petty_withdrawal','owner_adjustment_in','owner_adjustment_out'));

create or replace function public.get_petty_cash_state(p_branch_id uuid)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare v_company uuid:=public.current_user_company_id(); v_balance numeric:=0; v_open_register uuid; v_rows jsonb:='[]'::jsonb;
begin
  if auth.uid() is null or v_company is null then raise exception 'Usuario no autenticado'; end if;
  if not public.can_access_branch(p_branch_id) then raise exception 'No tenés acceso a esta sucursal'; end if;
  if not public.branch_has_permission(p_branch_id,'can_open_close_cash',array['cashier','manager','supervisor']) then raise exception 'Tu usuario no tiene permiso para administrar caja chica'; end if;
  select cr.id into v_open_register from public.cash_registers cr where cr.company_id=v_company and cr.branch_id=p_branch_id and cr.status='open' order by cr.opened_at desc nulls last limit 1;
  select coalesce(sum(case when pcm.kind in ('cash_to_petty','owner_adjustment_in') then pcm.amount else -pcm.amount end),0) into v_balance from public.petty_cash_movements pcm where pcm.company_id=v_company and pcm.branch_id=p_branch_id;
  select coalesce(jsonb_agg(jsonb_build_object('id',q.id,'kind',q.kind,'amount',q.amount,'note',q.note,'occurred_at',q.occurred_at,'cash_register_id',q.cash_register_id,'created_by',q.created_by) order by q.occurred_at desc),'[]'::jsonb) into v_rows from (select id,kind,amount,note,occurred_at,cash_register_id,created_by from public.petty_cash_movements where company_id=v_company and branch_id=p_branch_id order by occurred_at desc limit 150) q;
  return jsonb_build_object('balance',round(v_balance,2),'cash_open',v_open_register is not null,'cash_register_id',v_open_register,'movements',v_rows);
end $$;

create or replace function public.set_petty_cash_balance(p_branch_id uuid,p_target_balance numeric)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare v_uid uuid:=auth.uid(); v_company uuid:=public.current_user_company_id(); v_current numeric:=0; v_delta numeric:=0; v_kind text; v_register uuid; v_id uuid; v_at timestamptz:=now();
begin
  if v_uid is null or v_company is null then raise exception 'Usuario no autenticado'; end if;
  if public.current_user_role() <> 'owner' then raise exception 'Solo el propietario puede corregir el saldo de caja chica'; end if;
  if not public.can_access_branch(p_branch_id) then raise exception 'No tenés acceso a esta sucursal'; end if;
  if coalesce(p_target_balance,-1)<0 then raise exception 'El saldo no puede ser negativo'; end if;
  perform 1 from public.branches b where b.company_id=v_company and b.id=p_branch_id for update;
  if not found then raise exception 'La sucursal no pertenece a este comercio'; end if;
  select coalesce(sum(case when kind in ('cash_to_petty','owner_adjustment_in') then amount else -amount end),0) into v_current from public.petty_cash_movements where company_id=v_company and branch_id=p_branch_id;
  v_delta:=round(p_target_balance-v_current,2);
  if v_delta=0 then return jsonb_build_object('ok',true,'balance',round(v_current,2),'changed',false); end if;
  select id into v_register from public.cash_registers where company_id=v_company and branch_id=p_branch_id and status='open' order by opened_at desc nulls last limit 1;
  v_kind:=case when v_delta>0 then 'owner_adjustment_in' else 'owner_adjustment_out' end;
  insert into public.petty_cash_movements(company_id,branch_id,cash_register_id,kind,amount,note,occurred_at,created_by) values(v_company,p_branch_id,v_register,v_kind,abs(v_delta),'Ajuste manual de saldo por propietario',v_at,v_uid) returning id into v_id;
  return jsonb_build_object('ok',true,'balance',round(p_target_balance,2),'changed',true,'movement_id',v_id);
end $$;

create or replace function public.register_petty_cash_movement(p_branch_id uuid,p_kind text,p_amount numeric,p_note text default null)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare v_uid uuid:=auth.uid(); v_company uuid:=public.current_user_company_id(); v_register public.cash_registers%rowtype; v_balance numeric:=0; v_id uuid; v_at timestamptz:=now(); v_note text:=nullif(btrim(coalesce(p_note,'')),'');
begin
  if v_uid is null or v_company is null then raise exception 'Usuario no autenticado'; end if;
  if p_kind not in ('cash_to_petty','petty_withdrawal') then raise exception 'Tipo de movimiento de caja chica inválido'; end if;
  if coalesce(p_amount,0)<=0 then raise exception 'Ingresá un importe mayor a cero'; end if;
  if p_kind='petty_withdrawal' and v_note is null then raise exception 'Indicá el motivo del retiro de caja chica'; end if;
  if not public.can_access_branch(p_branch_id) then raise exception 'No tenés acceso a esta sucursal'; end if;
  if not public.branch_has_permission(p_branch_id,'can_open_close_cash',array['cashier','manager','supervisor']) then raise exception 'Tu usuario no tiene permiso para administrar caja chica'; end if;
  perform 1 from public.branches b where b.company_id=v_company and b.id=p_branch_id for update;
  if not found then raise exception 'La sucursal no pertenece a este comercio'; end if;
  select * into v_register from public.cash_registers where company_id=v_company and branch_id=p_branch_id and status='open' order by opened_at desc nulls last limit 1 for update;
  if not found then raise exception 'Abrí la caja diaria antes de registrar un movimiento de caja chica'; end if;
  select coalesce(sum(case when kind in ('cash_to_petty','owner_adjustment_in') then amount else -amount end),0) into v_balance from public.petty_cash_movements where company_id=v_company and branch_id=p_branch_id;
  if p_kind='petty_withdrawal' and p_amount>v_balance then raise exception 'No hay suficiente efectivo en caja chica. Disponible: %',round(v_balance,2); end if;
  insert into public.petty_cash_movements(company_id,branch_id,cash_register_id,kind,amount,note,occurred_at,created_by) values(v_company,p_branch_id,v_register.id,p_kind,p_amount,v_note,v_at,v_uid) returning id into v_id;
  if p_kind='cash_to_petty' then
    insert into public.cash_movements(company_id,branch_id,cash_register_id,kind,amount,note,occurred_at) values(v_company,p_branch_id,v_register.id,'egress',p_amount,concat('Caja chica · Retiro de mi caja',case when v_note is null then '' else ' · '||v_note end),v_at);
    v_balance:=v_balance+p_amount;
  else v_balance:=v_balance-p_amount; end if;
  return jsonb_build_object('ok',true,'balance',round(v_balance,2),'movement',jsonb_build_object('id',v_id,'kind',p_kind,'amount',round(p_amount,2),'note',v_note,'occurred_at',v_at,'cash_register_id',v_register.id));
end $$;

-- Compras: pago total/parcial y una sola finalización del saldo.
alter table public.purchases add column if not exists payment_status text not null default 'paid';
alter table public.purchases add column if not exists paid_amount numeric;
alter table public.purchases add column if not exists payment_method text;
alter table public.purchases add column if not exists payment_completed_at timestamptz;
alter table public.purchases add column if not exists completion_payment_method text;
alter table public.purchases add column if not exists payment_completion_count integer not null default 0;
alter table public.purchases disable trigger enforce_subscription_write;
update public.purchases set paid_amount=total where paid_amount is null;
alter table public.purchases enable trigger enforce_subscription_write;
alter table public.purchases alter column paid_amount set default 0;
alter table public.purchases alter column paid_amount set not null;
alter table public.purchases drop constraint if exists purchases_payment_status_check;
alter table public.purchases add constraint purchases_payment_status_check check (payment_status in ('paid','partial'));
alter table public.purchases drop constraint if exists purchases_payment_method_check;
alter table public.purchases add constraint purchases_payment_method_check check (payment_method is null or payment_method in ('cash','transfer'));
alter table public.purchases drop constraint if exists purchases_completion_payment_method_check;
alter table public.purchases add constraint purchases_completion_payment_method_check check (completion_payment_method is null or completion_payment_method in ('cash','transfer'));
alter table public.purchases drop constraint if exists purchases_paid_amount_check;
alter table public.purchases add constraint purchases_paid_amount_check check ((payment_status='paid' and paid_amount=total) or (payment_status='partial' and paid_amount>0 and paid_amount<total));
alter table public.purchases drop constraint if exists purchases_payment_completion_count_check;
alter table public.purchases add constraint purchases_payment_completion_count_check check (payment_completion_count in (0,1));

create or replace function public.complete_purchase_payment(p_purchase_id uuid,p_payment_method text)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare v_company uuid:=public.current_user_company_id(); v_row public.purchases%rowtype; v_remaining numeric:=0;
begin
  if auth.uid() is null or v_company is null then raise exception 'Usuario no autenticado'; end if;
  if p_payment_method not in ('cash','transfer') then raise exception 'Medio de pago inválido'; end if;
  select * into v_row from public.purchases where id=p_purchase_id and company_id=v_company for update;
  if not found then raise exception 'Compra no encontrada'; end if;
  if not public.branch_has_permission(v_row.branch_id,'can_manage_purchases',array['manager','supervisor']) then raise exception 'Tu usuario no tiene permiso para administrar compras'; end if;
  if v_row.payment_status<>'partial' or v_row.payment_completion_count<>0 then raise exception 'Esta compra ya no admite edición de pago'; end if;
  v_remaining:=v_row.total-v_row.paid_amount;
  if v_remaining<=0 then raise exception 'La compra ya está pagada'; end if;
  update public.purchases set paid_amount=total,payment_status='paid',payment_completed_at=now(),completion_payment_method=p_payment_method,payment_completion_count=1 where id=v_row.id returning * into v_row;
  return jsonb_build_object('ok',true,'id',v_row.id,'paid_amount',round(v_row.paid_amount,2),'remaining',0,'payment_status',v_row.payment_status,'payment_completed_at',v_row.payment_completed_at,'completion_payment_method',v_row.completion_payment_method);
end $$;

revoke execute on function public.set_petty_cash_balance(uuid,numeric) from anon;
revoke execute on function public.complete_purchase_payment(uuid,text) from anon;
revoke execute on function public.register_petty_cash_movement(uuid,text,numeric,text) from anon;
grant execute on function public.set_petty_cash_balance(uuid,numeric) to authenticated;
grant execute on function public.complete_purchase_payment(uuid,text) to authenticated;
grant execute on function public.register_petty_cash_movement(uuid,text,numeric,text) to authenticated;
