'use client'

import { useEffect,useState } from 'react'
import Link from 'next/link'
import { readTenantSession } from '@/lib/comercio/session'
import type { TenantSession } from '@/lib/comercio/types'
import styles from '../app-ui.module.css'

const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL??'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const money=new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0})
type Item={id:string;amount:number;receipt_number:number;cae:string;cae_expiration:string;date:string;created_at:string}
type Fiscal={configured:boolean;point_of_sale?:number|null}

export default function FacturasHistoryMobile(){
 const[session,setSession]=useState<TenantSession|null>(null),[items,setItems]=useState<Item[]>([]),[fiscal,setFiscal]=useState<Fiscal|null>(null),[busy,setBusy]=useState(true),[error,setError]=useState('')
 useEffect(()=>{const s=readTenantSession();if(!s){window.location.replace('/factura-llena');return}setSession(s);void load(s)},[])
 async function load(s:TenantSession){setBusy(true);setError('');try{const headers={apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${s.token}`};const[hr,sr]=await Promise.all([fetch(`${SUPABASE_URL}/functions/v1/factura-llena-history`,{headers,cache:'no-store'}),fetch(`${SUPABASE_URL}/functions/v1/arca-setup`,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({action:'status'}),cache:'no-store'})]);const hd=await hr.json().catch(()=>({})),sd=await sr.json().catch(()=>({}));if(!hr.ok||!hd?.ok)throw new Error(hd?.error||'No se pudo cargar el historial.');setItems(hd.items||[]);setFiscal(sd)}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
 function share(item:Item){const text=`Factura C ${String(fiscal?.point_of_sale||0).padStart(5,'0')}-${String(item.receipt_number).padStart(8,'0')}\nTotal: ${money.format(item.amount)}\nCAE: ${item.cae}`;if(navigator.share){navigator.share({title:'Factura C',text}).catch(()=>{});return}window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,'_blank')}
 return <main className={styles.appPage}><header className={styles.appHeader}><Link href="/factura-llena" className={styles.iconButton}>←</Link><div className={styles.appWordmark}>FacturaLlena</div><button className={styles.iconButton} onClick={()=>session&&void load(session)}>↻</button></header><section className={styles.statusBar}><span className={fiscal?.configured?styles.okDot:styles.warnDot}/><b>Facturas emitidas</b><small>{session?.companyName||''}</small></section><section className={styles.invoiceForm}><div className={styles.formIntro}><span>HISTORIAL REAL</span><h1>Comprobantes.</h1></div>{error&&<div className={styles.error}>{error}</div>}{busy?<div className={styles.setupNote}><b>Cargando facturas…</b></div>:items.length===0?<div className={styles.setupNote}><b>Todavía no hay comprobantes.</b></div>:<div style={{display:'grid',gap:12}}>{items.map(item=><article key={item.id} style={{background:'#15151a',border:'1px solid #292930',borderRadius:20,padding:18,display:'grid',gridTemplateColumns:'1fr auto',gap:14,alignItems:'center'}}><div><small style={{color:'#84848e',fontWeight:900}}>FACTURA C · {new Date(item.created_at).toLocaleDateString('es-AR')}</small><b style={{display:'block',fontSize:18,marginTop:7}}>{String(fiscal?.point_of_sale||0).padStart(5,'0')}-{String(item.receipt_number).padStart(8,'0')}</b><strong style={{display:'block',fontSize:28,marginTop:9}}>{money.format(item.amount)}</strong><small style={{display:'block',color:'#84848e',marginTop:7}}>CAE {item.cae}</small></div><button className={styles.share} style={{width:'auto',padding:'12px 14px',borderRadius:12}} onClick={()=>share(item)}>Compartir</button></article>)}</div>}</section><nav className={styles.bottomNav}><Link href="/factura-llena">Inicio</Link><Link className={styles.plus} href="/factura-llena">+</Link><button className={styles.navActive}>Facturas</button></nav></main>
}
