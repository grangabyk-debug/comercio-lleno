'use client'

import { FormEvent,useCallback,useEffect,useMemo,useRef,useState } from 'react'
import styles from './mobile.module.css'

const ENDPOINT='https://pejkycdttogpmmdntzuq.supabase.co/functions/v1/owner-mobile'
type Message={id:string;role:string;content:string;created_at:string}
type Alert={id:string;severity:string;category:string;title:string;message:string;occurred_at:string}
type Support={id:string;external_tenant_name:string;subject:string;priority:string;operator_unread_count:number;last_message_at:string;product_name?:string}
type Task={id:string;title:string;prompt:string;interval_hours:number;enabled:boolean;next_run_at:string;last_status?:string|null}
type Feed={messages:Message[];critical:Array<{id:string;name:string;health_status:string;consecutive_failures:number}>;alerts:Alert[];tasks:Task[];support:{open:number;unread:number;items:Support[]};system:{agents:number;flows:number;sites:number;healthy:number}}
type View='chat'|'inbox'|'alerts'|'tasks'|'settings'
type ThreadMessage={id:string;sender_type:string;sender_name:string|null;body:string;created_at:string}

function t(v:string){return new Date(v).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}
function dt(v:string){return new Date(v).toLocaleString('es-AR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}
function b64(value:string){const n=value.replace(/-/g,'+').replace(/_/g,'/');const bin=atob(n.padEnd(Math.ceil(n.length/4)*4,'='));return Uint8Array.from(bin,c=>c.charCodeAt(0))}

export function LlenaGroupMobile(){
  const[token,setToken]=useState('')
  const[pairCode,setPairCode]=useState('')
  const[pairing,setPairing]=useState(false)
  const[feed,setFeed]=useState<Feed|null>(null)
  const[view,setView]=useState<View>('chat')
  const[menu,setMenu]=useState(false)
  const[draft,setDraft]=useState('')
  const[sending,setSending]=useState(false)
  const[error,setError]=useState('')
  const[recording,setRecording]=useState(false)
  const[transcribing,setTranscribing]=useState(false)
  const[selected,setSelected]=useState<Support|null>(null)
  const[thread,setThread]=useState<ThreadMessage[]>([])
  const[supportDraft,setSupportDraft]=useState('')
  const[taskOpen,setTaskOpen]=useState(false)
  const[taskTitle,setTaskTitle]=useState('Resumen de Llena Group')
  const[taskPrompt,setTaskPrompt]=useState('Revisá Llena Group y avisame sólo si hay algo importante, un riesgo o una decisión que necesite tomar.')
  const[taskHours,setTaskHours]=useState(2)
  const[alertsActive,setAlertsActive]=useState(false)
  const endRef=useRef<HTMLDivElement|null>(null)
  const recorder=useRef<MediaRecorder|null>(null)
  const chunks=useRef<Blob[]>([])
  const stream=useRef<MediaStream|null>(null)

  useEffect(()=>{const saved=localStorage.getItem('llena_group_device_token')||'';setToken(saved);setAlertsActive(localStorage.getItem('llena_group_push')==='1')},[])
  const api=useCallback(async(body:Record<string,unknown>,overrideToken?:string)=>{const response=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json',...(overrideToken||token?{Authorization:`Bearer ${overrideToken||token}`}:{})},body:JSON.stringify(body)});const data=await response.json().catch(()=>({}));if(response.status===401&&body.action!=='pair'){localStorage.removeItem('llena_group_device_token');setToken('');throw new Error('Este teléfono perdió la autorización. Vinculalo de nuevo.')}if(!response.ok)throw new Error(String(data?.error||'No se pudo completar la acción.'));return data},[token])
  const refresh=useCallback(async()=>{if(!token)return;try{const data=await api({action:'feed'});setFeed(data);setError('')}catch(e){setError(e instanceof Error?e.message:'No pude actualizar.')}},[api,token])
  useEffect(()=>{if(!token)return;void refresh();const timer=setInterval(()=>void refresh(),10000);return()=>clearInterval(timer)},[refresh,token])
  useEffect(()=>{if(view==='chat')endRef.current?.scrollIntoView({behavior:'smooth'})},[feed?.messages.length,sending,view])
  useEffect(()=>()=>stream.current?.getTracks().forEach(x=>x.stop()),[])

  const urgent=(feed?.critical.length??0)+(feed?.alerts.filter(a=>a.severity==='critical').length??0)+(feed?.support.unread??0)
  const summary=useMemo(()=>feed?`${feed.system.agents}/7 agentes · ${feed.system.healthy}/${feed.system.sites} sistemas OK`:'Conectando…',[feed])

  async function pair(e:FormEvent){e.preventDefault();if(pairing)return;setPairing(true);setError('');try{const data=await api({action:'pair',code:pairCode,label:'Llena Group Android'},'');localStorage.setItem('llena_group_device_token',data.token);setToken(data.token);setPairCode('')}catch(v){setError(v instanceof Error?v.message:'Código inválido.')}finally{setPairing(false)}}
  async function send(text:string){const content=text.trim();if(!content||sending)return;setSending(true);setDraft('');setError('');const optimistic:Message={id:`local-${Date.now()}`,role:'user',content,created_at:new Date().toISOString()};setFeed(f=>f?{...f,messages:[...f.messages,optimistic]}:f);try{const data=await api({action:'command',objective:content});const reply:Message={id:`nexo-${Date.now()}`,role:'director',content:String(data.answer||'Listo.'),created_at:new Date().toISOString()};setFeed(f=>f?{...f,messages:[...f.messages,reply]}:f);setTimeout(()=>void refresh(),800)}catch(v){setError(v instanceof Error?v.message:'Nexo no pudo responder.')}finally{setSending(false)}}
  async function submit(e:FormEvent){e.preventDefault();await send(draft)}
  async function toggleAudio(){if(recording){recorder.current?.stop();setRecording(false);return}try{const s=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});stream.current=s;chunks.current=[];const r=new MediaRecorder(s);recorder.current=r;r.ondataavailable=e=>{if(e.data.size)chunks.current.push(e.data)};r.onstop=()=>void transcribe(r.mimeType||'audio/webm');r.start();setRecording(true)}catch{setError('Dale permiso al micrófono para hablar con Nexo.')}}
  async function transcribe(mime:string){stream.current?.getTracks().forEach(x=>x.stop());stream.current=null;const blob=new Blob(chunks.current,{type:mime});chunks.current=[];if(!blob.size)return;setTranscribing(true);try{const form=new FormData();form.append('audio',blob,'nexo.webm');const response=await fetch(ENDPOINT,{method:'POST',headers:{Authorization:`Bearer ${token}`},body:form});const data=await response.json();if(!response.ok)throw new Error(data?.error||'No entendí el audio.');if(data.transcript)await send(String(data.transcript))}catch(v){setError(v instanceof Error?v.message:'No entendí el audio.')}finally{setTranscribing(false)}}
  async function openThread(item:Support){setSelected(item);setView('inbox');setMenu(false);try{const data=await api({action:'support_thread',id:item.id});setThread(data.messages||[]);await refresh()}catch(v){setError(v instanceof Error?v.message:'No pude abrir el mensaje.')}}
  async function replySupport(e:FormEvent){e.preventDefault();const message=supportDraft.trim();if(!selected||!message)return;try{await api({action:'support_reply',id:selected.id,message});setSupportDraft('');await openThread({...selected,operator_unread_count:0})}catch(v){setError(v instanceof Error?v.message:'No pude responder.')}}
  async function taskAction(action:string,id?:string,enabled?:boolean){try{if(action==='task_create')await api({action,title:taskTitle,prompt:taskPrompt,interval_hours:taskHours});else await api({action,id,enabled});setTaskOpen(false);await refresh()}catch(v){setError(v instanceof Error?v.message:'No pude modificar la tarea.')}}
  async function activatePush(){if(!('serviceWorker'in navigator)||!('PushManager'in window)||!('Notification'in window)){setError('Este teléfono no admite notificaciones web.');return}try{const permission=await Notification.requestPermission();if(permission!=='granted')throw new Error('Las notificaciones quedaron bloqueadas.');const registration=await navigator.serviceWorker.register('/llena-group-sw.js');const k=await api({action:'push_key'});let sub=await registration.pushManager.getSubscription();if(!sub)sub=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64(String(k.publicKey))});const j=sub.toJSON();if(!j.keys?.p256dh||!j.keys?.auth)throw new Error('No pude registrar este teléfono.');await api({action:'push_subscribe',endpoint:sub.endpoint,p256dh:j.keys.p256dh,auth_key:j.keys.auth,user_agent:navigator.userAgent});localStorage.setItem('llena_group_push','1');setAlertsActive(true)}catch(v){setError(v instanceof Error?v.message:'No pude activar las notificaciones.')}}
  function go(v:View){setView(v);setMenu(false);if(v!=='inbox')setSelected(null)}

  if(!token)return <main className={styles.pair}><div className={styles.logo}><span>LG</span></div><h1>Llena Group</h1><p>Vinculá este teléfono una sola vez.</p><form onSubmit={pair}><input inputMode='numeric' pattern='[0-9]*' maxLength={8} value={pairCode} onChange={e=>setPairCode(e.target.value.replace(/\D/g,''))} placeholder='Código de 6 números'/><button disabled={pairing||pairCode.length<6}>{pairing?'Vinculando…':'Vincular teléfono'}</button></form>{error?<small className={styles.pairError}>{error}</small>:null}<em>Acceso privado · sólo Llena Group</em></main>

  return <main className={styles.app}>
    <header className={styles.top}>{view!=='chat'?<button className={styles.back} onClick={()=>go('chat')}>‹</button>:null}<div><strong>{view==='chat'?'Nexo':view==='inbox'?'Bandeja':view==='alerts'?'Notificaciones':view==='tasks'?'Tareas':'Configuración'}</strong><span>{view==='chat'?`Director · ${summary}`:'Llena Group'}</span></div><button className={styles.more} onClick={()=>setMenu(x=>!x)}>•••</button></header>

    {view==='chat'?<><section className={styles.chat}>{feed?.critical.slice(0,1).map(x=><button key={x.id} className={styles.critical} onClick={()=>go('alerts')}><b>ALERTA CRÍTICA</b><strong>{x.name} necesita atención</strong></button>)}{feed?.support.unread?<button className={styles.support} onClick={()=>go('inbox')}><b>SOPORTE</b><strong>{feed.support.unread} sin leer</strong></button>:null}{(feed?.messages??[]).map(m=><div key={m.id} className={m.role==='user'?styles.me:styles.nexo}><p>{m.content}</p><small>{t(m.created_at)}</small></div>)}{sending||transcribing?<div className={styles.typing}>{transcribing?'Entendiendo audio…':'Nexo está respondiendo…'}</div>:null}<div ref={endRef}/></section>{error?<div className={styles.error}>{error}</div>:null}<form className={styles.composer} onSubmit={submit}><button type='button' className={styles.plus} onClick={()=>setMenu(true)}>+</button><textarea rows={1} value={draft} onChange={e=>setDraft(e.target.value)} placeholder='Escribile a Nexo…'/><button type='button' className={recording?styles.recording:styles.mic} onClick={()=>void toggleAudio()}>{recording?'■':'●'}</button><button className={styles.send} disabled={!draft.trim()||sending||transcribing}>↑</button></form></>:null}

    {view==='inbox'?<section className={styles.panel}>{!selected?<><div className={styles.heading}><div><b>BANDEJA</b><h1>Mensajes de clientes</h1><p>Todos los sistemas juntos.</p></div><button onClick={()=>void refresh()}>Actualizar</button></div><div className={styles.inbox}>{(feed?.support.items??[]).map(x=><button key={x.id} onClick={()=>void openThread(x)}><div><strong>{x.external_tenant_name}</strong><span>{x.product_name} · {x.subject}</span><small>{dt(x.last_message_at)}</small></div>{x.operator_unread_count?<em>{x.operator_unread_count}</em>:null}</button>)}</div></>:<><div className={styles.threadHead}><button onClick={()=>setSelected(null)}>‹ Bandeja</button><div><strong>{selected.external_tenant_name}</strong><span>{selected.product_name} · {selected.subject}</span></div></div><div className={styles.thread}>{thread.map(m=><div key={m.id} data-me={m.sender_type==='agent'}><small>{m.sender_name||m.sender_type} · {t(m.created_at)}</small><p>{m.body}</p></div>)}</div><form className={styles.reply} onSubmit={replySupport}><textarea rows={1} value={supportDraft} onChange={e=>setSupportDraft(e.target.value)} placeholder='Responder…'/><button disabled={!supportDraft.trim()}>↑</button></form></>}{error?<div className={styles.error}>{error}</div>:null}</section>:null}

    {view==='alerts'?<section className={styles.panel}><div className={styles.heading}><div><b>NOTIFICACIONES</b><h1>Lo importante</h1><p>Alertas, seguridad y soporte.</p></div></div><div className={styles.cards}>{(feed?.alerts??[]).map(a=><article key={a.id} data-critical={a.severity==='critical'}><b>{a.severity==='critical'?'CRÍTICA':'AVISO'} · {a.category}</b><strong>{a.title}</strong><p>{a.message}</p><small>{dt(a.occurred_at)}</small></article>)}{(feed?.critical??[]).map(x=><article key={x.id} data-critical='true'><b>CRÍTICA · SISTEMA</b><strong>{x.name}</strong><p>El sistema no está saludable.</p></article>)}{feed?.support.items.filter(x=>x.operator_unread_count>0).map(x=><button key={x.id} onClick={()=>void openThread(x)}><b>SOPORTE</b><strong>{x.external_tenant_name}</strong><p>{x.subject}</p></button>)}{!urgent?<div className={styles.empty}>Todo tranquilo. No hay avisos abiertos.</div>:null}</div></section>:null}

    {view==='tasks'?<section className={styles.panel}><div className={styles.heading}><div><b>TAREAS</b><h1>Automatizaciones</h1><p>Revisiones periódicas de Nexo.</p></div><button onClick={()=>setTaskOpen(x=>!x)}>{taskOpen?'Cerrar':'+ Nueva'}</button></div>{taskOpen?<div className={styles.taskForm}><input value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} placeholder='Nombre'/><textarea value={taskPrompt} onChange={e=>setTaskPrompt(e.target.value)} rows={4}/><select value={taskHours} onChange={e=>setTaskHours(Number(e.target.value))}><option value={1}>Cada hora</option><option value={2}>Cada 2 horas</option><option value={4}>Cada 4 horas</option><option value={6}>Cada 6 horas</option><option value={12}>Cada 12 horas</option><option value={24}>Todos los días</option></select><button onClick={()=>void taskAction('task_create')}>Programar</button></div>:null}<div className={styles.cards}>{(feed?.tasks??[]).map(x=><article key={x.id}><b>{x.enabled?'ACTIVA':'PAUSADA'}</b><strong>{x.title}</strong><p>{x.prompt}</p><small>Próxima {dt(x.next_run_at)}</small><div className={styles.actions}><button onClick={()=>void taskAction('task_run',x.id)}>Ejecutar</button><button onClick={()=>void taskAction('task_toggle',x.id,!x.enabled)}>{x.enabled?'Pausar':'Activar'}</button><button onClick={()=>void taskAction('task_delete',x.id)}>Eliminar</button></div></article>)}</div></section>:null}

    {view==='settings'?<section className={styles.panel}><div className={styles.heading}><div><b>CONFIGURACIÓN</b><h1>Llena Group</h1><p>Sólo lo necesario.</p></div></div><div className={styles.settings}><article><div><strong>Notificaciones</strong><span>{alertsActive?'Activas':'Inactivas'}</span></div><button onClick={()=>void activatePush()} disabled={alertsActive}>{alertsActive?'Listo':'Activar'}</button></article><article><div><strong>Sonido de alertas</strong><span>Canal propio de Llena Group.</span></div><a href='llenagroup://notification-settings'>Elegir sonido</a></article><article><div><strong>Estado</strong><span>{summary}</span></div><button onClick={()=>void refresh()}>Actualizar</button></article><article><div><strong>Desvincular teléfono</strong><span>Vuelve a pedir código.</span></div><button onClick={async()=>{try{await api({action:'revoke_device'})}finally{localStorage.clear();location.reload()}}}>Desvincular</button></article></div></section>:null}

    {menu?<><button className={styles.scrim} onClick={()=>setMenu(false)}/><aside className={styles.menu}><i/><button onClick={()=>go('inbox')}><strong>Bandeja</strong><span>{feed?.support.unread?`${feed.support.unread} sin leer`:'Mensajes de clientes'}</span></button><button onClick={()=>go('alerts')}><strong>Notificaciones</strong><span>{urgent?`${urgent} requieren atención`:'Sin urgencias'}</span></button><button onClick={()=>go('tasks')}><strong>Tareas</strong><span>Programar a Nexo</span></button><button onClick={()=>go('settings')}><strong>Configuración</strong><span>Alertas, sonido y estado</span></button></aside></>:null}
  </main>
}
