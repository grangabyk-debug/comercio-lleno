'use client'

import { FormEvent, useEffect, useState } from 'react'
import styles from './assistant.module.css'

const quick = [
  '¿Cómo vienen las ventas hoy?',
  '¿Cuál fue el producto más vendido en los últimos 30 días?',
  '¿Qué productos tienen stock bajo?',
  '¿Qué puedo hacer con IA?',
  '¿Cómo agrego o edito un producto?',
]

type Message = { role: 'user' | 'assistant'; content: string }
type PriorityItem = { id?: string; name: string; stock?: number; sold?: number }

export default function UnifiedAssistant() {
  const [messages,setMessages]=useState<Message[]>([{role:'assistant',content:'Hola. Soy el Asistente IA de Comercio Lleno. Puedo consultar datos reales de tu comercio y explicarte cómo usar el sistema.'}])
  const [text,setText]=useState(''),[busy,setBusy]=useState(false),[priority,setPriority]=useState<PriorityItem[]>([]),[priorityBusy,setPriorityBusy]=useState(true),[priorityError,setPriorityError]=useState('')

  async function request(body:Record<string,unknown>){
    const token=localStorage.getItem('cl_access_token')||''
    if(!token)throw new Error('Iniciá sesión nuevamente para usar la IA.')
    const r=await fetch('/api/redesign/assistant',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store'})
    const data=await r.json().catch(()=>({}))
    if(!r.ok)throw new Error(data?.error||'No pude consultar el asistente en este momento.')
    return data
  }

  useEffect(()=>{
    let cancelled=false
    request({action:'priority_order'}).then(data=>{if(!cancelled)setPriority(Array.isArray(data?.products)?data.products:[])}).catch(e=>{if(!cancelled)setPriorityError(e instanceof Error?e.message:String(e))}).finally(()=>{if(!cancelled)setPriorityBusy(false)})
    return()=>{cancelled=true}
  },[])

  async function ask(question:string){
    const q=question.trim();if(!q||busy)return
    const previous=messages
    setMessages(m=>[...m,{role:'user',content:q}]);setText('');setBusy(true)
    try{const data=await request({message:q,history:previous.slice(-8)});setMessages(m=>[...m,{role:'assistant',content:String(data.answer)}])}
    catch(e){setMessages(m=>[...m,{role:'assistant',content:e instanceof Error?e.message:'No pude responder en este momento.'}])}
    finally{setBusy(false)}
  }
  function submit(e:FormEvent){e.preventDefault();void ask(text)}

  return <>
    <div className={styles.head}><div><span>SOPORTE INTELIGENTE</span><h1>Asistente IA</h1><p>Consulta datos reales del comercio y conoce el funcionamiento de Comercio Lleno.</p></div><div className={styles.aiBadge}>✦ IA · acceso protegido</div></div>
    <div className={styles.layout}>
      <section className={styles.chatCard}>
        <div className={styles.chatTitle}><div className={styles.avatar}>✦</div><div><b>Asistente Comercio Lleno</b><small>Sólo usuarios autenticados · datos del tenant actual</small></div></div>
        <div className={styles.messages}>{messages.map((m,i)=><div key={i} className={m.role==='user'?styles.user:styles.bot}>{m.content}</div>)}{busy&&<div className={styles.thinking}><i/><i/><i/></div>}</div>
        <div className={styles.quick}>{quick.map(q=><button key={q} disabled={busy} onClick={()=>void ask(q)}>{q}</button>)}</div>
        <form className={styles.form} onSubmit={submit}><input value={text} onChange={e=>setText(e.target.value)} placeholder="Ej: ¿Cuánto facturé los últimos 30 días?" autoComplete="off"/><button disabled={busy||!text.trim()}>{busy?'Consultando…':'Enviar'}</button></form>
      </section>
      <aside className={styles.side}>
        <div className={styles.aiOrder}>
          <div className={styles.aiOrderHead}><div className={styles.aiOrderSpark}>✦</div><div><span>REPOSICIÓN INTELIGENTE</span><h3>Pedido IA+</h3></div></div>
          <p>Prioridad sugerida según demanda de los últimos 30 días y el stock actual. Pensada como lista rápida para salir a comprar.</p>
          <div className={styles.aiOrderMeta}>✦ Demanda + stock bajo · hasta 10 prioridades</div>
          <div className={styles.aiOrderList}>{priorityBusy?<div className={styles.aiOrderState}>Analizando tu comercio…</div>:priorityError?<div className={styles.aiOrderState}>{priorityError}</div>:priority.length?priority.map((p,i)=><div className={styles.aiOrderRow} key={p.id||`${p.name}-${i}`}><b>{i+1}</b><span>{p.name}</span></div>):<div className={styles.aiOrderState}>Todavía no hay suficiente historial para sugerir un pedido.</div>}</div>
        </div>
        <div className={styles.human}><span>SOPORTE</span><h3>¿Necesitás una persona?</h3><p>Mandanos el problema directamente por WhatsApp.</p><a href="https://wa.me/5491159609135?text=Hola%2C%20necesito%20ayuda%20con%20Comercio%20Lleno" target="_blank" rel="noreferrer">Ayuda humana</a><small>Se abre WhatsApp en una conversación directa.</small></div>
      </aside>
    </div>
  </>
}
