'use client'
import {useEffect,useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'

type Wallet={scope_key:string;company_id?:string|null;label:string;total:number;free_remaining:number;bonus_remaining:number;period_allowance:number;period_used:number;purchased_remaining:number;period_expires_at?:string|null;plan?:string;monthly_allowance?:number;welcome_allowance?:number;non_accumulative?:boolean}
type Pack={code:string;credits:number;amount:number;label:string}
async function authHeader(){const {data}=await cvAuthClient().auth.getSession();return data.session?.access_token?{Authorization:`Bearer ${data.session.access_token}`}:{}}
export default function FlexCredits({companyId,onCompanyChange,refreshKey=0}:{companyId:string|null;onCompanyChange:(id:string|null)=>void;refreshKey?:number}){
 const [personal,setPersonal]=useState<Wallet|null>(null),[companies,setCompanies]=useState<Wallet[]>([]),[packs,setPacks]=useState<Pack[]>([]),[busy,setBusy]=useState(''),[notice,setNotice]=useState(''),[loading,setLoading]=useState(true)
 async function load(){
  setLoading(true);setNotice('')
  try{
   const h=await authHeader();if(!('Authorization' in h))throw new Error('Iniciá sesión para consultar tus créditos.')
   const controller=new AbortController(),timer=window.setTimeout(()=>controller.abort(),8000)
   try{
    const r=await fetch('/api/postula/flex/credits',{headers:h,cache:'no-store',signal:controller.signal});const d=await r.json().catch(()=>({}))
    if(!r.ok||!d?.ok)throw new Error(d?.error||'No pudimos consultar tus créditos.')
    setPersonal(d.personal);setCompanies(d.companies||[]);setPacks(d.packs||[]);if(companyId&&!d.companies?.some((x:Wallet)=>x.company_id===companyId))onCompanyChange(null)
   }finally{window.clearTimeout(timer)}
  }catch(e){setNotice(e instanceof Error&&e.name==='AbortError'?'La consulta tardó demasiado. Tocá Reintentar.':e instanceof Error?e.message:'No pudimos consultar tus créditos.')}finally{setLoading(false)}
 }
 useEffect(()=>{void load()},[refreshKey])
 const selected=companyId?companies.find(x=>x.company_id===companyId)||personal:personal
 const included=selected?Math.max(0,(selected.period_allowance||0)-(selected.period_used||0)):0
 const expires=selected?.period_expires_at?new Date(selected.period_expires_at).toLocaleDateString('es-AR',{day:'2-digit',month:'2-digit',year:'2-digit',timeZone:'America/Argentina/Buenos_Aires'}):''
 async function buy(pack:Pack){setBusy(pack.code);setNotice('');try{const h=await authHeader();const r=await fetch('/api/postula/flex/credits/checkout',{method:'POST',headers:{'Content-Type':'application/json',...h},body:JSON.stringify({pack:pack.code,company_id:companyId})});const d=await r.json().catch(()=>({}));if(!r.ok||!d?.ok)throw new Error(d?.error||'No pudimos abrir Mercado Pago.');location.assign(d.init_point)}catch(e){setNotice(e instanceof Error?e.message:'No pudimos abrir Mercado Pago.');setBusy('')}}
 return <div className="pm21-flex-credits"><div className="pm21-flex-credit-head"><div><span>CRÉDITOS DE PUBLICACIÓN</span><b>{selected?`${selected.total} ${selected.total===1?'crédito disponible':'créditos disponibles'}`:loading?'Consultando saldo…':'Saldo no disponible'}</b><small>{companyId?'Los créditos incluidos dependen del plan de la empresa.':'Los primeros 30 días tenés 3 publicaciones Flex. Después se renuevan 2 cada 30 días. Los créditos incluidos no se acumulan.'}</small>{expires&&<small>Renovación del período: {expires}</small>}</div>{companies.length>0&&<label>Publicar como<select value={companyId||''} onChange={e=>onCompanyChange(e.target.value||null)}><option value="">Mi cuenta personal</option>{companies.map(c=><option key={c.scope_key} value={c.company_id||''}>{c.label} · {c.total} créditos</option>)}</select></label>}</div>{selected&&<div className="pm21-flex-credit-breakdown"><span>Incluidos en este período <b>{included}</b></span><span>Comprados <b>{selected.purchased_remaining||0}</b></span></div>}{selected&&selected.total<=0&&<div className="pm21-flex-packs"><div><b>Necesitás otro crédito</b><span>Comprá publicaciones sueltas. No necesitás contratar un plan mensual.</span></div><div>{packs.map(p=><button type="button" key={p.code} disabled={Boolean(busy)} onClick={()=>void buy(p)}><b>{p.label}</b><span>${p.amount.toLocaleString('es-AR')}</span><small>{p.credits>1?`$${Math.round(p.amount/p.credits).toLocaleString('es-AR')} c/u`:'pago único'}</small></button>)}</div></div>}{notice&&<p className="pm21-flex-credit-notice">{notice}{!loading&&!selected&&<button type="button" onClick={()=>void load()} style={{marginLeft:10,border:0,borderRadius:999,padding:'7px 12px',fontWeight:900,cursor:'pointer'}}>Reintentar</button>}</p>}</div>
}
