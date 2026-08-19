'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import styles from './active.module.css'
import HumanHelpChat from './HumanHelpChat'
import { CV_ACCOUNT_API, CV_API, CV_PRO_API, SESSION_KEY, cvAuthClient, postCv, trackCvEvent } from '../cv-ia/cvAuth'

type AppItem={id:string;company_name:string|null;role_name:string;status:string;analysis:any;adapted_resume:any;interview_pack:any[];job_text:string;created_at:string;updated_at:string}
const columns=[['preparing','Preparando'],['applied','Postulado'],['interview','Entrevista'],['offer','Oferta'],['rejected','No avanzó']] as const
const OWNER_AUTH_API='https://pejkycdttogpmmdntzuq.supabase.co/functions/v1/cv-ai-owner-auth'

async function pro(body:any){const headers:Record<string,string>={'Content-Type':'application/json'};const session=(await cvAuthClient().auth.getSession()).data.session;if(session)headers.Authorization=`Bearer ${session.access_token}`;const r=await fetch(CV_PRO_API,{method:'POST',headers,body:JSON.stringify(body)});const d=await r.json().catch(()=>({ok:false,error:'Respuesta inválida'}));if(!r.ok||!d?.ok)throw new Error(d?.error||'No pudimos completar la operación.');return d}
async function accountCall(accessToken:string,body:any){const r=await fetch(CV_ACCOUNT_API,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${accessToken}`},body:JSON.stringify(body)});const d=await r.json().catch(()=>({ok:false,error:'Respuesta inválida'}));if(!r.ok||!d?.ok)throw new Error(d?.error||'No pudimos vincular la cuenta.');return d}

export default function ActiveClient(){
 const [token,setToken]=useState('')
 const [logged,setLogged]=useState(false)
 const [owner,setOwner]=useState(false)
 const [plan,setPlan]=useState('free')
 const [apps,setApps]=useState<AppItem[]>([])
 const [remaining,setRemaining]=useState(0)
 const [loading,setLoading]=useState(true)
 const [error,setError]=useState('')
 const [message,setMessage]=useState('')
 const [company,setCompany]=useState('')
 const [role,setRole]=useState('')
 const [job,setJob]=useState('')
 const [busy,setBusy]=useState(false)
 const [selected,setSelected]=useState<AppItem|null>(null)
 const [helpOpen,setHelpOpen]=useState(false)

 async function activatePayment(useToken:string){const p=new URLSearchParams(location.search),state=p.get('cv_payment'),order=p.get('order');if(!state||!order)return;const ot=localStorage.getItem(`cv_ai_order_${order}`)||'';history.replaceState({},'',location.pathname);if(state==='failure')throw new Error('El pago no se completó.');if(!ot)throw new Error('No encontramos el comprobante local para validar el pago.');setMessage('Verificando tu pago…');const d=await postCv(CV_API,{action:'activate_payment',token:useToken,order_id:order,order_token:ot});if(d.status!=='approved')throw new Error('El pago todavía está pendiente.');setMessage('Pago aprobado. Ahora vinculá tu cuenta para guardar el tablero.')}
 async function ownerAutoSession(useToken:string){try{const r=await fetch(OWNER_AUTH_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session_token:useToken})});const d=await r.json().catch(()=>null);if(!r.ok||!d?.ok||!d?.token_hash)return null;const verified=await cvAuthClient().auth.verifyOtp({type:'magiclink',token_hash:d.token_hash});if(verified.error)return null;return verified.data.session||null}catch{return null}}

 async function load(){setLoading(true);setError('');try{
   void trackCvEvent('active_opened',{source:'dashboard'},'/busqueda-activa')
   let useToken=localStorage.getItem(SESSION_KEY)||'';setToken(useToken);if(useToken)await activatePayment(useToken)
   const client=cvAuthClient();let {data:a}=await client.auth.getSession();let authSession=a.session
   if(!authSession&&useToken)authSession=await ownerAutoSession(useToken)
   if(!authSession){setLogged(false);const d=await pro({action:'get_resume',token:useToken});setPlan(d.plan||'free');setLoading(false);return}
   setLogged(true);const linked=await accountCall(authSession.access_token,{action:'link',session_token:useToken});if(linked.session_token){useToken=linked.session_token;localStorage.setItem(SESSION_KEY,useToken);setToken(useToken)}setOwner(linked.account?.role==='owner');if(linked.account?.role==='owner')await accountCall(authSession.access_token,{action:'owner_prepare',session_token:useToken})
   let data=await pro({action:'get_resume',token:useToken});setPlan(data.plan||'free');if(!data.resume&&(data.plan==='active'||linked.account?.role==='owner'))await pro({action:'generate_pro',token:useToken});
   const list=await pro({action:'applications',token:useToken});setApps(list.applications||[]);setRemaining(Number(list.remaining||0));setMessage('')
 }catch(e){setError(e instanceof Error?e.message:'No pudimos abrir Búsqueda Activa.')}finally{setLoading(false)}}
 useEffect(()=>{load()},[])

 const grouped=useMemo(()=>Object.fromEntries(columns.map(([key])=>[key,apps.filter(a=>a.status===key)])),[apps])
 async function submit(e:FormEvent){e.preventDefault();if(busy)return;setBusy(true);setError('');setMessage('');void trackCvEvent('active_application_started',{has_job_offer:true},'/busqueda-activa');try{const d=await pro({action:'active_adapt',token,company_name:company,role_name:role,job_text:job});setMessage('Candidatura preparada y validada. La agregamos al tablero.');setCompany('');setRole('');setJob('');void trackCvEvent('active_application_completed',{score:Number(d.match_score||0),remaining:Number(d.remaining||0)},'/busqueda-activa');const list=await pro({action:'applications',token});setApps(list.applications||[]);setRemaining(Number(list.remaining||0));const created=(list.applications||[]).find((a:AppItem)=>a.id===d.application_id);if(created)setSelected(created)}catch(e){setError(e instanceof Error?e.message:'No pudimos preparar esta candidatura.')}finally{setBusy(false)}}
 async function move(app:AppItem,status:string){try{await pro({action:'update_application',token,id:app.id,status});setApps(x=>x.map(a=>a.id===app.id?{...a,status}:a));if(selected?.id===app.id)setSelected({...app,status});void trackCvEvent('application_status_changed',{status},'/busqueda-activa')}catch(e){setError(e instanceof Error?e.message:'No pudimos actualizar el estado.')}}

 if(loading)return <div className={styles.loading}><div><div className={styles.spinner}/><h2>Abriendo tu tablero…</h2><p>Estamos recuperando tu cuenta y tus postulaciones.</p></div></div>
 if(!logged)return <div className={styles.accountGate}><span className={styles.tag}>BÚSQUEDA ACTIVA</span><h2>Ahora sí necesitás una cuenta.</h2><p>El tablero, las versiones adaptadas y el seguimiento tienen que quedar asociados a vos para que puedas volver mañana o desde otro dispositivo. Creá o iniciá sesión con el email que usaste para tu compra.</p>{error&&<div className={styles.error}>{error}</div>}<a href="/cuenta?modo=crear&next=/busqueda-activa">Crear o iniciar sesión</a></div>
 if(plan!=='active'&&!owner)return <div className={styles.accountGate}><h2>Búsqueda Activa no está habilitada.</h2><p>Tu cuenta está lista, pero este plan todavía no figura activo.</p><a href="/mi-cv">Volver a mi CV Pro</a></div>

 return <><section className={styles.hero}><div><span className={styles.tag}>BÚSQUEDA ACTIVA</span><h1>Tu búsqueda, organizada y con estrategia.</h1><p>Cada oferta genera una versión específica basada únicamente en tu experiencia real. Después vos registrás qué pasó y mantenés todo en un solo lugar.</p>{owner&&<span className={styles.ownerTag}>Modo propietario · acceso ilimitado</span>}</div><div className={styles.heroActions}><button className={styles.helpButton} onClick={()=>setHelpOpen(true)}>Chat de ayuda humana</button><div className={styles.counter}><strong>{owner?'∞':remaining}</strong><span>{owner?'pruebas disponibles':'búsquedas disponibles'}</span></div></div></section>{error&&<div className={styles.error}>{error}</div>}{message&&<div className={styles.success}>{message}</div>}<div className={styles.layout}><aside className={styles.formCard}><h2>Nueva oportunidad</h2><p>Pegá el aviso completo. La IA compara el puesto contra tu CV base y prepara una candidatura específica sin inventar experiencia.</p><form className={styles.form} onSubmit={submit}><input value={company} onChange={e=>setCompany(e.target.value)} placeholder="Empresa (opcional)"/><input value={role} onChange={e=>setRole(e.target.value)} placeholder="Puesto" required/><textarea value={job} onChange={e=>setJob(e.target.value)} placeholder="Pegá acá la oferta laboral completa" required/><button className={styles.primary} disabled={busy||(!owner&&remaining<1)}>{busy?'Analizando, redactando y auditando…':'Preparar candidatura'}</button><span className={styles.note}>El resultado pasa por un auditor factual antes de guardarse. En una cuenta común se descuentan sólo las candidaturas generadas correctamente.</span></form></aside><section className={styles.boardWrap}><div className={styles.boardTitle}><h2>Seguimiento</h2><button onClick={()=>load()}>Actualizar</button></div><div className={styles.board}>{columns.map(([key,label])=><div className={styles.column} key={key}><div className={styles.columnHead}><b>{label}</b><span>{grouped[key]?.length||0}</span></div>{(grouped[key]||[]).map((a:AppItem)=><article className={styles.card} key={a.id} onClick={()=>setSelected(a)}><b>{a.role_name}</b><small>{a.company_name||'Empresa no indicada'}</small><small className={styles.match}>Match {a.analysis?.match_score??'—'}%</small><select value={a.status} onClick={e=>e.stopPropagation()} onChange={e=>move(a,e.target.value)}><option value="preparing">Preparando</option><option value="applied">Postulado</option><option value="interview">Entrevista</option><option value="offer">Oferta</option><option value="rejected">No avanzó</option><option value="paused">Pausado</option></select></article>)}{!grouped[key]?.length&&<div className={styles.empty}>Todavía no hay postulaciones acá.</div>}</div>)}</div>{selected&&<section className={styles.detail}><div className={styles.detailTop}><div><h2>{selected.role_name}</h2><p>{selected.company_name||'Empresa no indicada'}</p></div><div className={styles.score}>{selected.analysis?.match_score??'—'}%</div></div><p>{selected.analysis?.verdict}</p><div className={styles.detailGrid}><div className={styles.sub}><h3>Consejos para postularte</h3><ul>{(selected.analysis?.application_tips||[]).map((x:string,i:number)=><li key={i}>{x}</li>)}</ul></div><div className={styles.sub}><h3>Preparación de entrevista</h3>{(selected.interview_pack||[]).map((q:any,i:number)=><div key={i}><p><b>{q.question}</b></p><p>{q.answer_strategy}</p>{q.tip&&<p className={styles.tip}><b>Tip:</b> {q.tip}</p>}</div>)}</div></div></section>}</section></div>
 <HumanHelpChat open={helpOpen} token={token} onClose={()=>setHelpOpen(false)} onNotice={setMessage} onError={setError}/>
 </>
}
