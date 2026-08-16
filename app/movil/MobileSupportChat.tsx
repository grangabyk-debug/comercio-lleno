'use client'

import { FormEvent,useEffect,useRef,useState } from 'react'
import { readTenantSession } from '@/lib/comercio/session'
import styles from './mobile-support.module.css'

const SUPPORT_URL='https://pejkycdttogpmmdntzuq.supabase.co/functions/v1/support-chat'
type Message={id:string;from:'bot'|'customer'|'agent'|'system';senderName:string|null;content:string;createdAt:string}
type Conversation={id:string;status:string;subject:string;customerUnreadCount:number}|null

export default function MobileSupportChat(){
  const[visible,setVisible]=useState(false),[open,setOpen]=useState(false),[conversation,setConversation]=useState<Conversation>(null),[messages,setMessages]=useState<Message[]>([])
  const[text,setText]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('')
  const endRef=useRef<HTMLDivElement|null>(null)

  async function sync(action:'state'|'send'|'close'='state',message?:string){
    const session=readTenantSession();if(!session){setVisible(false);setOpen(false);return}
    const response=await fetch(SUPPORT_URL,{method:'POST',headers:{Authorization:`Bearer ${session.token}`,'Content-Type':'application/json'},body:JSON.stringify(action==='send'?{action,message,clientMessageId:crypto.randomUUID()}:{action}),cache:'no-store'})
    const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data?.error||'No se pudo conectar con soporte.')
    setConversation(data.conversation||null);setMessages(Array.isArray(data.messages)?data.messages:[])
  }

  useEffect(()=>{
    let timer:number|undefined
    const check=()=>{
      const ready=Boolean(readTenantSession()&&document.querySelector('main[class*="app"]'))
      setVisible(ready)
      if(ready&&new URLSearchParams(location.search).get('support')==='1'){setOpen(true);void sync().catch(()=>{})}
    }
    check();timer=window.setInterval(check,900)
    const opener=()=>{setOpen(true);setError('');void sync().catch(e=>setError(e instanceof Error?e.message:String(e)))}
    window.addEventListener('comercio:open-support',opener)
    return()=>{if(timer)window.clearInterval(timer);window.removeEventListener('comercio:open-support',opener)}
  },[])

  useEffect(()=>{
    if(!open)return
    void sync().catch(e=>setError(e instanceof Error?e.message:String(e)))
    const timer=window.setInterval(()=>void sync().catch(()=>{}),5000)
    return()=>window.clearInterval(timer)
  },[open])

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth',block:'end'})},[messages.length,open])

  async function send(event:FormEvent){
    event.preventDefault();const value=text.trim();if(!value||busy)return
    setBusy(true);setError('')
    try{await sync('send',value);setText('')}
    catch(e){setError(e instanceof Error?e.message:'No se pudo enviar el mensaje.')}
    finally{setBusy(false)}
  }

  if(!visible)return null
  return <>
    <button className={styles.helpButton} onClick={()=>{setOpen(true);setError('');void sync().catch(e=>setError(e instanceof Error?e.message:String(e)))}} aria-label="Ayuda humana"><span>?</span><b>Ayuda</b>{conversation?.customerUnreadCount? <i>{conversation.customerUnreadCount}</i>:null}</button>
    {open&&<div className={styles.backdrop} onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}>
      <section className={styles.chat}>
        <header><div><span>SOPORTE</span><h2>Ayuda humana</h2><p>Hablá directamente con Central Llena.</p></div><button onClick={()=>setOpen(false)} aria-label="Cerrar">×</button></header>
        <div className={styles.status}><b>{conversation?'Conversación activa':'Nueva consulta'}</b><span>{conversation?'Tus mensajes quedan guardados.':'Escribinos qué está pasando y te respondemos por acá.'}</span></div>
        <div className={styles.messages}>
          {!messages.length&&<div className={styles.empty}><b>¿En qué te podemos ayudar?</b><p>Contanos el problema con el mayor detalle posible.</p></div>}
          {messages.map(message=><div key={message.id} className={message.from==='customer'?styles.mine:styles.theirs}><small>{message.from==='customer'?'Vos':message.senderName||'Central Llena'}</small><p>{message.content}</p><time>{new Date(message.createdAt).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}</time></div>)}
          <div ref={endRef}/>
        </div>
        {error&&<div className={styles.error}>{error}</div>}
        <form onSubmit={send}><textarea value={text} onChange={e=>setText(e.target.value)} maxLength={2000} rows={2} placeholder="Escribí tu mensaje…"/><button disabled={busy||!text.trim()}>{busy?'Enviando…':'Enviar'}</button></form>
      </section>
    </div>}
  </>
}
