'use client'

import { useEffect,useState } from 'react'
import Link from 'next/link'
import { readTenantSession } from '@/lib/comercio/session'
import type { TenantSession } from '@/lib/comercio/types'
import { buildFacturaCPdf,type FiscalPdfIssuer } from '@/lib/factura-llena/pdf'
import styles from '../factura-llena.module.css'

const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL??'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const money=new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0})

type HistoryItem={id:string;amount:number;receipt_number:number;cae:string;cae_expiration:string;date:string;created_at:string}
type Fiscal={configured:boolean;point_of_sale?:number|null;environment?:string;tax_id?:string|null}
type ReceiptSettings=Record<string,unknown>&{receiptAddress?:string;fiscalVatCondition?:string;grossIncome?:string;activityStartDate?:string}

export default function FacturasHistory(){
  const[session,setSession]=useState<TenantSession|null>(null),[items,setItems]=useState<HistoryItem[]>([]),[issuer,setIssuer]=useState<FiscalPdfIssuer|null>(null),[fiscal,setFiscal]=useState<Fiscal|null>(null),[busy,setBusy]=useState(true),[sharing,setSharing]=useState(''),[error,setError]=useState('')
  useEffect(()=>{const s=readTenantSession();if(!s){window.location.replace('/factura-llena');return}setSession(s);void load(s)},[])

  async function load(s:TenantSession){setBusy(true);setError('');try{
    const headers={apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${s.token}`}
    const[hr,cr,sr]=await Promise.all([
      fetch(`${SUPABASE_URL}/functions/v1/factura-llena-history`,{headers,cache:'no-store'}),
      fetch(`${SUPABASE_URL}/rest/v1/companies?id=eq.${encodeURIComponent(s.companyId)}&select=name,legal_name,tax_id,address,receipt_settings&limit=1`,{headers,cache:'no-store'}),
      fetch(`${SUPABASE_URL}/functions/v1/arca-setup`,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({action:'status'}),cache:'no-store'}),
    ])
    const hd=await hr.json().catch(()=>({})),ca=await cr.json().catch(()=>[]),sd=await sr.json().catch(()=>({}));
    if(!hr.ok||!hd?.ok)throw new Error(hd?.error||'No se pudo cargar el historial.');if(!cr.ok||!ca?.[0])throw new Error('No se pudieron cargar los datos del emisor.');if(!sr.ok||sd?.ok===false)throw new Error(sd?.error||'No se pudo consultar ARCA.');
    const c=ca[0],rs=(c.receipt_settings||{}) as ReceiptSettings
    setItems(hd.items||[]);setFiscal(sd);setIssuer({name:String(c.name||s.companyName),legalName:String(c.legal_name||c.name||s.companyName),taxId:String(c.tax_id||sd.tax_id||''),address:String(rs.receiptAddress||c.address||''),vatCondition:String(rs.fiscalVatCondition||'Responsable Monotributo'),grossIncome:String(rs.grossIncome||''),activityStart:String(rs.activityStartDate||'')})
  }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}

  async function share(item:HistoryItem){if(!issuer||!fiscal?.point_of_sale)return;const complete=issuer.legalName&&issuer.taxId&&issuer.address&&issuer.grossIncome&&issuer.activityStart;if(!complete){setError('Faltan datos fiscales del PDF. Volvé a Inicio y completalos una sola vez.');return}setSharing(item.id);setError('');try{const blob=await buildFacturaCPdf(issuer,{pointOfSale:fiscal.point_of_sale,receiptNumber:item.receipt_number,cae:item.cae,caeExpiration:item.cae_expiration,date:item.date,amount:item.amount,client:'Consumidor Final',concept:'Comprobante electrónico'});const file=new File([blob],`Factura-C-${String(fiscal.point_of_sale).padStart(5,'0')}-${String(item.receipt_number).padStart(8,'0')}.pdf`,{type:'application/pdf'});if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){await navigator.share({title:'Factura C',text:`Factura C ${String(fiscal.point_of_sale).padStart(5,'0')}-${String(item.receipt_number).padStart(8,'0')} · ${money.format(item.amount)}`,files:[file]});return}const url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}catch(e){if(!(e instanceof DOMException&&e.name==='AbortError'))setError(e instanceof Error?e.message:String(e))}finally{setSharing('')}}

  return <main className={styles.appPage}>
    <header className={styles.appHeader}><Link href="/factura-llena" className={styles.iconButton} aria-label="Volver">←</Link><div className={styles.appWordmark}>FacturaLlena</div><button className={styles.iconButton} onClick={()=>session&&void load(session)} aria-label="Actualizar">↻</button></header>
    <section className={styles.statusBar}><span className={fiscal?.configured?styles.okDot:styles.warnDot}/><b>Facturas emitidas</b><small>{session?.companyName||''}</small></section>
    <section className={styles.invoiceForm} style={{paddingBottom:110}}><div className={styles.formIntro}><span>HISTORIAL REAL</span><h1>Comprobantes.</h1></div>{error&&<div className={styles.error}>{error}</div>}{busy?<div className={styles.setupNote}><b>Cargando facturas…</b></div>:items.length===0?<div className={styles.setupNote}><b>Todavía no hay comprobantes autorizados.</b></div>:<div style={{display:'grid',gap:10}}>{items.map(item=><article key={item.id} style={{background:'#121216',border:'1px solid #28282f',borderRadius:18,padding:16,display:'grid',gridTemplateColumns:'1fr auto',gap:12,alignItems:'center'}}><div><small style={{color:'#777783',fontWeight:800}}>FACTURA C · {new Date(item.created_at).toLocaleDateString('es-AR')}</small><b style={{display:'block',fontSize:18,marginTop:6}}>{String(fiscal?.point_of_sale||0).padStart(5,'0')}-{String(item.receipt_number).padStart(8,'0')}</b><span style={{display:'block',fontSize:24,fontWeight:900,marginTop:8}}>{money.format(item.amount)}</span><small style={{display:'block',color:'#777783',marginTop:5}}>CAE {item.cae}</small></div><button className={styles.share} style={{width:'auto',padding:'0 14px'}} disabled={sharing===item.id} onClick={()=>void share(item)}>{sharing===item.id?'PDF…':'Compartir'}</button></article>)}</div>}</section>
    <nav className={styles.bottomNav}><Link href="/factura-llena">Inicio</Link><Link className={styles.plus} href="/factura-llena">+</Link><button className={styles.navActive}>Facturas</button></nav>
  </main>
}
