'use client'

import { FormEvent,useEffect,useState } from 'react'
import styles from './assistant.module.css'
import { loadOwnerContact } from '@/lib/comercio/cash-api'
import { readTenantSession } from '@/lib/comercio/session'
import HumanSupportChat from './HumanSupportChat'

const quick=['¿Cómo vienen las ventas hoy?','¿Cuál fue el producto más vendido en los últimos 30 días?','¿Qué productos tienen stock bajo?','¿Qué puedo hacer con IA?','¿Cómo agrego o edito un producto?']
const PRIORITY_CACHE_MS=10*60*1000
type Message={role:'user'|'assistant';content:string}
type PriorityItem={id?:string;name:string;stock?:number;sold?:number}
type PriorityCache={at:number;products:PriorityItem[]}

export default function UnifiedAssistant(){
  const[messages,setMessages]=useState<Message[]>([{role:'assistant',content:'Hola. Soy el Asistente IA de Comercio Lleno. Puedo consultar datos reales de tu comercio y explicarte cómo usar el sistema.'}])
  const[text,setText]=useState(''),[busy,setBusy]=useState(false),[priority,setPriority]=useState<PriorityItem[]>([]),[priorityBusy,setPriorityBusy]=useState(true),[priorityError,setPriorityError]=useState(''),[ownerPhone,setOwnerPhone]=useState<string|null>(null)
  async function request(body:Record<string,unknown>){const token=localStorage.getItem('cl_access_token')||'';if(!token)throw new Error('Iniciá sesión nuevamente para usar la IA.');const r=await fetch('/api/redesign/assistant',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store'});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data?.error||'No pude consultar el asistente en este momento.');return data}
  useEffect(()=>{
    let cancelled=false
    const s=readTenantSession()
    const cacheKey=s?`cl_ai_priority_${s.companyId}`:''
    let cached:PriorityCache|null=null
    if(cacheKey){try{cached=JSON.parse(sessionStorage.getItem(cacheKey)||'null') as PriorityCache|null}catch{}}
    if(cached&&Date.now()-Number(cached.at||0)<PRIORITY_CACHE_MS&&Array.isArray(cached.products)){
      setPriority(cached.products);setPriorityBusy(false)
    }else{
      request({action:'priority_order'}).then(data=>{
        if(cancelled)return
        const products=Array.isArray(data?.products)?data.products:[]
        setPriority(products)
        if(cacheKey)try{sessionStorage.setItem(cacheKey,JSON.stringify({at:Date.now(),products}))}catch{}
      }).catch(e=>{if(!cancelled)setPriorityError(e instanceof Error?e.message:String(e))}).finally(()=>{if(!cancelled)setPriorityBusy(false)})
    }
    if(s)loadOwnerContact(s).then(x=>{if(!cancelled)setOwnerPhone(x.owner_phone||null)}).catch(()=>{})
    return()=>{cancelled=true}
  },[])
  async function ask(question:string){const q=question.trim();if(!q||busy)return;const previous=messages;setMessages(m=>[...m,{role:'user',content:q}]);setText('');setBusy(true);try{const data=await request({message:q,history:previous.slice(-8)});setMessages(m=>[...m,{role:'assistant',content:String(data.answer)}])}catch(e){setMessages(m=>[...m,{role:'assistant',content:e instanceof Error?e.message:'No pude responder en este momento.'}])}finally{setBusy(false)}}
  function submit(e:FormEvent){e.preventDefault();void ask(text)}
  function orderText(){return priority.slice(0,10).map((p,i)=>`${i+1}. ${p.name}`).join('\n')}
  function downloadOrder(){if(!priority.length)return;const blob=new Blob([`Pedido IA+ · Comercio Lleno\nGenerado: ${new Date().toLocaleString('es-AR')}\n\n${orderText()}\n`],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`pedido-ia-plus-${new Date().toISOString().slice(0,10)}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
  function shareOrder(){if(!priority.length)return;const digits=String(ownerPhone||'').replace(/\D/g,'');if(!digits){setPriorityError('Cargá el WhatsApp del propietario en Configuración para poder reenviar el pedido.');return}const msg=`Te envío este pedido generado con IA+ de los productos que estamos necesitando reponer.\n\n${orderText()}`;window.open(`https://wa.me/${digits}?text=${encodeURIComponent(msg)}`,'_blank','noopener,noreferrer')}
  return <><div className={styles.head}><div><span>SOPORTE INTELIGENTE</span><h1>Asistente IA</h1><p>Consulta datos reales del comercio y conoce el funcionamiento de Comercio Lleno.</p></div><div className={styles.aiBadge}>✦ IA · acceso protegido</div></div><div className={styles.layout}><section className={styles.chatCard}><div className={styles.chatTitle}><div className={styles.avatar}>✦</div><div><b>Asistente Comercio Lleno</b><small>Sólo usuarios autenticados · datos del tenant actual</small></div></div><div className={styles.messages}>{messages.map((m,i)=><div key={i} className={m.role==='user'?styles.user:styles.bot}>{m.content}</div>)}{busy&&<div className={styles.thinking}><i/><i/><i/></div>}</div><div className={styles.quick}>{quick.map(q=><button key={q} disabled={busy} onClick={()=>void ask(q)}>{q}</button>)}</div><form className={styles.form} onSubmit={submit}><input value={text} onChange={e=>setText(e.target.value)} placeholder="Ej: ¿Cuánto facturé los últimos 30 días?" autoComplete="off"/><button disabled={busy||!text.trim()}>{busy?'Consultando…':'Enviar'}</button></form></section><aside className={styles.side}><div className={styles.aiOrder}><div className={styles.aiOrderHead}><div className={styles.aiOrderSpark}>✦</div><div><span>REPOSICIÓN INTELIGENTE</span><h3>Pedido IA+</h3></div></div><p>Prioridad sugerida según demanda de los últimos 30 días y el stock actual. Pensada como lista rápida para salir a comprar.</p><div className={styles.aiOrderMeta}>✦ Demanda + stock bajo · hasta 10 prioridades</div><div className={styles.aiOrderList}>{priorityBusy?<div className={styles.aiOrderState}>Analizando tu comercio…</div>:priorityError&&!priority.length?<div className={styles.aiOrderState}>{priorityError}</div>:priority.length?priority.map((p,i)=><div className={styles.aiOrderRow} key={p.id||`${p.name}-${i}`}><b>{i+1}</b><span>{p.name}</span></div>):<div className={styles.aiOrderState}>Todavía no hay suficiente historial para sugerir un pedido.</div>}</div>{priority.length>0&&<div style={{display:'flex',gap:7,alignItems:'center',marginTop:10}}><button onClick={downloadOrder} style={{flex:1,border:'1px solid #d8e2dd',background:'#fff',borderRadius:9,padding:'8px 10px',fontSize:9,fontWeight:900,cursor:'pointer'}}>↓ Descargar</button><button onClick={shareOrder} title="Reenviar al WhatsApp del propietario" aria-label="Reenviar pedido por WhatsApp" style={{width:34,height:34,border:'1px solid #bfe0cc',background:'#edf9f2',color:'#147449',borderRadius:'50%',fontWeight:950,cursor:'pointer'}}>◉</button></div>}{priorityError&&priority.length>0&&<small style={{display:'block',color:'#a24a4a',fontSize:8,marginTop:6}}>{priorityError}</small>}</div><HumanSupportChat/></aside></div></>
}
