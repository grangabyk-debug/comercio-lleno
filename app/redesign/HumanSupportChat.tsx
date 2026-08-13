'use client'

import { FormEvent,useCallback,useEffect,useRef,useState } from 'react'
import { createPortal } from 'react-dom'
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
  const launchRef=useRef<HTMLButtonElement|null>(null)
  const textareaRef=useRef<HTMLTextAreaElement|null>(null)
  const hideChat=useCallback(()=>{
    setOpen(false)
    window.setTimeout(()=>launchRef.current?.focus(),0)
  },[])

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

  useEffect(()=>{
    if(!open)return
    const previousOverflow=document.body.style.overflow
    const closeOnEscape=(event:KeyboardEvent)=>{if(event.key==='Escape')hideChat()}
    document.body.style.overflow='hidden'
    window.addEventListener('keydown',closeOnEscape)
    const focusTimer=window.setTimeout(()=>textareaRef.current?.focus(),80)
    return()=>{document.body.style.overflow=previousOverflow;window.removeEventListener('keydown',closeOnEscape);window.clearTimeout(focusTimer)}
  },[hideChat,open])

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

  const dialog=<div className={styles.backdrop} onMouseDown={event=>{if(event.target===event.currentTarget)hideChat()}}>
    <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="human-support-title">
      <header className={styles.modalHead}><div><span>AYUDA HUMANA · CENTRAL LLENA</span><h2 id="human-support-title">Hablemos, estamos para ayudarte</h2><p>Escribí tu consulta y una persona te responde directamente por acá.</p></div><button type="button" className={styles.close} onClick={hideChat} aria-label="Cerrar ayuda humana">×</button></header>
      <div className={styles.chat}>
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
        <form className={styles.form} onSubmit={send}><textarea ref={textareaRef} aria-label="Mensaje para soporte" rows={3} maxLength={2000} autoComplete="off" value={draft} onChange={event=>setDraft(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.nativeEvent.isComposing){event.preventDefault();event.currentTarget.form?.requestSubmit()}}} placeholder="Escribí qué necesitás…"/><button type="submit" disabled={sending||!draft.trim()}>{sending?'Enviando…':'Enviar mensaje'}</button></form>
        <div className={styles.actions}>{state.conversation&&state.conversation.status!=='resolved'?<button type="button" className={styles.secondary} onClick={()=>void closeConversation()} disabled={sending}>Finalizar conversación</button>:null}<button type="button" className={styles.secondary} onClick={hideChat}>Cerrar</button></div>
      </div>
    </section>
  </div>

  return <>
    <div className={styles.card}>
      <div className={styles.top}><span>SOPORTE HUMANO</span><span className={styles.liveFlag}>EN LÍNEA</span></div>
      <h3>¿Necesitás una persona?</h3>
      <p>Escribinos sin salir del sistema. El mensaje llega directamente a la bandeja de Central Llena.</p>
      <button ref={launchRef} className={styles.launch} type="button" onClick={()=>setOpen(true)}>Ayuda humana</button>
      <small>Respuesta directa dentro de Comercio Lleno.</small>
    </div>
    {open&&typeof document!=='undefined'?createPortal(dialog,document.body):null}
  </>
}
