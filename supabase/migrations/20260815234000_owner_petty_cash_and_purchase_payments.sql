-- Ajuste protegido de caja chica + seguimiento de pagos de compras.

-- CAJA CHICA: conservar auditoría cuando el propietario corrige el saldo.
alter table public.petty_cash_movements drop constraint if exists petty_cash_movements_kind_check;
alter table public.petty_cash_movements
  add constraint petty_cash_movements_kind_check
  check (kind in ('cash_to_petty','petty_withdrawal','owner_adjustment_in','owner_adjustment_out'));

create or replace function public.get_petty_cash_state(p_branch_id uuid)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare
  v_company uuid:=public.current_user_company_id();
  v_balance numeric:=0;
  v_open_register uuid;
  v_rows jsonb:='[]'::jsonb;
begin
  if auth.uid() is null or v_company is null then raise exception 'Usuario no autenticado'; end if;
  if not public.can_access_branch(p_branch_id) then raise exception 'No tenés acceso a esta sucursal'; end if;
  if not public.branch_has_permission(p_branch_id,'can_open_close_cash',array['cashier','manager','supervisor']) then raise exception 'Tu usuario no tiene permiso para administrar caja chica'; end if;

  select cr.id into v_open_register from public.cash_registers cr
  where cr.company_id=v_company and cr.branch_id=p_branch_id and cr.status='open'
  order by cr.opened_at desc nulls last limit 1;

  select coalesce(sum(case
    when pcm.kind in ('cash_to_petty','owner_adjustment_in') then pcm.amount
    else -pcm.amount end),0) into v_balance
  from public.petty_cash_movements pcm where pcm.company_id=v_company and pcm.branch_id=p_branch_id;

  select coalesce(jsonb_agg(jsonb_build_object('id',q.id,'kind',q.kind,'amount',q.amount,'note',q.note,'occurred_at',q.occurred_at,'cash_register_id',q.cash_register_id,'created_by',q.created_by) order by q.occurred_at desc),'[]'::jsonb)
  into v_rows
  from (select id,kind,amount,note,occurred_at,cash_register_id,created_by from public.petty_cash_movements where company_id=v_company and branch_id=p_branch_id order by occurred_at desc limit 150) q;

  return jsonb_build_object('balance',round(v_balance,2),'cash_open',v_open_register is not null,'cash_register_id',v_open_register,'movements',v_rows);
end $$;

create or replace function public.set_petty_cash_balance(p_branch_id uuid,p_target_balance numeric)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare
  v_uid uuid:=auth.uid();
  v_company uuid:=public.current_user_company_id();
  v_current numeric:=0;
  v_delta numeric:=0;
  v_kind text;
  v_register uuid;
  v_id uuid;
  v_at timestamptz:=now();
begin
  if v_uid is null or v_company is null then raise exception 'Usuario no autenticado'; end if;
  if public.current_user_role() <> 'owner' then raise exception 'Solo el propietario puede corregir el saldo de caja chica'; end if;
  if not public.can_access_branch(p_branch_id) then raise exception 'No tenés acceso a esta sucursal'; end if;
  if coalesce(p_target_balance,-1) < 0 then raise exception 'El saldo no puede ser negativo'; end if;

  perform 1 from public.branches b where b.company_id=v_company and b.id=p_branch_id for update;
  if not found then raise exception 'La sucursal no pertenece a este comercio'; end if;

  select coalesce(sum(case when kind in ('cash_to_petty','owner_adjustment_in') then amount else -amount end),0)
    into v_current
  from public.petty_cash_movements where company_id=v_company and branch_id=p_branch_id;

  v_delta:=round(p_target_balance-v_current,2);
  if v_delta=0 then
    return jsonb_build_object('ok',true,'balance',round(v_current,2),'changed',false);
  end if;

  select id into v_register from public.cash_registers
  where company_id=v_company and branch_id=p_branch_id and status='open'
  order by opened_at desc nulls last limit 1;

  v_kind:=case when v_delta>0 then 'owner_adjustment_in' else 'owner_adjustment_out' end;
  insert into public.petty_cash_movements(company_id,branch_id,cash_register_id,kind,amount,note,occurred_at,created_by)
  values(v_company,p_branch_id,v_register,v_kind,abs(v_delta),'Ajuste manual de saldo por propietario',v_at,v_uid)
  returning id into v_id;

  return jsonb_build_object('ok',true,'balance',round(p_target_balance,2),'changed',true,'movement_id',v_id);
end $$;

revoke all on function public.set_petty_cash_balance(uuid,numeric) from public;
grant execute on function public.set_petty_cash_balance(uuid,numeric) to authenticated;

-- Mantener el saldo persistente y los ajustes dentro del resumen auditado del cierre.
create or replace function public.close_cash_register_authorized(p_register_id uuid,p_closing_amount numeric default null::numeric)
returns jsonb language plpgsql security definer set search_path to 'public','pg_temp' as $$
declare
  v_uid uuid:=auth.uid(); v_company uuid:=public.current_user_company_id(); v_row public.cash_registers%rowtype; v_now timestamptz:=now();
  v_sales_total numeric:=0; v_sales_count integer:=0; v_cash_sales numeric:=0; v_income numeric:=0; v_expense numeric:=0; v_egress numeric:=0;
  v_expected numeric:=0; v_closing numeric; v_payments jsonb:='{}'::jsonb; v_summary jsonb; v_history uuid;
  v_petty_in numeric:=0; v_petty_out numeric:=0; v_petty_balance numeric:=0; v_petty_activity jsonb:='[]'::jsonb;
begin
  if v_uid is null or v_company is null then raise exception 'Usuario no autenticado'; end if;
  select * into v_row from public.cash_registers where id=p_register_id and company_id=v_company and status='open' for update;
  if not found then raise exception 'La caja ya está cerrada o no pertenece a este comercio'; end if;
  if not public.branch_has_permission(v_row.branch_id,'can_open_close_cash',array['cashier','manager','supervisor']) then raise exception 'Tu usuario no tiene permiso para cerrar la caja'; end if;

  select coalesce(sum(total),0),count(*) into v_sales_total,v_sales_count from public.sales where company_id=v_company and branch_id=v_row.branch_id and sold_at>=v_row.opened_at and sold_at<=v_now;
  select coalesce(sum(total),0) into v_cash_sales from public.sales where company_id=v_company and branch_id=v_row.branch_id and sold_at>=v_row.opened_at and sold_at<=v_now and lower(coalesce(payment_method,'')) like '%efect%';
  select coalesce(jsonb_object_agg(payment_method,total),'{}'::jsonb) into v_payments from (select coalesce(nullif(payment_method,''),'Sin informar') payment_method,round(sum(total)::numeric,2) total from public.sales where company_id=v_company and branch_id=v_row.branch_id and sold_at>=v_row.opened_at and sold_at<=v_now group by 1) q;
  select coalesce(sum(amount) filter(where kind='income'),0),coalesce(sum(amount) filter(where kind='expense'),0),coalesce(sum(amount) filter(where kind='egress'),0) into v_income,v_expense,v_egress from public.cash_movements where company_id=v_company and branch_id=v_row.branch_id and occurred_at>=v_row.opened_at and occurred_at<=v_now;

  select coalesce(sum(amount) filter(where kind='cash_to_petty'),0),coalesce(sum(amount) filter(where kind='petty_withdrawal'),0) into v_petty_in,v_petty_out
  from public.petty_cash_movements where company_id=v_company and branch_id=v_row.branch_id and cash_register_id=v_row.id;
  select coalesce(sum(case when kind in ('cash_to_petty','owner_adjustment_in') then amount else -amount end),0) into v_petty_balance
  from public.petty_cash_movements where company_id=v_company and branch_id=v_row.branch_id and occurred_at<=v_now;
  select coalesce(jsonb_agg(jsonb_build_object('id',q.id,'kind',q.kind,'amount',q.amount,'note',q.note,'occurred_at',q.occurred_at) order by q.occurred_at desc),'[]'::jsonb) into v_petty_activity
  from (select id,kind,amount,note,occurred_at from public.petty_cash_movements where company_id=v_company and branch_id=v_row.branch_id and cash_register_id=v_row.id order by occurred_at desc) q;

  v_expected:=coalesce(v_row.opening_amount,0)+v_cash_sales+v_income-v_expense-v_egress; v_closing:=coalesce(p_closing_amount,v_expected);
  v_summary:=jsonb_build_object('sales_total',round(v_sales_total,2),'sales_count',v_sales_count,'payments',v_payments,'cash_sales',round(v_cash_sales,2),'income',round(v_income,2),'expenses',round(v_expense,2),'egress',round(v_egress,2),'expected_cash',round(v_expected,2),'counted_cash',round(v_closing,2),'difference',round(v_closing-v_expected,2),'opening_amount',coalesce(v_row.opening_amount,0),'opened_at',v_row.opened_at,'closed_at',v_now,'branch_id',v_row.branch_id,'petty_cash_in',round(v_petty_in,2),'petty_cash_out',round(v_petty_out,2),'petty_cash_balance',round(v_petty_balance,2),'petty_cash_activity',v_petty_activity);
  insert into public.cash_register_history(company_id,branch_id,cash_register_id,opened_at,closed_at,opening_amount,closing_amount,opened_by,closed_by,summary) values(v_company,v_row.branch_id,v_row.id,v_row.opened_at,v_now,coalesce(v_row.opening_amount,0),v_closing,v_row.opened_by,v_uid,v_summary) returning id into v_history;
  update public.cash_registers set status='closed',closed_at=v_now,closed_by=v_uid,closing_amount=v_closing,close_summary=v_summary where id=v_row.id returning * into v_row;
  return to_jsonb(v_row)||jsonb_build_object('history_id',v_history);
end $$;

-- COMPRAS: pago total/parcial, saldo pendiente y finalización única.
alter table public.purchases add column if not exists payment_status text not null default 'paid';
alter table public.purchases add column if not exists paid_amount numeric;
alter table public.purchases add column if not exists payment_method text;
alter table public.purchases add column if not exists payment_completed_at timestamptz;
alter table public.purchases add column if not exists completion_payment_method text;
alter table public.purchases add column if not exists payment_completion_count integer not null default 0;

update public.purchases set paid_amount=total where paid_amount is null;
alter table public.purchases alter column paid_amount set default 0;
alter table public.purchases alter column paid_amount set not null;

alter table public.purchases drop constraint if exists purchases_payment_status_check;
alter table public.purchases add constraint purchases_payment_status_check check (payment_status in ('paid','partial'));
alter table public.purchases drop constraint if exists purchases_payment_method_check;
alter table public.purchases add constraint purchases_payment_method_check check (payment_method is null or payment_method in ('cash','transfer'));
alter table public.purchases drop constraint if exists purchases_completion_payment_method_check;
alter table public.purchases add constraint purchases_completion_payment_method_check check (completion_payment_method is null or completion_payment_method in ('cash','transfer'));
alter table public.purchases drop constraint if exists purchases_paid_amount_check;
alter table public.purchases add constraint purchases_paid_amount_check check (
  (payment_status='paid' and paid_amount=total)
  or (payment_status='partial' and paid_amount>0 and paid_amount<total)
);
alter table public.purchases drop constraint if exists purchases_payment_completion_count_check;
alter table public.purchases add constraint purchases_payment_completion_count_check check (payment_completion_count in (0,1));

create or replace function public.complete_purchase_payment(p_purchase_id uuid,p_payment_method text)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare
  v_company uuid:=public.current_user_company_id();
  v_row public.purchases%rowtype;
  v_remaining numeric:=0;
begin
  if auth.uid() is null or v_company is null then raise exception 'Usuario no autenticado'; end if;
  if p_payment_method not in ('cash','transfer') then raise exception 'Medio de pago inválido'; end if;

  select * into v_row from public.purchases
  where id=p_purchase_id and company_id=v_company for update;
  if not found then raise exception 'Compra no encontrada'; end if;
  if not public.branch_has_permission(v_row.branch_id,'can_manage_purchases',array['manager','supervisor']) then raise exception 'Tu usuario no tiene permiso para administrar compras'; end if;
  if v_row.payment_status<>'partial' or v_row.payment_completion_count<>0 then raise exception 'Esta compra ya no admite edición de pago'; end if;

  v_remaining:=v_row.total-v_row.paid_amount;
  if v_remaining<=0 then raise exception 'La compra ya está pagada'; end if;

  update public.purchases set
    paid_amount=total,
    payment_status='paid',
    payment_completed_at=now(),
    completion_payment_method=p_payment_method,
    payment_completion_count=1
  where id=v_row.id
  returning * into v_row;

  return jsonb_build_object(
    'ok',true,
    'id',v_row.id,
    'paid_amount',round(v_row.paid_amount,2),
    'remaining',0,
    'payment_status',v_row.payment_status,
    'payment_completed_at',v_row.payment_completed_at,
    'completion_payment_method',v_row.completion_payment_method
  );
end $$;

revoke all on function public.complete_purchase_payment(uuid,text) from public;
grant execute on function public.complete_purchase_payment(uuid,text) to authenticated;
