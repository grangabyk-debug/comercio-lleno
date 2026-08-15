create table if not exists public.petty_cash_movements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  branch_id uuid not null,
  cash_register_id uuid null references public.cash_registers(id) on delete set null,
  kind text not null check (kind in ('cash_to_petty','petty_withdrawal')),
  amount numeric not null check (amount > 0),
  note text null,
  occurred_at timestamptz not null default now(),
  created_by uuid null default auth.uid(),
  created_at timestamptz not null default now(),
  constraint petty_cash_movements_branch_fkey foreign key (company_id, branch_id) references public.branches(company_id, id)
);

create index if not exists petty_cash_movements_company_branch_time_idx on public.petty_cash_movements(company_id, branch_id, occurred_at desc);
create index if not exists petty_cash_movements_register_idx on public.petty_cash_movements(cash_register_id, occurred_at desc);

alter table public.petty_cash_movements enable row level security;

drop policy if exists petty_cash_movements_branch_select on public.petty_cash_movements;
create policy petty_cash_movements_branch_select on public.petty_cash_movements
for select to authenticated
using (company_id=public.current_user_company_id() and public.can_access_branch(branch_id) and public.branch_has_permission(branch_id,'can_open_close_cash',array['cashier','manager','supervisor']));

drop policy if exists petty_cash_movements_branch_insert on public.petty_cash_movements;
create policy petty_cash_movements_branch_insert on public.petty_cash_movements
for insert to authenticated
with check (company_id=public.current_user_company_id() and public.can_access_branch(branch_id) and public.branch_has_permission(branch_id,'can_open_close_cash',array['cashier','manager','supervisor']));

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

  select coalesce(sum(case when pcm.kind='cash_to_petty' then pcm.amount else -pcm.amount end),0) into v_balance
  from public.petty_cash_movements pcm where pcm.company_id=v_company and pcm.branch_id=p_branch_id;

  select coalesce(jsonb_agg(jsonb_build_object('id',q.id,'kind',q.kind,'amount',q.amount,'note',q.note,'occurred_at',q.occurred_at,'cash_register_id',q.cash_register_id) order by q.occurred_at desc),'[]'::jsonb)
  into v_rows
  from (select id,kind,amount,note,occurred_at,cash_register_id from public.petty_cash_movements where company_id=v_company and branch_id=p_branch_id order by occurred_at desc limit 150) q;

  return jsonb_build_object('balance',round(v_balance,2),'cash_open',v_open_register is not null,'cash_register_id',v_open_register,'movements',v_rows);
end $$;

create or replace function public.register_petty_cash_movement(p_branch_id uuid,p_kind text,p_amount numeric,p_note text default null)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare
  v_uid uuid:=auth.uid();
  v_company uuid:=public.current_user_company_id();
  v_register public.cash_registers%rowtype;
  v_balance numeric:=0;
  v_id uuid;
  v_at timestamptz:=now();
  v_note text:=nullif(btrim(coalesce(p_note,'')),'');
begin
  if v_uid is null or v_company is null then raise exception 'Usuario no autenticado'; end if;
  if p_kind not in ('cash_to_petty','petty_withdrawal') then raise exception 'Tipo de movimiento de caja chica inválido'; end if;
  if coalesce(p_amount,0)<=0 then raise exception 'Ingresá un importe mayor a cero'; end if;
  if not public.can_access_branch(p_branch_id) then raise exception 'No tenés acceso a esta sucursal'; end if;
  if not public.branch_has_permission(p_branch_id,'can_open_close_cash',array['cashier','manager','supervisor']) then raise exception 'Tu usuario no tiene permiso para administrar caja chica'; end if;

  perform 1 from public.branches b where b.company_id=v_company and b.id=p_branch_id for update;
  if not found then raise exception 'La sucursal no pertenece a este comercio'; end if;

  select * into v_register from public.cash_registers
  where company_id=v_company and branch_id=p_branch_id and status='open'
  order by opened_at desc nulls last limit 1 for update;
  if not found then raise exception 'Abrí la caja diaria antes de registrar un movimiento de caja chica'; end if;

  select coalesce(sum(case when kind='cash_to_petty' then amount else -amount end),0) into v_balance
  from public.petty_cash_movements where company_id=v_company and branch_id=p_branch_id;
  if p_kind='petty_withdrawal' and p_amount>v_balance then raise exception 'No hay suficiente efectivo en caja chica. Disponible: %',round(v_balance,2); end if;

  insert into public.petty_cash_movements(company_id,branch_id,cash_register_id,kind,amount,note,occurred_at,created_by)
  values(v_company,p_branch_id,v_register.id,p_kind,p_amount,v_note,v_at,v_uid) returning id into v_id;

  if p_kind='cash_to_petty' then
    insert into public.cash_movements(company_id,branch_id,cash_register_id,kind,amount,note,occurred_at)
    values(v_company,p_branch_id,v_register.id,'egress',p_amount,concat('Caja chica · Retiro de mi caja',case when v_note is null then '' else ' · '||v_note end),v_at);
    v_balance:=v_balance+p_amount;
  else
    v_balance:=v_balance-p_amount;
  end if;

  return jsonb_build_object('ok',true,'balance',round(v_balance,2),'movement',jsonb_build_object('id',v_id,'kind',p_kind,'amount',round(p_amount,2),'note',v_note,'occurred_at',v_at,'cash_register_id',v_register.id));
end $$;

revoke all on function public.get_petty_cash_state(uuid) from public;
revoke all on function public.register_petty_cash_movement(uuid,text,numeric,text) from public;
grant execute on function public.get_petty_cash_state(uuid) to authenticated;
grant execute on function public.register_petty_cash_movement(uuid,text,numeric,text) to authenticated;

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
  select coalesce(sum(case when kind='cash_to_petty' then amount else -amount end),0) into v_petty_balance
  from public.petty_cash_movements where company_id=v_company and branch_id=v_row.branch_id and occurred_at<=v_now;
  select coalesce(jsonb_agg(jsonb_build_object('id',q.id,'kind',q.kind,'amount',q.amount,'note',q.note,'occurred_at',q.occurred_at) order by q.occurred_at desc),'[]'::jsonb) into v_petty_activity
  from (select id,kind,amount,note,occurred_at from public.petty_cash_movements where company_id=v_company and branch_id=v_row.branch_id and cash_register_id=v_row.id order by occurred_at desc) q;

  v_expected:=coalesce(v_row.opening_amount,0)+v_cash_sales+v_income-v_expense-v_egress; v_closing:=coalesce(p_closing_amount,v_expected);
  v_summary:=jsonb_build_object('sales_total',round(v_sales_total,2),'sales_count',v_sales_count,'payments',v_payments,'cash_sales',round(v_cash_sales,2),'income',round(v_income,2),'expenses',round(v_expense,2),'egress',round(v_egress,2),'expected_cash',round(v_expected,2),'counted_cash',round(v_closing,2),'difference',round(v_closing-v_expected,2),'opening_amount',coalesce(v_row.opening_amount,0),'opened_at',v_row.opened_at,'closed_at',v_now,'branch_id',v_row.branch_id,'petty_cash_in',round(v_petty_in,2),'petty_cash_out',round(v_petty_out,2),'petty_cash_balance',round(v_petty_balance,2),'petty_cash_activity',v_petty_activity);
  insert into public.cash_register_history(company_id,branch_id,cash_register_id,opened_at,closed_at,opening_amount,closing_amount,opened_by,closed_by,summary) values(v_company,v_row.branch_id,v_row.id,v_row.opened_at,v_now,coalesce(v_row.opening_amount,0),v_closing,v_row.opened_by,v_uid,v_summary) returning id into v_history;
  update public.cash_registers set status='closed',closed_at=v_now,closed_by=v_uid,closing_amount=v_closing,close_summary=v_summary where id=v_row.id returning * into v_row;
  return to_jsonb(v_row)||jsonb_build_object('history_id',v_history);
end $$;
