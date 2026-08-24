'use client'

import Link from 'next/link'
import {FormEvent,useEffect,useMemo,useState} from 'react'
import {cvAuthClient} from '../../cv-ia/cvAuth'

type Thread={id:string;conversation_kind?:'application'|'flex';last_message_at?:string;pm_companies?:{name?:string}|null;pm_applications?:{status?:string;pm_jobs?:{title?:string}|null}|null;pm_flex_posts?:{title?:string;location_text?:string;compensation_text?:string}|null}
type Msg={id:string;sender_user_id:string;body:string;message_type:'text'|'voice_transcript'|'system'|'interview';created_at:string}
type AuthState='loading'|'in'|'out'

function title(t:Thread){return t.conversation_kind==='flex'?t.pm_flex_posts?.title||'Trabajo Flex':t.pm_applications?.pm_jobs?.title||'Conversación laboral'}
function counterpart(t:Thread){if(t.conversation_kind==='flex')return t.pm_companies?.name||'Trabajo Flex';return t.pm_companies?.name||'Empresa'}
function subline(t:Thread){if(t.conversation_kind==='flex')return [t.pm_flex_posts?.location_text,t.pm_flex_posts?.compensation_text].filter(Boolean).join(' · ')||'Tarea puntual';return `Postulación ${t.pm_applications?.status||'activa'}`}
async function authHeader(){const {data}=await cvAuthClient().auth.getSession();return data.session?.access_token?{Authorization:`Bearer ${data.session.access_token}`}:{}}

export default function CandidateChat(){
 const [auth,setAuth]=useState<AuthState>('loading'),[threads,setThreads]=useState<Thread[]>([]),[active,setActive]=useState(''),[messages,setMessages]=useState<Msg[]>([]),[me,setMe]=useState(''),[text,setText]=useState(''),[busy,setBusy]=useState(false)
 useEffect(()=>{let cancelled=false;(async()=>{const headers=await authHeader();if(cancelled)return;if(!('Authorization' in headers)){setAuth('out');return}setAuth('in');const r=await fetch('/api/postula/messages',{headers});const d=await r.json().catch(()=>({}));if(cancelled)return;if(!r.ok||!d?.ok||!d.conversations?.length){setThreads([]);return}setThreads(d.conversations);setMe(d.me||'');setActive(d.conversations[0].id)})();return()=>{cancelled=true}},[])
 useEffect(()=>{if(auth!=='in'||!active)return;(async()=>{const headers=await authHeader();if(!('Authorization' in headers)){setAuth('out');return}const r=await fetch(`/api/postula/messages?conversation=${encodeURIComponent(active)}`,{headers});const d=await r.json().catch(()=>({}));if(r.ok&&d?.ok){setMessages(d.messages||[]);setMe(d.me||'')}})()},[active,auth])
 const thread=useMemo(()=>threads.find(t=>t.id===active)||threads[0],[threads,active])
 async function send(e:FormEvent){e.preventDefault();const clean=text.trim();if(!clean||busy||auth!=='in'||!active)return;setBusy(true);setText('');try{const authHeaders=await authHeader();if(!('Authorization' in authHeaders)){setAuth('out');setText(clean);return}const headers={'Content-Type':'application/json',...authHeaders};const r=await fetch('/api/postula/messages',{method:'POST',headers,body:JSON.stringify({conversation_id:active,text:clean})});const d=await r.json().catch(()=>({}));if(r.ok&&d?.message)setMessages(v=>[...v,d.message]);else setText(clean)}finally{setBusy(false)}}

 if(auth!=='in')return <main className="pmc-page">
  <aside className="pmc-list"><div className="pmc-list-top"><Link href="/" className="pmc-back">← Inicio</Link><div><b>Mensajes</b><span>Empleos y Trabajo Flex</span></div></div></aside>
  <section className="pmc-chat pmc-auth-chat"><div className="pmc-empty-chat pmc-auth-gate"><b>{auth==='loading'?'Cargando mensajes…':'Ingresá para ver tus mensajes.'}</b>{auth==='out'&&<><p>Usás la misma cuenta para empleos y Trabajo Flex.</p><div className="pmc-auth-actions"><Link href="/login?next=%2Fmensajes">Iniciar sesión</Link><Link href="/registro?next=%2Fmensajes">Crear cuenta</Link></div></>}</div></section>
 </main>

 return <main className="pmc-page">
  <aside className="pmc-list"><div className="pmc-list-top"><Link href="/mi-cuenta" className="pmc-back">← Mi cuenta</Link><div><b>Mensajes</b><span>Empleos y Trabajo Flex</span></div></div>{threads.length?threads.map(t=><button key={t.id} data-active={t.id===active} onClick={()=>setActive(t.id)}><span className="pmc-thread-avatar">{counterpart(t).slice(0,2).toUpperCase()}</span><span><b>{counterpart(t)}</b><small>{title(t)}</small></span><i/></button>):<div className="pmc-empty"><b>Todavía no hay mensajes.</b><p>Cuando una empresa te escriba o abras una conversación de Trabajo Flex, va a aparecer acá.</p><Link href="/empleos">Buscar oportunidades</Link></div>}</aside>
  <section className="pmc-chat">
   {thread?<><header><Link href="/mi-cuenta" className="pmc-mobile-back">←</Link><span className="pmc-chat-avatar">{counterpart(thread).slice(0,2).toUpperCase()}</span><div><b>{counterpart(thread)}</b><small>{title(thread)} · {subline(thread)}</small></div><Link href="/mi-cuenta" className="pmc-close">Cerrar</Link></header>
   <div className="pmc-trust"><i/>{thread.conversation_kind==='flex'?'Este chat pertenece a un Trabajo Flex. Confirmá tarea, horario, alcance y pago antes de aceptar.':'Este chat pertenece a tu postulación. El empleador puede dictar mensajes; vos recibís únicamente la transcripción en texto.'}</div>
   <div className="pmc-messages">{messages.map(m=>{const mine=m.sender_user_id===me;return <article key={m.id} data-mine={mine}><div>{m.message_type==='voice_transcript'&&!mine?<small className="pmc-transcript">Mensaje dictado · transcripto automáticamente</small>:null}<p>{m.body}</p><time>{new Date(m.created_at).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}</time></div></article>})}</div>
   <form className="pmc-compose" onSubmit={send}><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Escribí un mensaje…" rows={1} maxLength={4000}/><button disabled={busy||!text.trim()}>{busy?'…':'Enviar'}</button></form></>:<div className="pmc-empty-chat"><b>Elegí una conversación</b><p>Los mensajes se mantienen separados por oportunidad.</p></div>}
  </section>
 </main>
}
