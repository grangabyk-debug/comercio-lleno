'use client'

import Link from 'next/link'
import {FormEvent,useEffect,useMemo,useState} from 'react'
import {createPortal} from 'react-dom'
import {cvAuthClient} from '../cv-ia/cvAuth'

type Thread={id:string;conversation_kind?:'application'|'flex';unread_count?:number;pm_companies?:{name?:string}|null;pm_applications?:{status?:string;pm_jobs?:{title?:string}|null}|null;pm_flex_posts?:{title?:string;location_text?:string;compensation_text?:string}|null}
type Msg={id:string;sender_user_id:string;body:string;message_type:string;created_at:string}
type LauncherVariant='header'|'mobile-nav'

function title(t:Thread){return t.conversation_kind==='flex'?t.pm_flex_posts?.title||'Servicio Flex':t.pm_applications?.pm_jobs?.title||'Conversación laboral'}
function counterpart(t:Thread){return t.conversation_kind==='flex'?(t.pm_companies?.name||'Servicios Flex'):(t.pm_companies?.name||'Empresa')}
async function token(){const {data}=await cvAuthClient().auth.getSession();return data.session?.access_token||''}
function ChatIcon(){return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 5.5h13v9.2h-7.1L7.2 18v-3.3H5.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>}
function unreadOf(list:Thread[]){return list.reduce((total,item)=>total+Number(item.unread_count||0),0)}

export default function MessageLauncher({variant='header',active=false}:{variant?:LauncherVariant;active?:boolean}){
 const [open,setOpen]=useState(false),[loading,setLoading]=useState(false),[logged,setLogged]=useState<boolean|null>(null),[threads,setThreads]=useState<Thread[]>([]),[activeThread,setActiveThread]=useState(''),[messages,setMessages]=useState<Msg[]>([]),[me,setMe]=useState(''),[text,setText]=useState(''),[busy,setBusy]=useState(false),[unread,setUnread]=useState(0)
 function applyThreads(list:Thread[]){setThreads(list);setUnread(unreadOf(list))}
 async function refreshUnread(){
  const t=await token();if(!t){setUnread(0);return}
  try{const r=await fetch('/api/postula/messages',{headers:{Authorization:`Bearer ${t}`},cache:'no-store'});const d=await r.json().catch(()=>({}));if(r.ok&&d?.ok&&Array.isArray(d.conversations))applyThreads(d.conversations)}catch{}
 }
 useEffect(()=>{
  void refreshUnread()
  const onFocus=()=>void refreshUnread(),onVisibility=()=>{if(document.visibilityState==='visible')void refreshUnread()}
  window.addEventListener('focus',onFocus);document.addEventListener('visibilitychange',onVisibility)
  const timer=window.setInterval(()=>void refreshUnread(),60000)
  return()=>{window.removeEventListener('focus',onFocus);document.removeEventListener('visibilitychange',onVisibility);window.clearInterval(timer)}
 },[])
 useEffect(()=>{
  if(!open)return
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false)}
  const previous=document.body.style.overflow
  document.body.style.overflow='hidden'
  window.addEventListener('keydown',key)
  return()=>{window.removeEventListener('keydown',key);document.body.style.overflow=previous}
 },[open])
 const thread=useMemo(()=>threads.find(x=>x.id===activeThread)||threads[0],[threads,activeThread])

 async function launch(){
  setOpen(true);setLoading(true);setLogged(null)
  const t=await token()
  if(!t){setLogged(false);setLoading(false);return}
  setLogged(true)
  try{
   const r=await fetch('/api/postula/messages',{headers:{Authorization:`Bearer ${t}`},cache:'no-store'})
   const d=await r.json().catch(()=>({}))
   const list:Thread[]=Array.isArray(d?.conversations)?d.conversations:[]
   applyThreads(list);setMe(String(d?.me||''))
   if(list.length){const firstId=String(list[0].id);setActiveThread(firstId);await loadMessages(firstId,t,list)}
  }finally{setLoading(false)}
 }
 async function loadMessages(id:string,knownToken?:string,baseThreads?:Thread[]){
  setActiveThread(id)
  const t=knownToken||await token();if(!t)return
  const r=await fetch(`/api/postula/messages?conversation=${encodeURIComponent(id)}`,{headers:{Authorization:`Bearer ${t}`},cache:'no-store'})
  const d=await r.json().catch(()=>({}))
  if(r.ok&&d?.ok){setMessages(d.messages||[]);setMe(String(d.me||''));const source=baseThreads||threads;const next=source.map(item=>item.id===id?{...item,unread_count:0}:item);applyThreads(next);window.dispatchEvent(new CustomEvent('pm:messages-read',{detail:{conversation:id}}))}
 }
 async function send(e:FormEvent){
  e.preventDefault();const clean=text.trim();if(!clean||!activeThread||busy)return
  setBusy(true);setText('')
  try{
   const t=await token();if(!t){setLogged(false);return}
   const r=await fetch('/api/postula/messages',{method:'POST',headers:{Authorization:`Bearer ${t}`,'Content-Type':'application/json'},body:JSON.stringify({conversation_id:activeThread,text:clean})})
   const d=await r.json().catch(()=>({}))
   if(r.ok&&d?.message)setMessages(v=>[...v,d.message]);else setText(clean)
  }finally{setBusy(false)}
 }
 const badge=unread>99?'99+':String(unread)
 const launcher=variant==='mobile-nav'
  ?<button type="button" className="pm-mobile-message-link" data-active={active} data-unread={unread>0} aria-current={active?'page':undefined} onClick={()=>void launch()}><span className="pm-mobile-nav-icon"><ChatIcon/></span><span>Mensajes</span>{unread>0&&<i className="pm-message-badge">{badge}</i>}</button>
  :<button type="button" className="pm-message-launcher" data-unread={unread>0} onClick={()=>void launch()}><span aria-hidden="true"><ChatIcon/></span><b>Mensajes</b>{unread>0&&<i className="pm-message-badge">{badge}</i>}</button>

 const modal=open?<div className="pm-msg-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}>
   <section className={`pm-msg-modal ${logged===false?'pm-msg-modal-auth':''}`} style={variant==='mobile-nav'&&logged===false?{transform:'translateY(-9vh)'}:undefined} role="dialog" aria-modal="true" aria-label="Mensajes de Postulá Mejor">
    <header><div><span>PM</span><div><b>Mensajes</b><small>Empleos y Servicios Flex</small></div></div><button onClick={()=>setOpen(false)} aria-label="Cerrar">×</button></header>
    {loading?<div className="pm-msg-state"><b>Cargando mensajes…</b></div>:
     logged===false?<div className="pm-msg-state"><b>Ingresá para ver tus mensajes.</b><p>Usás la misma cuenta para empleos y Servicios Flex.</p><div className="pm-msg-auth-actions"><Link href="/login?next=%2Fmensajes">Iniciar sesión</Link><Link href="/registro?next=%2Fmensajes" className="secondary">Crear cuenta</Link></div></div>:
     threads.length===0?<div className="pm-msg-state"><b>Todavía no hay conversaciones.</b><p>Cuando una empresa te escriba o contactes una publicación de Servicios Flex, aparecerá acá.</p><Link href="/empleos">Buscar empleos</Link></div>:
     <div className="pm-msg-shell"><aside>{threads.map(t=><button key={t.id} data-on={t.id===activeThread} onClick={()=>void loadMessages(t.id)}><i>{counterpart(t).slice(0,2).toUpperCase()}</i><span><b>{counterpart(t)}</b><small>{title(t)}</small></span>{Number(t.unread_count||0)>0&&<strong className="pm-msg-thread-unread">{t.unread_count}</strong>}</button>)}</aside><div className="pm-msg-chat">{thread&&<div className="pm-msg-chat-head"><b>{counterpart(thread)}</b><span>{title(thread)}</span></div>}<div className="pm-msg-messages">{messages.map(m=><div key={m.id} data-mine={m.sender_user_id===me}><p>{m.body}</p><small>{new Date(m.created_at).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}</small></div>)}</div><form onSubmit={send}><input value={text} onChange={e=>setText(e.target.value)} placeholder="Escribí un mensaje…" maxLength={4000}/><button disabled={busy||!text.trim()}>{busy?'…':'Enviar'}</button></form></div></div>}
    <footer><span>También podés abrir la bandeja completa.</span><Link href="/mensajes">Abrir pantalla completa</Link></footer>
   </section>
  </div>:null

 return <>{launcher}{modal&&typeof document!=='undefined'?createPortal(modal,document.body):null}</>
}
