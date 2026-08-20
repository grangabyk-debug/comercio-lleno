'use client'

import Link from 'next/link'
import {FormEvent,useEffect,useMemo,useState} from 'react'
import {cvAuthClient} from '../../cv-ia/cvAuth'

type Thread={id:string;last_message_at?:string;pm_companies?:{name?:string}|null;pm_applications?:{status?:string;pm_jobs?:{title?:string}|null}|null}
type Msg={id:string;sender_user_id:string;body:string;message_type:'text'|'voice_transcript'|'system';created_at:string}

async function authHeader(){const {data}=await cvAuthClient().auth.getSession();return data.session?.access_token?{Authorization:`Bearer ${data.session.access_token}`}:{}}
export default function CandidateChat(){
 const [threads,setThreads]=useState<Thread[]>([]),[active,setActive]=useState(''),[messages,setMessages]=useState<Msg[]>([]),[me,setMe]=useState(''),[text,setText]=useState(''),[busy,setBusy]=useState(false),[signedIn,setSignedIn]=useState<boolean|null>(null)
 useEffect(()=>{(async()=>{const headers=await authHeader();if(!('Authorization' in headers)){setSignedIn(false);return}setSignedIn(true);const r=await fetch('/api/postula/messages',{headers});const d=await r.json().catch(()=>({}));if(!r.ok||!d?.ok||!d.conversations?.length){setThreads([]);return}setThreads(d.conversations);setMe(d.me||'');setActive(d.conversations[0].id)})()},[])
 useEffect(()=>{if(!active||signedIn!==true)return;(async()=>{const headers=await authHeader();const r=await fetch(`/api/postula/messages?conversation=${encodeURIComponent(active)}`,{headers});const d=await r.json().catch(()=>({}));if(r.ok&&d?.ok){setMessages(d.messages||[]);setMe(d.me||'')}})()},[active,signedIn])
 const thread=useMemo(()=>threads.find(t=>t.id===active)||threads[0],[threads,active])
 async function send(e:FormEvent){e.preventDefault();const clean=text.trim();if(!clean||busy||signedIn!==true)return;setBusy(true);setText('');try{const headers={'Content-Type':'application/json',...(await authHeader())};const r=await fetch('/api/postula/messages',{method:'POST',headers,body:JSON.stringify({conversation_id:active,text:clean})});const d=await r.json().catch(()=>({}));if(r.ok&&d?.message)setMessages(v=>[...v,d.message]);else setText(clean)}finally{setBusy(false)}}
 if(signedIn===null)return <main className="pmc-page"><section className="pmc-chat"><div className="pmc-empty-chat"><b>Cargando mensajes…</b><p>Estamos verificando tu sesión.</p></div></section></main>
 if(signedIn===false)return <main className="pmc-page"><section className="pmc-chat"><div className="pmc-empty-chat"><b>Ingresá para ver tus mensajes.</b><p>Las conversaciones son privadas y sólo aparecen dentro de la cuenta asociada a la postulación.</p><Link href="/acceso?next=/mensajes">Ingresar o crear cuenta</Link><Link href="/empleos">Explorar empleos</Link></div></section></main>
 return <main className="pmc-page">
  <aside className="pmc-list"><div className="pmc-list-top"><Link href="/mi-cuenta" className="pmc-back">← Mi cuenta</Link><div><b>Mensajes</b><span>Empleadores y oportunidades</span></div></div>{threads.length?threads.map(t=><button key={t.id} data-active={t.id===active} onClick={()=>setActive(t.id)}><span className="pmc-thread-avatar">{(t.pm_companies?.name||'PM').slice(0,2).toUpperCase()}</span><span><b>{t.pm_companies?.name||'Empresa'}</b><small>{t.pm_applications?.pm_jobs?.title||'Conversación laboral'}</small></span><i/></button>):<div className="pmc-empty"><b>Todavía no hay mensajes.</b><p>Cuando un empleador abra una conversación desde una postulación, va a aparecer acá.</p><Link href="/empleos">Buscar oportunidades</Link></div>}</aside>
  <section className="pmc-chat">
   {thread?<><header><Link href="/mi-cuenta" className="pmc-mobile-back">←</Link><span className="pmc-chat-avatar">{(thread.pm_companies?.name||'PM').slice(0,2).toUpperCase()}</span><div><b>{thread.pm_companies?.name||'Empresa'}</b><small>{thread.pm_applications?.pm_jobs?.title||'Conversación laboral'} · postulación {thread.pm_applications?.status||'activa'}</small></div><Link href="/mi-cuenta" className="pmc-close">Cerrar</Link></header>
   <div className="pmc-trust"><i/>Este chat pertenece a tu postulación. El empleador puede dictar mensajes; vos recibís únicamente la transcripción en texto.</div>
   <div className="pmc-messages">{messages.map(m=>{const mine=m.sender_user_id===me;return <article key={m.id} data-mine={mine}><div>{m.message_type==='voice_transcript'&&!mine?<small className="pmc-transcript">Mensaje dictado · transcripto automáticamente</small>:null}<p>{m.body}</p><time>{new Date(m.created_at).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}</time></div></article>})}</div>
   <form className="pmc-compose" onSubmit={send}><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Escribí un mensaje…" rows={1} maxLength={4000}/><button disabled={busy||!text.trim()}>{busy?'…':'Enviar'}</button></form></>:<div className="pmc-empty-chat"><b>Elegí una conversación</b><p>Los mensajes se mantienen separados por empresa y postulación.</p></div>}
  </section>
 </main>
}
