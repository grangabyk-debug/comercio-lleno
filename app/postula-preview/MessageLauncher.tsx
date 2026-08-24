'use client'

import Link from 'next/link'
import {FormEvent,useEffect,useMemo,useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'

type Thread={id:string;conversation_kind?:'application'|'flex';pm_companies?:{name?:string}|null;pm_applications?:{status?:string;pm_jobs?:{title?:string}|null}|null;pm_flex_posts?:{title?:string;location_text?:string;compensation_text?:string}|null}
type Msg={id:string;sender_user_id:string;body:string;message_type:string;created_at:string}

function title(t:Thread){return t.conversation_kind==='flex'?t.pm_flex_posts?.title||'Trabajo Flex':t.pm_applications?.pm_jobs?.title||'Conversación laboral'}
function counterpart(t:Thread){return t.conversation_kind==='flex'?(t.pm_companies?.name||'Trabajo Flex'):(t.pm_companies?.name||'Empresa')}
async function token(){const {data}=await cvAuthClient().auth.getSession();return data.session?.access_token||''}
function ChatIcon(){return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 5.5h13v9.2h-7.1L7.2 18v-3.3H5.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>}

export default function MessageLauncher(){
 const [open,setOpen]=useState(false),[loading,setLoading]=useState(false),[logged,setLogged]=useState<boolean|null>(null),[threads,setThreads]=useState<Thread[]>([]),[active,setActive]=useState(''),[messages,setMessages]=useState<Msg[]>([]),[me,setMe]=useState(''),[text,setText]=useState(''),[busy,setBusy]=useState(false)
 useEffect(()=>{if(!open)return;const key=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false)};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[open])
 const thread=useMemo(()=>threads.find(x=>x.id===active)||threads[0],[threads,active])
 async function launch(){if(typeof window!=='undefined'&&window.matchMedia('(max-width:760px)').matches){location.assign('/mensajes');return}setOpen(true);setLoading(true);const t=await token();if(!t){setLogged(false);setLoading(false);return}setLogged(true);try{const r=await fetch('/api/postula/messages',{headers:{Authorization:`Bearer ${t}`},cache:'no-store'});const d=await r.json().catch(()=>({}));const list=Array.isArray(d?.conversations)?d.conversations:[];setThreads(list);setMe(String(d?.me||''));if(list.length){setActive(String(list[0].id));await loadMessages(String(list[0].id),t)}}finally{setLoading(false)}}
 async function loadMessages(id:string,knownToken?:string){setActive(id);const t=knownToken||await token();if(!t)return;const r=await fetch(`/api/postula/messages?conversation=${encodeURIComponent(id)}`,{headers:{Authorization:`Bearer ${t}`},cache:'no-store'});const d=await r.json().catch(()=>({}));if(r.ok&&d?.ok){setMessages(d.messages||[]);setMe(String(d.me||''))}}
 async function send(e:FormEvent){e.preventDefault();const clean=text.trim();if(!clean||!active||busy)return;setBusy(true);setText('');try{const t=await token();if(!t)return;const r=await fetch('/api/postula/messages',{method:'POST',headers:{Authorization:`Bearer ${t}`,'Content-Type':'application/json'},body:JSON.stringify({conversation_id:active,text:clean})});const d=await r.json().catch(()=>({}));if(r.ok&&d?.message)setMessages(v=>[...v,d.message]);else setText(clean)}finally{setBusy(false)}}
 return <>
  <button type="button" className="pm-message-launcher" onClick={()=>void launch()}><span aria-hidden="true"><ChatIcon/></span><b>Mensajes</b></button>
  {open&&<div className="pm-msg-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}>
   <section className="pm-msg-modal" role="dialog" aria-modal="true" aria-label="Mensajes de Postulá Mejor">
    <header><div><span>PM</span><div><b>Mensajes</b><small>Empleos y Trabajo Flex</small></div></div><button onClick={()=>setOpen(false)} aria-label="Cerrar">×</button></header>
    {loading?<div className="pm-msg-state"><b>Cargando conversaciones…</b></div>:
     logged===false?<div className="pm-msg-state"><b>Ingresá para ver tus mensajes.</b><p>Usás la misma cuenta para empleos y Trabajo Flex.</p><div className="pm-msg-auth-actions"><Link href="/login?next=%2Fmensajes">Iniciar sesión</Link><Link href="/registro?next=%2Fmensajes" className="secondary">Crear cuenta</Link></div></div>:
     threads.length===0?<div className="pm-msg-state"><b>Todavía no hay conversaciones.</b><p>Cuando una empresa te escriba o contactes una publicación de Trabajo Flex, aparecerá acá.</p><Link href="/empleos">Buscar empleos</Link></div>:
     <div className="pm-msg-shell"><aside>{threads.map(t=><button key={t.id} data-on={t.id===active} onClick={()=>void loadMessages(t.id)}><i>{counterpart(t).slice(0,2).toUpperCase()}</i><span><b>{counterpart(t)}</b><small>{title(t)}</small></span></button>)}</aside><div className="pm-msg-chat">{thread&&<div className="pm-msg-chat-head"><b>{counterpart(thread)}</b><span>{title(thread)}</span></div>}<div className="pm-msg-messages">{messages.map(m=><div key={m.id} data-mine={m.sender_user_id===me}><p>{m.body}</p><small>{new Date(m.created_at).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}</small></div>)}</div><form onSubmit={send}><input value={text} onChange={e=>setText(e.target.value)} placeholder="Escribí un mensaje…" maxLength={4000}/><button disabled={busy||!text.trim()}>{busy?'…':'Enviar'}</button></form></div></div>}
    <footer><span>En celular se abre la versión adaptada a pantalla completa.</span><Link href="/mensajes">Abrir pantalla completa</Link></footer>
   </section>
  </div>}
 </>
}
