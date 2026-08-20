'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { readTenantSession, signInTenant, type } from '@/lib/comercio/session'
import type { TenantSession } from '@/lib/comercio/types'
import styles from './factura-llena.module.css'

type DeferredPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }
type FiscalStatus={configured:boolean;environment?:'homologacion'|'produccion';tax_id?:string|null;point_of_sale?:number|null}
type Invoice={receipt_number:number;cae:string;cae_expiration:string;date:string;amount:number}

const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL??'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const money=new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0})

function requestId(){return globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random()}`}
function digits(v:string){return v.replace(/\D/g,'')}

export default function FacturaLlenaPreview(){
  const[session,setSession]=useState<TenantSession|null>(null)
  const[ready,setReady]=useState(false)
  const[identifier,setIdentifier]=useState('')
  const[password,setPassword]=useState('')
  const[loginBusy,setLoginBusy]=useState(false)
  const[amount,setAmount]=useState('')
  const[client,setClient]=useState('Consumidor final')
  const[concept,setConcept]=useState('')
  const[fiscal,setFiscal]=useState<FiscalStatus|null>(null)
  const[statusBusy,setStatusBusy]=useState(false)
  const[emitBusy,setEmitBusy]=useState(false)
  const[error,setError]=useState('')
  const[invoice,setInvoice]=useState<Invoice|null>(null)
  const[installPrompt,setInstallPrompt]=useState<DeferredPrompt|null>(null)

  useEffect(()=>{
    setSession(readTenantSession())
    setReady(true)
    const handler=(event:Event)=>{event.preventDefault();setInstallPrompt(event as DeferredPrompt)}
    window.addEventListener('beforeinstallprompt',handler)
    return()=>window.removeEventListener('beforeinstallprompt',handler)
  },[])

  useEffect(()=>{if(session)void loadFiscal(session)},[session?.companyId,session?.token])

  const total=useMemo(()=>Number(digits(amount))||0,[amount])

  async function install(){
    if(installPrompt){await installPrompt.prompt();await installPrompt.userChoice;setInstallPrompt(null);return}
    alert('En Android: abrí el menú del navegador y elegí “Agregar a pantalla de inicio” o “Instalar app”.')
  }

  async function login(e:FormEvent){
    e.preventDefault();if(!identifier.trim()||!password)return
    setLoginBusy(true);setError('')
    try{const s=await signInTenant(identifier,password);setSession(s)}
    catch(e){setError(e instanceof Error?e.message:'No se pudo ingresar.')}
    finally{setLoginBusy(false)}
  }

  async function setupRequest(s:TenantSession,body:Record<string,unknown>){
    const r=await fetch(`${SUPABASE_URL}/functions/v1/arca-setup`,{method:'POST',headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${s.token}`,'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store'})
    const d=await r.json().catch(()=>({}))
    if(!r.ok||d?.ok===false)throw new Error(d?.error||'No se pudo consultar ARCA.')
    return d
  }

  async function loadFiscal(s=session){
    if(!s)return
    setStatusBusy(true);setError('')
    try{const d=await setupRequest(s,{action:'status'});setFiscal(d)}
    catch(e){setFiscal(null);setError(e instanceof Error?e.message:String(e))}
    finally{setStatusBusy(false)}
  }

  async function emit(){
    if(!session)return
    if(!(total>0)){setError('Ingresá un importe mayor a cero.');return}
    if(!fiscal?.configured){setError('Primero hay que conectar ARCA para esta cuenta.');return}
    setEmitBusy(true);setError('');setInvoice(null)
    try{
      const r=await fetch(`${SUPABASE_URL}/functions/v1/arca-invoice`,{method:'POST',headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${session.token}`,'Content-Type':'application/json'},body:JSON.stringify({request_id:requestId(),amount:total}),cache:'no-store'})
      const d=await r.json().catch(()=>({}))
      if(!r.ok||!d?.ok||!d?.invoice?.cae)throw new Error(d?.error||d?.invoice?.errors?.map((x:{code:string;msg:string})=>`${x.code}: ${x.msg}`).join(' · ')||'ARCA no autorizó el comprobante.')
      setInvoice(d.invoice as Invoice)
    }catch(e){setError(e instanceof Error?e.message:String(e))}
    finally{setEmitBusy(false)}
  }

  function shareText(){
    if(!invoice)return''
    const n=String(invoice.receipt_number).padStart(8,'0')
    return `Factura C ${fiscal?.point_of_sale?String(fiscal.point_of_sale).padStart(4,'0'):'0000'}-${n}\n${client||'Consumidor final'}\n${concept||'Comprobante electrónico'}\nTotal: ${money.format(invoice.amount)}\nCAE: ${invoice.cae}\nVencimiento CAE: ${invoice.cae_expiration}\nEmitida con FacturaLlena.`
  }

  function whatsapp(){if(!invoice)return;window.open(`https://wa.me/?text=${encodeURIComponent(shareText())}`,'_blank','noopener,noreferrer')}
  function email(){if(!invoice)return;const subject=`Factura C - ${money.format(invoice.amount)}`;window.location.href=`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareText())}`}
  async function nativeShare(){
    if(!invoice)return
    if(navigator.share){try{await navigator.share({title:'Factura C',text:shareText()});return}catch{}}
    whatsapp()
  }

  if(!ready)return <main className={styles.appPage}/>

  if(!session)return <main className={styles.publicPage}>
    <header className={styles.publicHeader}><div className={styles.wordmark}>FacturaLlena</div><button onClick={install}>Instalar</button></header>
    <section className={styles.publicHero}>
      <div><span>FACTURACIÓN ELECTRÓNICA · ARCA</span><h1>Facturá desde el celular.<br/><em>Sin vueltas.</em></h1><p>Emití una Factura C, obtené el CAE y compartila por WhatsApp o mail desde el mismo teléfono.</p></div>
      <form className={styles.loginCard} onSubmit={login}><small>INGRESAR</small><h2>Abrí FacturaLlena</h2><label>Email o usuario<input value={identifier} onChange={e=>setIdentifier(e.target.value)} autoCapitalize="none" autoComplete="username"/></label><label>Contraseña<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/></label>{error&&<div className={styles.error}>{error}</div>}<button type="submit" disabled={loginBusy}>{loginBusy?'Ingresando…':'Ingresar'}</button><p>Usá la misma cuenta de Comercio Llena.</p></form>
    </section>
    <section className={styles.human}><img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=85" alt="Persona usando su celular para trabajar"/><div><span>HECHA PARA UNA MANO</span><h2>Cliente. Concepto. Importe. Facturar.</h2><p>La acción principal siempre queda abajo, cerca del pulgar.</p></div></section>
    <section className={styles.plans}><span>PLANES EN PESOS ARGENTINOS</span><h2>Simple también para pagar.</h2><div><article><small>INICIO</small><strong>$0</strong><p>20 comprobantes por mes.</p></article><article><small>EMPRENDEDOR</small><strong>$8.900</strong><p>200 comprobantes por mes.</p></article><article><small>NEGOCIO</small><strong>$14.900</strong><p>1.000 comprobantes por mes.</p></article></div></section>
    <footer className={styles.publicFooter}><b>FacturaLlena</b><span>Un producto de Llena Group</span><Link href="/">Comercio Llena</Link></footer>
  </main>

  return <main className={styles.appPage}>
    <header className={styles.appHeader}><button className={styles.iconButton} onClick={()=>void loadFiscal()} aria-label="Actualizar">↻</button><div className={styles.appWordmark}>FacturaLlena</div><button className={styles.iconButton} onClick={install} aria-label="Instalar">↓</button></header>
    <section className={styles.statusBar}><span className={fiscal?.configured?styles.okDot:styles.warnDot}/><b>{statusBusy?'Consultando ARCA…':fiscal?.configured?`ARCA ${fiscal.environment==='produccion'?'Producción':'Homologación'}`:'ARCA pendiente'}</b><small>{session.companyName}</small></section>

    {!invoice?<section className={styles.invoiceForm}>
      <div className={styles.formIntro}><span>NUEVA FACTURA C</span><h1>¿Qué facturamos?</h1></div>
      <label>Cliente<input value={client} onChange={e=>setClient(e.target.value)} placeholder="Consumidor final"/></label>
      <label>Concepto<input value={concept} onChange={e=>setConcept(e.target.value)} placeholder="Ej: Productos varios"/></label>
      <div className={styles.chips}><button type="button" className={styles.activeChip}>Factura C</button><button type="button">Consumidor final</button></div>
      <label className={styles.amount}>Importe<div><span>$</span><input inputMode="numeric" value={amount} onChange={e=>setAmount(digits(e.target.value))} placeholder="0"/></div></label>
      {error&&<div className={styles.error}>{error}</div>}
      {!fiscal?.configured&&<div className={styles.setupNote}><b>Esta cuenta todavía no figura conectada.</b><span>La configuración fiscal se hace una sola vez desde la versión web de Comercio Llena.</span><Link href="/redesign">Abrir configuración web</Link></div>}
      <div className={styles.thumbAction}><div><small>TOTAL</small><strong>{money.format(total)}</strong></div><button disabled={emitBusy||!fiscal?.configured||total<=0} onClick={()=>void emit()}>{emitBusy?'Consultando ARCA…':'Emitir factura'}</button></div>
    </section>:<section className={styles.success}>
      <div className={styles.check}>✓</div><span>FACTURA AUTORIZADA</span><h1>{money.format(invoice.amount)}</h1><p>{client}<br/>{concept||'Comprobante electrónico'}</p>
      <div className={styles.fiscalCard}><div><small>COMPROBANTE</small><b>{String(invoice.receipt_number).padStart(8,'0')}</b></div><div><small>CAE</small><b>{invoice.cae}</b></div><div><small>VENCIMIENTO</small><b>{invoice.cae_expiration}</b></div></div>
      <button className={styles.whatsapp} onClick={whatsapp}>Enviar por WhatsApp</button><button className={styles.mail} onClick={email}>Enviar por mail</button><button className={styles.share} onClick={()=>void nativeShare()}>Compartir con otra app</button><button className={styles.again} onClick={()=>{setInvoice(null);setAmount('');setConcept('');setError('')}}>Hacer otra factura</button>
    </section>}
    <nav className={styles.bottomNav}><button className={styles.navActive}>Inicio</button><button className={styles.plus} onClick={()=>{setInvoice(null);setAmount('');setConcept('');setError('')}}>+</button><button onClick={()=>alert('Historial: próxima iteración.')}>Facturas</button></nav>
  </main>
}
