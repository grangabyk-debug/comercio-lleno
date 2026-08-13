'use client'

import { FormEvent,useEffect,useRef,useState } from 'react'
import { readTenantSession } from '@/lib/comercio/session'
import { closeSupportConversation,loadSupportState,sendSupportMessage,type SupportState } from '@/lib/comercio/support-api'
import styles from './HumanSupportChat.module.css'

const EMPTY_STATE:SupportState={conversation:null,messages:[]}

function roleLabel(role:string){return role==='owner'?'Propietario':role==='manager'?'Encargado':role==='cashier'?'Cajero':role==='seller'?'Vendedor':role==='supervisor'?'Supervisor':role||'Usuario'}
function timeLabel(value:string){return new Date(value).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}

export default function HumanSupportChat(){
  const[tenant]=useState(()=>readTenantSession())
  const[open,setOpen]=useState(false)
  const[state,setState]=useState<SupportState>(EMPTY_STATE)
  const[draft,setDraft]=useState('')
  const[loading,setLoading]=useState(false)
  const[sending,setSending]=useState(false)
  const[error,setError]=useState('')
  const refreshing=useRef(false)
  const endRef=useRef<HTMLDivElement|null>(null)

  async function refresh(showLoading=false){
    if(refreshing.current)return
    refreshing.current=true
    if(showLoading)setLoading(true)
    try{setState(await loadSupportState());setError('')}
    catch(value){setError(value instanceof Error?value.message:'No se pudo cargar soporte.')}
    finally{refreshing.current=false;if(showLoading)setLoading(false)}
  }

  useEffect(()=>{
    if(!open)return
    void refresh(true)
    const timer=window.setInterval(()=>void refresh(false),2500)
    return()=>window.clearInterval(timer)
  },[open])

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth',block:'end'})},[state.messages.length,open])

  async function send(event:FormEvent){
    event.preventDefault()
    const content=draft.trim()
    if(!content||sending)return
    setSending(true);setError('')
    try{setState(await sendSupportMessage(content));setDraft('')}
    catch(value){setError(value instanceof Error?value.message:'No se pudo enviar el mensaje.')}
    finally{setSending(false)}
  }

  async function closeConversation(){
    if(!state.conversation||sending)return
    setSending(true);setError('')
    try{setState(await closeSupportConversation())}
    catch(value){setError(value instanceof Error?value.message:'No se pudo cerrar la conversación.')}
    finally{setSending(false)}
  }

  const status=!state.conversation?'Nuevo chat':state.conversation.status==='pending'?'Esperando respuesta':state.conversation.status==='in_progress'?'Soporte conectado':'Finalizado'
  const statusKind=!state.conversation?'new':state.conversation.status

  return <div className={styles.card}>
    <div className={styles.top}><span>SOPORTE HUMANO</span><span className={styles.liveFlag}>EN LÍNEA</span></div>
    <h3>¿Necesitás una persona?</h3>
    <p>Escribinos sin salir del sistema. El mensaje llega directamente a la bandeja de Central Llena.</p>
    {!open?<><button className={styles.launch} type="button" onClick={()=>setOpen(true)}>Ayuda humana</button><small>Conserva el comercio, usuario y conversación.</small></>:<div className={styles.chat}>
      <div className={styles.context}><div><b>{tenant?.companyName||'Tu comercio'}</b><small>{roleLabel(tenant?.role||'owner')} · Asistente IA</small></div><span data-stage={statusKind}>{status}</span></div>
      <div className={styles.messages} aria-live="polite" aria-busy={loading}>
        {loading&&!state.messages.length?<div className={styles.system}>Conectando con Central Llena…</div>:null}
        {!loading&&!state.messages.length?<div className={styles.system}>Hola. Contanos qué pasó y una persona de Central Llena te responde por acá.</div>:null}
        {state.messages.map(message=><div key={message.id} className={message.from==='customer'?styles.user:message.from==='agent'?styles.agent:styles.system}>
          {message.from==='agent'?<b>{message.senderName||'Central Llena'}</b>:null}
          <p>{message.content}</p><time>{timeLabel(message.createdAt)}</time>
        </div>)}
        <div ref={endRef}/>
      </div>
      {error?<div className={styles.error} role="alert">{error}</div>:null}
      <form className={styles.form} onSubmit={send}><textarea aria-label="Mensaje para soporte" rows={2} maxLength={2000} autoComplete="off" value={draft} onChange={event=>setDraft(event.target.value)} placeholder="Escribí qué necesitás…"/><button type="submit" disabled={sending||!draft.trim()}>{sending?'Enviando…':'Enviar'}</button></form>
      <div className={styles.actions}>{state.conversation&&state.conversation.status!=='resolved'?<button type="button" className={styles.secondary} onClick={()=>void closeConversation()} disabled={sending}>Finalizar conversación</button>:null}<button type="button" className={styles.secondary} onClick={()=>setOpen(false)}>Cerrar ventana</button></div>
    </div>}
  </div>
}
