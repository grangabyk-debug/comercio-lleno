'use client'

import { useEffect,useMemo,useState } from 'react'
import Link from 'next/link'
import { readTenantSession } from '@/lib/comercio/session'
import type { TenantSession } from '@/lib/comercio/types'
import FacturaLlenaLanding from './FacturaLlenaLanding'
import styles from './app-ui.module.css'

type Fiscal={configured:boolean;environment?:'homologacion'|'produccion';point_of_sale?:number|null}
type Invoice={receipt_number:number;cae:string;cae_expiration:string;date:string;amount:number}
type ReceiptSettings=Record<string,unknown>&{receiptAddress?:string;grossIncome?:string;activityStartDate?:string}
const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL??'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const money=new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0})
const digits=(v:string)=>v.replace(/\D/g,'')
const requestId=()=>globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random()}`

export default function FacturaLlenaMobile(){
 const[ready,setReady]=useState(false),[session,setSession]=useState<TenantSession|null>(null),[fiscal,setFiscal]=useState<Fiscal|null>(null)
 const[amount,setAmount]=useState(''),[client,setClient]=useState('Consumidor final'),[concept,setConcept]=useState('')
 const[busy,setBusy]=useState(false),[statusBusy,setStatusBusy]=useState(false),[error,setError]=useState(''),[invoice,setInvoice]=useState<Invoice|null>(null)
 const[grossIncome,setGrossIncome]=useState(''),[activityStart,setActivityStart]=useState(''),[profileComplete,setProfileComplete]=useState(true),[profileBusy,setProfileBusy]=useState(false)
 useEffect(()=>{const s=readTenantSession();setSession(s);setReady(true);if(s)void load(s)},[])
 const total=useMemo(()=>Number(digits(amount))||0,[amount])
 async function load(s=session){if(!s)return;setStatusBusy(true);setError('');try{const headers={apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${s.token}`};const[sr,cr]=await Promise.all([fetch(`${SUPABASE_URL}/functions/v1/arca-setup`,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({action:'status'}),cache:'no-store'}),fetch(`${SUPABASE_URL}/rest/v1/companies?id=eq.${encodeURIComponent(s.companyId)}&select=receipt_settings&limit=1`,{headers,cache:'no-store'})]);const sd=await sr.json().catch(()=>({})),ca=await cr.json().catch(()=>[]);if(!sr.ok||sd?.ok===false)throw new Error(sd?.error||'No se pudo consultar ARCA.');setFiscal(sd);const rs=(ca?.[0]?.receipt_settings||{}) as ReceiptSettings;setGrossIncome(String(rs.grossIncome||''));setActivityStart(String(rs.activityStartDate||''));setProfileComplete(Boolean(rs.grossIncome&&rs.activityStartDate))}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setStatusBusy(false)}}
 async function saveProfile(){if(!session||!grossIncome.trim()||!activityStart){setError('Completá Ingresos Brutos y fecha de inicio de actividades.');return}setProfileBusy(true);setError('');try{const headers={apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${session.token}`};const cr=await fetch(`${SUPABASE_URL}/rest/v1/companies?id=eq.${encodeURIComponent(session.companyId)}&select=receipt_settings&limit=1`,{headers,cache:'no-store'});const ca=await cr.json().catch(()=>[]);const rs={...(ca?.[0]?.receipt_settings||{}),grossIncome:grossIncome.trim(),activityStartDate:activityStart};const r=await fetch(`${SUPABASE_URL}/rest/v1/companies?id=eq.${encodeURIComponent(session.companyId)}`,{method:'PATCH',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({receipt_settings:rs})});if(!r.ok)throw new Error('No se pudieron guardar los datos fiscales.');setProfileComplete(true)}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setProfileBusy(false)}}
 async function emit(){if(!session||!fiscal?.configured||total<=0)return;if(total>=10000000){setError('Para este importe ARCA exige identificar al receptor. Ese flujo todavía no está habilitado.');return}setBusy(true);setError('');try{const r=await fetch(`${SUPABASE_URL}/functions/v1/arca-invoice`,{method:'POST',headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${session.token}`,'Content-Type':'application/json'},body:JSON.stringify({request_id:requestId(),amount:total}),cache:'no-store'});const d=await r.json().catch(()=>({}));if(!r.ok||!d?.ok||!d?.invoice?.cae)throw new Error(d?.error||'ARCA no autorizó el comprobante.');setInvoice(d.invoice)}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
 function shareText(){if(!invoice)return'';return `Factura C ${String(fiscal?.point_of_sale||0).padStart(5,'0')}-${String(invoice.receipt_number).padStart(8,'0')}\n${client}\n${concept||'Comprobante electrónico'}\nTotal: ${money.format(invoice.amount)}\nCAE: ${invoice.cae}`}
 async function share(){if(!invoice)return;const text=shareText();if(navigator.share){try{await navigator.share({title:'Factura C',text});return}catch(e){if(e instanceof DOMException&&e.name==='AbortError')return}}window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,'_blank')}
 if(!ready)return <main className={styles.appPage}/>
 if(!session)return <FacturaLlenaLanding/>
 return <main className={styles.appPage}>
  <header className={styles.appHeader}><button className={styles.iconButton} onClick={()=>void load()}>↻</button><div className={styles.appWordmark}>FacturaLlena</div><button className={styles.iconButton} onClick={()=>alert('En Chrome: menú ⋮ → Agregar a pantalla principal')}>↓</button></header>
  <section className={styles.statusBar}><span className={fiscal?.configured?styles.okDot:styles.warnDot}/><b>{statusBusy?'Consultando ARCA…':fiscal?.configured?`ARCA ${fiscal.environment==='produccion'?'Producción':'Homologación'}`:'ARCA pendiente'}</b><small>{session.companyName}</small></section>
  {!invoice?<section className={styles.invoiceForm}>
   <div className={styles.formIntro}><span>NUEVA FACTURA C</span><h1>¿Qué facturamos?</h1></div>
   <label>Cliente<input value={client} onChange={e=>setClient(e.target.value)}/></label>
   <label>Concepto<input value={concept} onChange={e=>setConcept(e.target.value)} placeholder="Ej: Productos varios"/></label>
   <div className={styles.chips}><button type="button" className={styles.activeChip}>Factura C</button><button type="button">Consumidor final</button></div>
   <label className={styles.amount}>Importe<div><span>$</span><input inputMode="numeric" value={amount} onChange={e=>setAmount(digits(e.target.value))} placeholder="0"/></div></label>
   {!profileComplete&&<div className={styles.setupNote}><b>Completá 2 datos fiscales</b><span>Se guardan una sola vez para tus comprobantes.</span><label>Ingresos Brutos<input value={grossIncome} onChange={e=>setGrossIncome(e.target.value)} placeholder="Número de inscripción"/></label><label>Inicio de actividades<input type="date" value={activityStart} onChange={e=>setActivityStart(e.target.value)}/></label><button onClick={()=>void saveProfile()} disabled={profileBusy}>{profileBusy?'Guardando…':'Guardar datos fiscales'}</button></div>}
   {error&&<div className={styles.error}>{error}</div>}
   <div className={styles.thumbAction}><div><small>TOTAL</small><strong>{money.format(total)}</strong></div><button disabled={busy||!fiscal?.configured||total<=0} onClick={()=>void emit()}>{busy?'Consultando ARCA…':'Emitir factura'}</button></div>
  </section>:<section className={styles.success}><div className={styles.check}>✓</div><span>FACTURA AUTORIZADA</span><h1>{money.format(invoice.amount)}</h1><p>{client}<br/>{concept||'Comprobante electrónico'}</p><div className={styles.fiscalCard}><div><small>COMPROBANTE</small><b>{String(fiscal?.point_of_sale||0).padStart(5,'0')}-{String(invoice.receipt_number).padStart(8,'0')}</b></div><div><small>CAE</small><b>{invoice.cae}</b></div><div><small>VENCIMIENTO</small><b>{invoice.cae_expiration}</b></div></div><button className={styles.whatsapp} onClick={()=>void share()}>Compartir por WhatsApp / Mail</button><button className={styles.again} onClick={()=>{setInvoice(null);setAmount('');setConcept('');setError('')}}>Hacer otra factura</button></section>}
  <nav className={styles.bottomNav}><button className={styles.navActive}>Inicio</button><button className={styles.plus} onClick={()=>{setInvoice(null);setAmount('');setConcept('')}}>+</button><Link href="/factura-llena/facturas">Facturas</Link></nav>
 </main>
}
