'use client'

import Link from 'next/link'
import {FormEvent,useEffect,useMemo,useRef,useState} from 'react'
import {cvAuthClient} from '../../cv-ia/cvAuth'

type CounterpartProfile={user_id?:string;display_name?:string|null;headline?:string|null;location?:string|null;profile_completion?:number|null}
type Thread={id:string;conversation_kind?:'application'|'flex';last_message_at?:string;unread_count?:number;pm_companies?:{name?:string}|null;pm_applications?:{status?:string;pm_jobs?:{title?:string}|null}|null;pm_flex_posts?:{title?:string;location_text?:string;compensation_text?:string}|null;counterpart_profile?:CounterpartProfile|null}
type Msg={id:string;sender_user_id:string;body:string;message_type:'text'|'voice_transcript'|'system'|'interview';metadata?:Record<string,unknown>;created_at:string}
type Interview={id:string;conversation_id:string;scheduled_for:string;duration_minutes:number;mode:string;location_text?:string|null;notes?:string|null;status:'proposed'|'accepted'|'declined'|'cancelled'|'completed';proposed_by:string}
type AuthState='loading'|'in'|'out'
type Filter='all'|'application'|'flex'

function first<T>(v:T|T[]|null|undefined):T|null{return Array.isArray(v)?v[0]||null:v||null}
function title(t:Thread){return t.conversation_kind==='flex'?first(t.pm_flex_posts)?.title||'Servicio Flex':first(first(t.pm_applications)?.pm_jobs)?.title||'Conversación laboral'}
function counterpart(t:Thread){if(t.conversation_kind==='flex')return t.counterpart_profile?.display_name||'Persona interesada';return first(t.pm_companies)?.name||'Empresa'}
function subline(t:Thread){if(t.conversation_kind==='flex'){const f=first(t.pm_flex_posts);return [f?.location_text,f?.compensation_text].filter(Boolean).join(' · ')||'Servicio puntual'}return `Postulación ${first(t.pm_applications)?.status||'activa'}`}
function profileMeta(t:Thread){if(t.conversation_kind!=='flex')return'';const p=t.counterpart_profile;return [p?.headline,p?.location].filter(Boolean).join(' · ')}
function initials(t:Thread){return counterpart(t).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'PM'}
function interviewMode(v:string){return v==='virtual'?'Virtual':v==='telefonica'?'Telefónica':v==='presencial'?'Presencial':'A coordinar'}
function interviewWhen(v:string){return new Date(v).toLocaleString('es-AR',{weekday:'short',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',timeZone:'America/Argentina/Buenos_Aires'})}
async function authHeader(){const {data}=await cvAuthClient().auth.getSession();return data.session?.access_token?{Authorization:`Bearer ${data.session.access_token}`}:{}}

export default function CandidateChat(){
 const [auth,setAuth]=useState<AuthState>('loading'),[threads,setThreads]=useState<Thread[]>([]),[active,setActive]=useState(''),[messages,setMessages]=useState<Msg[]>([]),[interviews,setInterviews]=useState<Interview[]>([]),[me,setMe]=useState(''),[text,setText]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[filter,setFilter]=useState<Filter>('all')
 const activeRef=useRef('');useEffect(()=>{activeRef.current=active},[active])

 async function loadThreads(preferred=''){
  const headers=await authHeader();if(!('Authorization' in headers)){setAuth('out');return [] as Thread[]}
  const r=await fetch('/api/postula/messages?audience=candidate',{headers,cache:'no-store'}),d=await r.json().catch(()=>({}))
  if(!r.ok||!d?.ok){if(r.status===401)setAuth('out');return [] as Thread[]}
  const rows=(d.conversations||[]) as Thread[];setThreads(rows);setMe(d.me||'');setAuth('in')
  if(rows.length){const requested=preferred||new URLSearchParams(window.location.search).get('conversation')||activeRef.current||'';if(!rows.some(x=>x.id===activeRef.current))setActive(rows.some(x=>x.id===requested)?requested:rows[0].id)}else setActive('')
  return rows
 }
 async function loadConversation(id:string){
  if(!id)return
  const headers=await authHeader();if(!('Authorization' in headers)){setAuth('out');return}
  const r=await fetch(`/api/postula/messages?audience=candidate&conversation=${encodeURIComponent(id)}`,{headers,cache:'no-store'}),d=await r.json().catch(()=>({}))
  if(r.ok&&d?.ok){setMessages(d.messages||[]);setInterviews(d.interviews||[]);setMe(d.me||'');setThreads(v=>v.map(t=>t.id===id?{...t,...(d.conversation||{}),unread_count:0}:t))}
 }

 useEffect(()=>{let cancelled=false;(async()=>{const rows=await loadThreads();if(cancelled)return;if(!rows.length){const headers=await authHeader();if(!('Authorization' in headers))setAuth('out');else setAuth('in')}})();return()=>{cancelled=true}},[])
 useEffect(()=>{if(auth!=='in'||!active)return;void loadConversation(active)},[active,auth])
 useEffect(()=>{
  if(auth!=='in'||!me)return
  let alive=true,channel:any=null;const client=cvAuthClient()
  const refresh=async(conversation?:string)=>{if(!alive)return;await loadThreads(activeRef.current);if(conversation&&conversation===activeRef.current)await loadConversation(conversation)}
  channel=client.channel(`pm-chat-${me}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'pm_notifications',filter:`user_id=eq.${me}`},(payload:any)=>{if(payload?.new?.notification_type!=='message')return;const conversation=String(payload?.new?.payload?.conversation_id||'');void refresh(conversation)}).subscribe()
  const timer=window.setInterval(()=>{if(document.visibilityState==='visible')void refresh(activeRef.current)},15000)
  const focus=()=>void refresh(activeRef.current);window.addEventListener('focus',focus)
  return()=>{alive=false;window.clearInterval(timer);window.removeEventListener('focus',focus);if(channel)void client.removeChannel(channel)}
 },[auth,me])

 const filtered=useMemo(()=>filter==='all'?threads:threads.filter(t=>t.conversation_kind===filter),[threads,filter])
 const thread=useMemo(()=>threads.find(t=>t.id===active)||filtered[0]||threads[0],[threads,filtered,active])
 const unreadEmployment=threads.filter(t=>t.conversation_kind!=='flex').reduce((n,t)=>n+Number(t.unread_count||0),0),unreadFlex=threads.filter(t=>t.conversation_kind==='flex').reduce((n,t)=>n+Number(t.unread_count||0),0)
 function changeFilter(next:Filter){setFilter(next);const list=next==='all'?threads:threads.filter(t=>t.conversation_kind===next);if(list.length&&!list.some(t=>t.id===active))setActive(list[0].id)}
 async function send(e:FormEvent){e.preventDefault();const clean=text.trim();if(!clean||busy||auth!=='in'||!active)return;setBusy(true);setText('');setNotice('');try{const authHeaders=await authHeader();if(!('Authorization' in authHeaders)){setAuth('out');setText(clean);return}const headers={'Content-Type':'application/json',...authHeaders};const r=await fetch('/api/postula/messages',{method:'POST',headers,body:JSON.stringify({conversation_id:active,audience:'candidate',text:clean})});const d=await r.json().catch(()=>({}));if(r.ok&&d?.message){setMessages(v=>[...v,d.message]);void loadThreads(active)}else{setText(clean);setNotice(d?.error||'No pudimos enviar el mensaje.')}}finally{setBusy(false)}}
 async function answerInterview(interview:Interview,status:'accepted'|'declined'){if(busy)return false;setBusy(true);setNotice('');try{const authHeaders=await authHeader();if(!('Authorization' in authHeaders))return false;const r=await fetch('/api/postula/messages',{method:'POST',headers:{'Content-Type':'application/json',...authHeaders},body:JSON.stringify({action:'respond_interview',audience:'candidate',conversation_id:active,interview_id:interview.id,status})});const d=await r.json().catch(()=>({}));if(!r.ok||!d?.ok)throw new Error(d?.error||'No pudimos responder la entrevista.');setInterviews(v=>v.map(x=>x.id===interview.id?d.interview:x));if(d.message)setMessages(v=>[...v,d.message]);setNotice(status==='accepted'?'Entrevista confirmada. La empresa recibió tu respuesta y ya quedó agendada en tu calendario.':'Avisamos a la empresa que esa propuesta no te sirve. Podés enviarle otro horario desde este mismo chat.');void loadThreads(active);return true}catch(e){setNotice(e instanceof Error?e.message:'No pudimos responder.');return false}finally{setBusy(false)}}
 async function requestOtherTime(interview:Interview){const ok=await answerInterview(interview,'declined');if(!ok)return;setText(`¿Podemos coordinar otro horario para la entrevista? La propuesta del ${interviewWhen(interview.scheduled_for)} no me queda bien. Tengo disponibilidad `);window.setTimeout(()=>document.querySelector<HTMLTextAreaElement>('.pmc-compose textarea')?.focus(),50)}

 if(auth!=='in')return <main className="pmc-page">
  <aside className="pmc-list"><div className="pmc-list-top"><Link href="/" className="pmc-back">← Inicio</Link><div><b>Mensajes</b><span>Empleos y Servicios Flex</span></div></div></aside>
  <section className="pmc-chat pmc-auth-chat"><div className="pmc-empty-chat pmc-auth-gate"><b>{auth==='loading'?'Cargando mensajes…':'Ingresá para ver tus mensajes.'}</b>{auth==='out'&&<><p>Usás la misma cuenta para empleos y Servicios Flex.</p><div className="pmc-auth-actions"><Link href="/login?next=%2Fmensajes">Iniciar sesión</Link><Link href="/registro?next=%2Fmensajes">Crear cuenta</Link></div></>}</div></section>
 </main>

 return <main className="pmc-page">
  <aside className="pmc-list"><div className="pmc-list-top"><Link href="/mi-cuenta" className="pmc-back">← Mi cuenta</Link><div><b>Mensajes</b><span>Separados por tipo de oportunidad</span></div></div><div className="pmc-tabs"><button data-on={filter==='all'} onClick={()=>changeFilter('all')}>Todos {(unreadEmployment+unreadFlex)>0&&<i>{unreadEmployment+unreadFlex}</i>}</button><button data-on={filter==='application'} onClick={()=>changeFilter('application')}>Empleos {unreadEmployment>0&&<i>{unreadEmployment}</i>}</button><button data-on={filter==='flex'} onClick={()=>changeFilter('flex')}>Flex {unreadFlex>0&&<i>{unreadFlex}</i>}</button></div>{filtered.length?filtered.map(t=><button className="pmc-thread" key={t.id} data-active={t.id===active} onClick={()=>setActive(t.id)}><span className="pmc-thread-avatar">{initials(t)}</span><span className="pmc-thread-copy">{t.conversation_kind==='flex'?<><em data-kind="flex">Servicios Flex</em><b className="pmc-flex-title">{title(t)}</b><small className="pmc-flex-person">{counterpart(t)}{profileMeta(t)?` · ${profileMeta(t)}`:''}</small></>:<><b>{counterpart(t)}</b><small>{title(t)}</small><em data-kind="application">Postulación</em></>}</span>{Number(t.unread_count||0)>0?<strong className="pmc-unread">{t.unread_count}</strong>:<i className="pmc-read-dot"/>}</button>):<div className="pmc-empty"><b>No hay conversaciones en esta sección.</b><p>{filter==='flex'?'Las consultas de Servicios Flex van a aparecer acá, separadas de empleos.':'Una conversación laboral aparece únicamente cuando la empresa inicia el contacto.'}</p>{filter!=='flex'&&<Link href="/empleos">Buscar oportunidades</Link>}</div>}</aside>
  <section className="pmc-chat">
   {thread?<><header><Link href="/mi-cuenta" className="pmc-mobile-back">←</Link><span className="pmc-chat-avatar">{initials(thread)}</span><div>{thread.conversation_kind==='flex'?<><b>{counterpart(thread)}</b><strong className="pmc-header-service">{title(thread)}</strong><small>{subline(thread)}</small></>:<><b>{counterpart(thread)}</b><small>{title(thread)} · {subline(thread)}</small></>}</div><span className="pmc-kind" data-kind={thread.conversation_kind==='flex'?'flex':'application'}>{thread.conversation_kind==='flex'?'FLEX':'EMPLEO'}</span><Link href="/mi-cuenta" className="pmc-close">Cerrar</Link></header>
   {thread.conversation_kind==='flex'&&<div className="pmc-profile-card"><span className="pmc-profile-avatar">{initials(thread)}</span><div><span>TE ESTÁ ESCRIBIENDO</span><b>{counterpart(thread)}</b>{thread.counterpart_profile?.headline&&<p>{thread.counterpart_profile.headline}</p>}<small>{thread.counterpart_profile?.location||'Ubicación no publicada'}{typeof thread.counterpart_profile?.profile_completion==='number'?` · Perfil ${thread.counterpart_profile.profile_completion}% completo`:''}</small></div><div className="pmc-profile-service"><span>SERVICIO FLEX</span><strong>{title(thread)}</strong></div></div>}
   <div className="pmc-trust"><i/>{thread.conversation_kind==='flex'?'Este chat pertenece a Servicios Flex. Acordá alcance, horario y forma de pago directamente con la otra parte antes de realizar la tarea.':'Este contacto lo inició la empresa desde tu postulación. Podés responder, hacer preguntas y coordinar la entrevista dentro de este hilo.'}</div>
   {thread.conversation_kind!=='flex'&&interviews.length>0&&<div className="pmc-interviews">{interviews.slice().reverse().map(iv=><article key={iv.id} data-status={iv.status}><div><span>ENTREVISTA</span><b>{interviewWhen(iv.scheduled_for)}</b><p>{interviewMode(iv.mode)} · {iv.duration_minutes} min{iv.location_text?` · ${iv.location_text}`:''}</p>{iv.notes&&<small>{iv.notes}</small>}</div>{iv.status==='proposed'?<div className="pmc-interview-actions"><button disabled={busy} onClick={()=>void answerInterview(iv,'accepted')}>Aceptar</button><button disabled={busy} className="reschedule" onClick={()=>void requestOtherTime(iv)}>Otro horario</button><button disabled={busy} className="decline" onClick={()=>void answerInterview(iv,'declined')}>No puedo</button></div>:<div><strong>{iv.status==='accepted'?'✓ Entrevista confirmada':iv.status==='declined'?'No aceptada':iv.status==='completed'?'Realizada':'Cancelada'}</strong>{iv.status==='accepted'&&<Link className="pmc-calendar-link" href="/calendario">Ver en calendario</Link>}</div>}</article>)}</div>}
   <div className="pmc-messages">{messages.map(m=>{const mine=m.sender_user_id===me;return <article key={m.id} data-mine={mine} data-type={m.message_type}><div>{m.message_type==='voice_transcript'&&!mine?<small className="pmc-transcript">Mensaje dictado · transcripto automáticamente</small>:null}{m.message_type==='interview'?<small className="pmc-transcript">Invitación a entrevista</small>:null}<p>{m.body}</p><time>{new Date(m.created_at).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit',timeZone:'America/Argentina/Buenos_Aires'})}</time></div></article>})}</div>
   {notice&&<div className="pmc-notice">{notice}</div>}
   <form className="pmc-compose" onSubmit={send}><textarea value={text} onChange={e=>setText(e.target.value)} placeholder={thread.conversation_kind==='flex'?'Escribí sobre el servicio…':'Responder a la empresa…'} rows={1} maxLength={4000}/><button disabled={busy||!text.trim()}>{busy?'…':'Enviar'}</button></form></>:<div className="pmc-empty-chat"><b>Elegí una conversación</b><p>Los mensajes se mantienen separados por oportunidad.</p></div>}
  </section>
 </main>
}
