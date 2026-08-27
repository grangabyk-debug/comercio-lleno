'use client'

import Link from 'next/link'
import {useEffect,useState} from 'react'
import {cvAuthClient} from '../../cv-ia/cvAuth'

type Purchase={id:string;pack_code:string;credits:number;amount_ars:number;status:string;provider?:string|null;credited_at?:string|null;created_at:string}
type Summary={company:{id:string;name:string};plan:{code:string;label:string;status:string;provider?:string|null;current_period_end?:string|null;pending_plan?:string|null;nexo_enabled:boolean};flex:{total:number;free:number;bonus:number;period_remaining:number;purchased:number;period_expires_at?:string|null;purchases:Purchase[]};billing:{fiscal_invoices_available:boolean;note:string}}
const PACKS=[{code:'flex1',credits:1,amount:995,label:'1 crédito'},{code:'flex5',credits:5,amount:3950,label:'5 créditos',featured:true},{code:'flex10',credits:10,amount:6950,label:'10 créditos'}] as const
const money=(n:number)=>new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(n||0)
const date=(v?:string|null)=>v?new Date(v).toLocaleDateString('es-AR'):'—'
async function currentSession(){const {data}=await cvAuthClient().auth.getSession();return data.session}

export default function EmployerBillingCenter(){
 const [data,setData]=useState<Summary|null>(null),[loading,setLoading]=useState(true),[busy,setBusy]=useState(''),[notice,setNotice]=useState('')
 async function load(){setLoading(true);try{const s=await currentSession();if(!s)throw new Error('Iniciá sesión.');const r=await fetch('/api/postula/company/account',{headers:{Authorization:`Bearer ${s.access_token}`},cache:'no-store'});const d=await r.json().catch(()=>({}));if(!r.ok||!d?.ok)throw new Error(d?.error||'No pudimos cargar planes y pagos.');setData(d)}catch(e){setNotice(e instanceof Error?e.message:'No pudimos cargar planes y pagos.')}finally{setLoading(false)}}
 useEffect(()=>{void load()},[])
 async function buy(code:string){if(!data||busy)return;setBusy(code);setNotice('');try{const s=await currentSession();if(!s)throw new Error('Iniciá sesión.');const r=await fetch('/api/postula/flex/credits/checkout',{method:'POST',headers:{Authorization:`Bearer ${s.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({pack:code,company_id:data.company.id})});const d=await r.json().catch(()=>({}));if(!r.ok||!d?.ok||!d?.init_point)throw new Error(d?.error||'No pudimos abrir Mercado Pago.');window.location.assign(d.init_point)}catch(e){setNotice(e instanceof Error?e.message:'No pudimos abrir Mercado Pago.');setBusy('')}}
 if(loading)return <div className="pm51-loading">Cargando planes y pagos…</div>
 if(!data)return <div className="pm51-empty">{notice||'No pudimos cargar planes y pagos.'}</div>
 const {plan,flex}=data
 return <section className="pm51-billing-stack">
  <article className="pm51-panel pm51-plan-card"><div className="pm51-panel-head"><div><span>PLAN DE EMPRESA</span><h2>{plan.label}</h2><p>El plan de empresa controla capacidad de selección y acceso a herramientas. Los créditos de Servicios Flex se administran aparte.</p></div><div className="pm51-plan-status" data-on={plan.status==='authorized'}>{plan.status==='authorized'?'Activo':'Plan gratuito'}</div></div><div className="pm51-plan-grid"><div><small>Nexo móvil</small><b>{plan.nexo_enabled?'Incluido':'No incluido'}</b></div><div><small>Próximo período</small><b>{date(plan.current_period_end)}</b></div><div><small>Cambio pendiente</small><b>{plan.pending_plan||'Ninguno'}</b></div><div><small>Proveedor</small><b>{plan.provider||'Postulá Mejor'}</b></div></div><div className="pm51-plan-actions"><Link href="/empresas">Ver planes disponibles</Link>{plan.nexo_enabled&&<Link href="/empresas/movil" className="dark">Abrir Nexo</Link>}</div></article>

  <article className="pm51-panel pm51-flex-billing"><div className="pm51-panel-head"><div><span>CRÉDITOS SERVICIOS FLEX</span><h2>{flex.total} crédito{flex.total===1?' disponible':'s disponibles'}</h2><p>Cada publicación Flex consume un crédito. Los créditos comprados permanecen disponibles; los incluidos se renuevan según su período.</p></div></div><div className="pm51-credit-breakdown"><div><small>Incluidos</small><b>{flex.period_remaining}</b></div><div><small>Comprados</small><b>{flex.purchased}</b></div><div><small>Bonificación</small><b>{flex.bonus}</b></div><div><small>Gratis</small><b>{flex.free}</b></div></div>{flex.period_expires_at&&<p className="pm51-renewal">Próxima renovación de incluidos: <b>{date(flex.period_expires_at)}</b></p>}
   <div className="pm51-pack-title"><div><span>COMPRAR CRÉDITOS</span><h3>Pago único por Mercado Pago.</h3></div><small>Promo lanzamiento</small></div><div className="pm51-pack-grid">{PACKS.map(pack=><button type="button" key={pack.code} data-featured={'featured' in pack&&pack.featured} disabled={Boolean(busy)} onClick={()=>void buy(pack.code)}>{'featured' in pack&&pack.featured&&<em>MÁS ELEGIDO</em>}<strong>{pack.label}</strong><b>{money(pack.amount)}</b><small>{pack.credits>1?`${money(Math.round(pack.amount/pack.credits))} por crédito`:'pago único'}</small><span>{busy===pack.code?'Abriendo Mercado Pago…':'Comprar'}</span></button>)}</div>
  </article>

  <article className="pm51-panel pm51-payments"><div className="pm51-panel-head"><div><span>PAGOS</span><h2>Historial de compras.</h2><p>Acá quedan los pagos de créditos confirmados para esta empresa.</p></div></div>{flex.purchases.length?<div className="pm51-payment-list">{flex.purchases.slice(0,10).map(p=><div key={p.id}><div><b>{p.credits} crédito{p.credits===1?'':'s'} Flex</b><small>{date(p.credited_at||p.created_at)} · {p.status} · {p.provider||'mercadopago'}</small></div><strong>{money(p.amount_ars)}</strong></div>)}</div>:<div className="pm51-zero"><b>Todavía no hay compras.</b><span>Cuando compres créditos para la empresa van a aparecer acá.</span></div>}</article>
  {notice&&<p className="pm51-notice">{notice}</p>}
 </section>
}
