'use client'

import { useCallback,useEffect,useState,type ComponentProps } from 'react'
import SalesEnhanced from './SalesEnhanced'
import { deleteQuote,listQuotes,printQuote,quoteLabel,type Quote } from '@/lib/comercio/quotes'
import type { DeviceSettings } from '@/lib/comercio/types'

const DEVICE:DeviceSettings={paper:'58',autoPrint:false,printerMode:'browser',printerName:'',receiptCopies:1}
type Props=ComponentProps<typeof SalesEnhanced>

export default function SalesWithQuotes(props:Props){
  const[quotes,setQuotes]=useState<Quote[]>([])
  const[loading,setLoading]=useState(true)
  const[schemaPending,setSchemaPending]=useState(false)
  const[selected,setSelected]=useState<Quote|null>(null)
  const[error,setError]=useState('')

  const load=useCallback(async()=>{
    try{const rows=await listQuotes(props.session);setQuotes(rows);setSchemaPending(false)}
    catch(err){if((err as Error&{previewSchemaPending?:boolean})?.previewSchemaPending)setSchemaPending(true);else setError(err instanceof Error?err.message:String(err))}
    finally{setLoading(false)}
  },[props.session])

  useEffect(()=>{void load();const changed=()=>void load();window.addEventListener('comercio:quotes-changed',changed);return()=>window.removeEventListener('comercio:quotes-changed',changed)},[load])

  async function remove(quote:Quote){if(!window.confirm(`¿Eliminar el presupuesto ${quoteLabel(quote)}? No hay stock ni caja para restaurar porque nunca fue una venta.`))return;try{await deleteQuote(props.session,quote.id);setSelected(null);await load();props.onMessage('Presupuesto eliminado. Ningún movimiento de stock o caja fue modificado.')}catch(err){props.onMessage(err instanceof Error?err.message:String(err))}}
  async function print(quote:Quote){try{await printQuote(quote,props.data.company,DEVICE)}catch(err){props.onMessage(err instanceof Error?err.message:String(err))}}

  return <>
    <section style={{marginBottom:14,border:'1px solid #edc5c1',borderRadius:18,background:'#fffafa',overflow:'hidden'}}>
      <div style={{padding:'14px 16px',display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',borderBottom:quotes.length||schemaPending?'1px solid #f2ddda':'0',flexWrap:'wrap'}}><div><div style={{fontSize:10,fontWeight:950,letterSpacing:1.2,color:'#a5423b'}}>PRESUPUESTOS · NO FISCALES</div><b style={{fontSize:16}}>Documentos que no afectan ventas, stock, caja ni ARCA</b></div><span style={{padding:'7px 10px',borderRadius:999,background:'#f8dedb',color:'#9b3b35',fontSize:11,fontWeight:950}}>{loading?'…':`${quotes.length} presupuesto${quotes.length===1?'':'s'}`}</span></div>
      {schemaPending&&<div style={{padding:'11px 16px',fontSize:11,lineHeight:1.5,color:'#84514d'}}>La interfaz de Presupuestos ya está incluida en esta preview. La tabla nueva de datos quedó como migración pendiente y no se aplica al entorno real hasta aprobar el release.</div>}
      {!schemaPending&&quotes.slice(0,8).map(quote=><button type="button" key={quote.id} onClick={()=>setSelected(quote)} style={{width:'100%',border:0,borderTop:'1px solid #f4e4e2',background:'#fff',padding:'11px 16px',display:'grid',gridTemplateColumns:'minmax(115px,.8fr) minmax(120px,1fr) minmax(120px,.8fr) auto',gap:10,alignItems:'center',textAlign:'left',cursor:'pointer'}}><span><b style={{color:'#a5423b'}}>PRESUPUESTO</b><small style={{display:'block',marginTop:3}}>{quoteLabel(quote)}</small></span><span><b>{new Date(quote.created_at).toLocaleDateString('es-AR')}</b><small style={{display:'block',marginTop:3}}>{new Date(quote.created_at).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}</small></span><span><b>{props.data.customers.find(c=>c.id===quote.customer_id)?.name||'Sin cliente asociado'}</b></span><strong style={{fontSize:15}}>{new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS'}).format(quote.total)}</strong></button>)}
      {!schemaPending&&!loading&&!quotes.length&&<div style={{padding:'12px 16px',fontSize:11,color:'#7d6a67'}}>Todavía no hay presupuestos guardados.</div>}
      {error&&<div style={{padding:'10px 16px',fontSize:11,color:'#9b3b35'}}>{error}</div>}
    </section>

    <SalesEnhanced {...props}/>

    {selected&&<div style={{position:'fixed',inset:0,zIndex:10200,background:'rgba(42,20,18,.58)',display:'grid',placeItems:'center',padding:18}} onMouseDown={event=>event.target===event.currentTarget&&setSelected(null)}><section style={{width:'min(640px,96vw)',maxHeight:'90vh',overflow:'auto',background:'#fff',borderRadius:22,border:'1px solid #edc5c1',boxShadow:'0 28px 80px rgba(0,0,0,.28)'}}><div style={{padding:20,borderBottom:'1px solid #f0dfdc',display:'flex',justifyContent:'space-between',gap:12}}><div><div style={{fontSize:10,fontWeight:950,letterSpacing:1.3,color:'#a5423b'}}>PRESUPUESTO · SIN VALIDEZ FISCAL</div><h3 style={{margin:'5px 0 3px',fontSize:22}}>{quoteLabel(selected)}</h3><p style={{margin:0,fontSize:12,color:'#68726d'}}>{new Date(selected.created_at).toLocaleString('es-AR')}</p></div><button type="button" onClick={()=>setSelected(null)} style={{width:38,height:38,borderRadius:11,border:'1px solid #e6d6d3',background:'#fff',fontSize:20,cursor:'pointer'}}>×</button></div><div style={{padding:20,display:'grid',gap:14}}><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:10}}><div style={{padding:12,borderRadius:13,background:'#fff5f4'}}><small>Total</small><b style={{display:'block',fontSize:20,marginTop:4}}>{new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS'}).format(selected.total)}</b></div><div style={{padding:12,borderRadius:13,background:'#f8faf9'}}><small>Estado</small><b style={{display:'block',marginTop:4}}>Presupuesto</b></div><div style={{padding:12,borderRadius:13,background:'#f8faf9'}}><small>Validez</small><b style={{display:'block',marginTop:4}}>{selected.valid_until?new Date(`${selected.valid_until}T12:00:00`).toLocaleDateString('es-AR'):'Sin vencimiento'}</b></div></div><div>{selected.items.map((item,index)=><div key={`${item.product_id||item.name}-${index}`} style={{display:'grid',gridTemplateColumns:'1fr auto auto',gap:12,padding:'9px 0',borderBottom:'1px solid #eef1ef',fontSize:12}}><span><b>{item.name}</b><small style={{display:'block'}}>{item.qty} × {new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS'}).format(item.unit_price)}</small></span><span>{item.qty}</span><b>{new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS'}).format(item.line_total)}</b></div>)}</div><div style={{padding:12,borderRadius:12,background:'#fff1ef',color:'#87433e',fontSize:11,lineHeight:1.5}}><b>No es una venta.</b> Este documento no descuenta stock, no suma facturación, no modifica la caja y nunca se envía a ARCA.</div><div style={{display:'flex',gap:9,flexWrap:'wrap'}}><button type="button" onClick={()=>void print(selected)} style={{height:42,border:0,borderRadius:11,background:'#aa4941',color:'#fff',fontWeight:900,padding:'0 16px',cursor:'pointer'}}>Imprimir presupuesto</button><button type="button" onClick={()=>void remove(selected)} style={{height:42,border:'1px solid #e2bbb7',borderRadius:11,background:'#fff',color:'#9a3e38',fontWeight:900,padding:'0 16px',cursor:'pointer'}}>Eliminar</button></div></div></section></div>}
  </>
}
