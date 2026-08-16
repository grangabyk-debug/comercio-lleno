create or replace function public.close_cash_register_authorized(p_register_id uuid, p_closing_amount numeric default null::numeric)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_uid uuid:=auth.uid(); v_company uuid:=public.current_user_company_id(); v_row public.cash_registers%rowtype; v_now timestamptz:=now();
  v_sales_total numeric:=0; v_sales_count integer:=0; v_cash_sales numeric:=0; v_income numeric:=0; v_expense numeric:=0; v_egress numeric:=0; v_expected numeric:=0; v_closing numeric; v_payments jsonb:='{}'::jsonb; v_summary jsonb; v_history uuid;
  v_petty_in numeric:=0; v_petty_out numeric:=0; v_petty_balance numeric:=0; v_petty_activity jsonb:='[]'::jsonb;
begin
  if v_uid is null or v_company is null then raise exception 'Usuario no autenticado'; end if;
  select * into v_row from public.cash_registers where id=p_register_id and company_id=v_company and status='open' for update;
  if not found then raise exception 'La caja ya está cerrada o no pertenece a este comercio'; end if;
  if not public.branch_has_permission(v_row.branch_id,'can_open_close_cash',array['cashier','manager','supervisor']) then raise exception 'Tu usuario no tiene permiso para cerrar la caja'; end if;

  select coalesce(sum(total),0),count(*) into v_sales_total,v_sales_count
  from public.sales
  where company_id=v_company and branch_id=v_row.branch_id and sold_at>=v_row.opened_at and sold_at<=v_now;

  select
    coalesce(sum(q.total) filter(where lower(q.payment_method) like '%efect%'),0),
    coalesce(jsonb_object_agg(q.payment_method,round(q.total::numeric,2)),'{}'::jsonb)
  into v_cash_sales,v_payments
  from (
    select p.payment_method,sum(p.amount) as total
    from (
      select
        coalesce(nullif(part.value->>'method',''),coalesce(nullif(s.payment_method,''),'Sin informar')) as payment_method,
        case when jsonb_typeof(part.value->'amount')='number' then greatest((part.value->>'amount')::numeric,0) else 0 end as amount
      from public.sales s
      cross join lateral jsonb_array_elements(
        case
          when jsonb_typeof(s.details->'payment_parts')='array' then
            case when jsonb_array_length(s.details->'payment_parts')>0 then s.details->'payment_parts'
            else jsonb_build_array(jsonb_build_object('method',coalesce(nullif(s.payment_method,''),'Sin informar'),'amount',s.total)) end
          else jsonb_build_array(jsonb_build_object('method',coalesce(nullif(s.payment_method,''),'Sin informar'),'amount',s.total))
        end
      ) part(value)
      where s.company_id=v_company and s.branch_id=v_row.branch_id and s.sold_at>=v_row.opened_at and s.sold_at<=v_now
    ) p
    group by p.payment_method
  ) q;

  select coalesce(sum(amount) filter(where kind='income'),0),coalesce(sum(amount) filter(where kind='expense'),0),coalesce(sum(amount) filter(where kind='egress'),0)
  into v_income,v_expense,v_egress
  from public.cash_movements
  where company_id=v_company and branch_id=v_row.branch_id and occurred_at>=v_row.opened_at and occurred_at<=v_now;

  select coalesce(sum(amount) filter(where kind='cash_to_petty'),0),coalesce(sum(amount) filter(where kind='petty_withdrawal'),0)
  into v_petty_in,v_petty_out
  from public.petty_cash_movements
  where company_id=v_company and branch_id=v_row.branch_id and cash_register_id=v_row.id;

  select coalesce(sum(case when kind in ('cash_to_petty','owner_adjustment_in') then amount else -amount end),0)
  into v_petty_balance
  from public.petty_cash_movements
  where company_id=v_company and branch_id=v_row.branch_id and occurred_at<=v_now;

  select coalesce(jsonb_agg(jsonb_build_object('id',q.id,'kind',q.kind,'amount',q.amount,'note',q.note,'occurred_at',q.occurred_at) order by q.occurred_at desc),'[]'::jsonb)
  into v_petty_activity
  from (select id,kind,amount,note,occurred_at from public.petty_cash_movements where company_id=v_company and branch_id=v_row.branch_id and cash_register_id=v_row.id order by occurred_at desc) q;

  v_expected:=coalesce(v_row.opening_amount,0)+v_cash_sales+v_income-v_expense-v_egress;
  v_closing:=coalesce(p_closing_amount,v_expected);
  v_summary:=jsonb_build_object('sales_total',round(v_sales_total,2),'sales_count',v_sales_count,'payments',v_payments,'cash_sales',round(v_cash_sales,2),'income',round(v_income,2),'expenses',round(v_expense,2),'egress',round(v_egress,2),'expected_cash',round(v_expected,2),'counted_cash',round(v_closing,2),'difference',round(v_closing-v_expected,2),'opening_amount',coalesce(v_row.opening_amount,0),'opened_at',v_row.opened_at,'closed_at',v_now,'branch_id',v_row.branch_id,'petty_cash_in',round(v_petty_in,2),'petty_cash_out',round(v_petty_out,2),'petty_cash_balance',round(v_petty_balance,2),'petty_cash_activity',v_petty_activity);

  insert into public.cash_register_history(company_id,branch_id,cash_register_id,opened_at,closed_at,opening_amount,closing_amount,opened_by,closed_by,summary)
  values(v_company,v_row.branch_id,v_row.id,v_row.opened_at,v_now,coalesce(v_row.opening_amount,0),v_closing,v_row.opened_by,v_uid,v_summary)
  returning id into v_history;

  update public.cash_registers set status='closed',closed_at=v_now,closed_by=v_uid,closing_amount=v_closing,close_summary=v_summary where id=v_row.id returning * into v_row;
  return to_jsonb(v_row)||jsonb_build_object('history_id',v_history);
end $function$;
