import { readActiveBranchId } from './branch-context'
import type { TenantSession } from './types'

const URL=process.env.NEXT_PUBLIC_SUPABASE_URL??'https://wtcntclzcubkbtcsqkzc.supabase.co'
const KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

export type PettyCashMovement={
  id:string
  kind:'cash_to_petty'|'petty_withdrawal'
  amount:number
  note?:string|null
  occurred_at:string
  cash_register_id?:string|null
}

export type PettyCashState={
  balance:number
  cash_open:boolean
  cash_register_id?:string|null
  movements:PettyCashMovement[]
}

async function rpc<T>(session:TenantSession,name:string,body:Record<string,unknown>):Promise<T>{
  const response=await fetch(`${URL}/rest/v1/rpc/${name}`,{
    method:'POST',
    headers:{apikey:KEY,Authorization:`Bearer ${session.token}`,'Content-Type':'application/json'},
    body:JSON.stringify(body),
    cache:'no-store',
  })
  const data=await response.json().catch(()=>null)
  if(!response.ok)throw new Error(data?.message||data?.error||`Error de caja chica (${response.status})`)
  return data as T
}

function branchId(){
  const id=readActiveBranchId()
  if(!id)throw new Error('No hay una sucursal activa. Elegí una sucursal y volvé a intentar.')
  return id
}

function normalize(value:any):PettyCashState{
  return{
    balance:Number(value?.balance||0),
    cash_open:Boolean(value?.cash_open),
    cash_register_id:value?.cash_register_id||null,
    movements:Array.isArray(value?.movements)?value.movements.map((m:any)=>({
      id:String(m.id),kind:m.kind,amount:Number(m.amount||0),note:m.note||null,occurred_at:String(m.occurred_at),cash_register_id:m.cash_register_id||null,
    })):[],
  }
}

export async function loadPettyCashState(session:TenantSession){
  return normalize(await rpc(session,'get_petty_cash_state',{p_branch_id:branchId()}))
}

export async function registerPettyCashMovement(session:TenantSession,kind:'cash_to_petty'|'petty_withdrawal',amount:number,note:string){
  const value=Math.max(0,Number(amount||0))
  if(!value)throw new Error('Ingresá un importe mayor a cero.')
  await rpc(session,'register_petty_cash_movement',{p_branch_id:branchId(),p_kind:kind,p_amount:value,p_note:note.trim()||null})
  return loadPettyCashState(session)
}
