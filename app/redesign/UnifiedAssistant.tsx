'use client'

import { FormEvent, useState } from 'react'
import styles from './assistant.module.css'

const quick = [
  '¿Cómo vienen las ventas hoy?',
  '¿Cuál fue el producto más vendido en los últimos 30 días?',
  '¿Qué productos tienen stock bajo?',
  '¿Cómo agrego o edito un producto?',
]

type Message = { role: 'user' | 'assistant'; content: string }

export default function UnifiedAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role:'assistant', content:'Hola. Soy el Asistente IA de Comercio Lleno. Puedo consultar datos de tu comercio y también explicarte cómo usar el sistema.' },
  ])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  async function ask(question: string) {
    const q = question.trim()
    if (!q || busy) return
    const previous = messages
    setMessages(m => [...m, { role:'user', content:q }])
    setText('')
    setBusy(true)
    try {
      const token = localStorage.getItem('cl_access_token') || ''
      const r = await fetch('/api/redesign/assistant', {
        method:'POST',
        headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' },
        body:JSON.stringify({ message:q, history:previous.slice(-8) }),
        cache:'no-store',
      })
      const data = await r.json().catch(()=>({}))
      if(!r.ok || !data?.answer) throw new Error(data?.error || 'No pude consultar el asistente en este momento.')
      setMessages(m => [...m, { role:'assistant', content:String(data.answer) }])
    } catch (e) {
      setMessages(m => [...m, { role:'assistant', content:`No pude responder con IA ahora: ${e instanceof Error ? e.message : String(e)}. Podés usar Ayuda humana si necesitás resolverlo ya.` }])
    } finally { setBusy(false) }
  }

  function submit(e: FormEvent) { e.preventDefault(); void ask(text) }

  return <>
    <div className={styles.head}><div><span>SOPORTE INTELIGENTE</span><h1>Asistente IA</h1><p>Consulta datos reales del comercio y conoce el funcionamiento de Comercio Lleno.</p></div><div className={styles.aiBadge}>✦ IA · solo lectura</div></div>
    <div className={styles.layout}>
      <section className={styles.chatCard}>
        <div className={styles.chatTitle}><div className={styles.avatar}>✦</div><div><b>Asistente Comercio Lleno</b><small>Datos del tenant actual · permisos por usuario</small></div></div>
        <div className={styles.messages}>{messages.map((m,i)=><div key={i} className={m.role==='user'?styles.user:styles.bot}>{m.content}</div>)}{busy&&<div className={styles.thinking}><i/><i/><i/></div>}</div>
        <div className={styles.quick}>{quick.map(q=><button key={q} disabled={busy} onClick={()=>void ask(q)}>{q}</button>)}</div>
        <form className={styles.form} onSubmit={submit}><input value={text} onChange={e=>setText(e.target.value)} placeholder="Ej: ¿Cuánto vendí el martes? ¿Cómo cambio el precio de un producto?" autoComplete="off"/><button disabled={busy||!text.trim()}>{busy?'Consultando…':'Enviar'}</button></form>
      </section>
      <aside className={styles.side}>
        <div className={styles.info}><span>¿QUÉ PUEDE HACER?</span><h3>Negocio + sistema</h3><p>Puede analizar ventas, buscar productos y stock, consultar fechas y explicarte dónde está cada función y cómo usarla.</p><div className={styles.cap}><b>Ventas</b><small>Totales, fechas, medios de pago y más vendidos.</small></div><div className={styles.cap}><b>Productos</b><small>Precio, stock, código, categoría y alertas.</small></div><div className={styles.cap}><b>Ayuda de uso</b><small>Caja, productos, configuración, usuarios, reportes y demás módulos.</small></div></div>
        <div className={styles.human}><span>SOPORTE</span><h3>¿Necesitás una persona?</h3><p>Mandanos el problema directamente por WhatsApp.</p><a href="https://wa.me/5491159609135?text=Hola%2C%20necesito%20ayuda%20con%20Comercio%20Lleno" target="_blank" rel="noreferrer">Ayuda humana</a><small>Se abre WhatsApp en una conversación directa.</small></div>
      </aside>
    </div>
  </>
}
