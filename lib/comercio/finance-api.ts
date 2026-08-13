import type { TenantSession } from './types'

const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL??'https://wtcntclzcubkbtcsqkzc.supabase.co'
const KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

export type FinanceExpense={id:string;company_id:string;branch_id?:string|null;category:string;description:string;amount:number;due_date?:string|null;paid_at?:string|null;status:'pending'|'paid';recurrence:'once'|'monthly'|'yearly';notes?:string|null;created_at:string}
export type FinanceSale={sold_at:string;total:number}
export type Branch={id:string;name:string;is_primary?:boolean;active?:boolean}

async function req<T>(session:TenantSession,path:string,init:RequestInit={}){
  const r=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{...init,headers:{apikey:KEY,Authorization:`Bearer ${session.token}`,'Content-Type':'application/json',...(init.headers||{})},cache:'no-store'})
  const data=await r.json().catch(()=>null)
  if(!r.ok)throw new Error(data?.message||data?.error||`No se pudo consultar Finanzas (${r.status}).`)
  return data as T
}

export async function loadFinance(session:TenantSession){
  const from=new Date();from.setMonth(from.getMonth()-12)
  const [expenses,sales,branches]=await Promise.all([
    req<FinanceExpense[]>(session,`finance_expenses?select=*&company_id=eq.${encodeURIComponent(session.companyId)}&order=due_date.desc.nullslast,created_at.desc&limit=1500`),
    req<FinanceSale[]>(session,`sales?select=sold_at,total&company_id=eq.${encodeURIComponent(session.companyId)}&sold_at=gte.${encodeURIComponent(from.toISOString())}&order=sold_at.asc&limit=5000`),
    req<Branch[]>(session,`branches?select=id,name,is_primary,active&company_id=eq.${encodeURIComponent(session.companyId)}&active=eq.true&order=is_primary.desc,name.asc`),
  ])
  return {expenses:(expenses||[]).map(x=>({...x,amount:Number(x.amount||0)})),sales:(sales||[]).map(x=>({...x,total:Number(x.total||0)})),branches:branches||[]}
}

export async function saveFinanceExpense(session:TenantSession,input:Partial<FinanceExpense>&Pick<FinanceExpense,'description'|'amount'|'category'>){
  const body={company_id:session.companyId,branch_id:input.branch_id||null,category:input.category||'other',description:input.description.trim(),amount:Math.max(0,Number(input.amount||0)),due_date:input.due_date||null,status:input.status||'pending',recurrence:input.recurrence||'once',notes:input.notes||null,paid_at:input.status==='paid'?(input.paid_at||new Date().toISOString()):null,updated_at:new Date().toISOString()}
  if(input.id)await req(session,`finance_expenses?id=eq.${encodeURIComponent(input.id)}&company_id=eq.${encodeURIComponent(session.companyId)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify(body)})
  else await req(session,'finance_expenses',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify(body)})
}

export async function setFinanceExpensePaid(session:TenantSession,id:string,paid:boolean){
  await req(session,`finance_expenses?id=eq.${encodeURIComponent(id)}&company_id=eq.${encodeURIComponent(session.companyId)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({status:paid?'paid':'pending',paid_at:paid?new Date().toISOString():null,updated_at:new Date().toISOString()})})
}

export async function deleteFinanceExpense(session:TenantSession,id:string){
  await req(session,`finance_expenses?id=eq.${encodeURIComponent(id)}&company_id=eq.${encodeURIComponent(session.companyId)}`,{method:'DELETE',headers:{Prefer:'return=minimal'}})
}
