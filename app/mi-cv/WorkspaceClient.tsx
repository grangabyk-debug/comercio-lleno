'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import styles from './workspace.module.css'
import { CV_API, CV_PRO_API, SESSION_KEY, authHeaders, cvAuthClient, postCv } from '../cv-ia/cvAuth'

const PAY_API='https://wtcntclzcubkbtcsqkzc.supabase.co/functions/v1/cv-ai-purchase'
type Job={company:string;role:string;start_date:string|null;end_date:string|null;bullets:string[]}
type Resume={candidate_name:string;headline:string;contact:{email:string|null;phone:string|null;location:string|null;linkedin:string|null};summary:string;experience:Job[];education:{institution:string;degree:string;date:string|null}[];skills:string[];languages:string[];certifications:string[];cover_message:string;linkedin:{headline:string;about:string;experience_bullets:string[];skills:string[]};interview:{general_tip?:string;questions:{question:string;why:string;answer_strategy:string;tip?:string}[]}}

async function callPro(body:any){const headers:Record<string,string>={'Content-Type':'application/json',...(await authHeaders())};const r=await fetch(CV_PRO_API,{method:'POST',headers,body:JSON.stringify(body)});const d=await r.json().catch(()=>({ok:false,error:'Respuesta inválida'}));if(!r.ok||!d?.ok)throw new Error(d?.error||'No pudimos completar la operación.');return d}
function toBase64(file:File){return new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error('No pudimos leer la foto.'));reader.onload=()=>resolve(String(reader.result||'').split(',')[1]||'');reader.readAsDataURL(file)})}
function esc(v:string){return v.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]||m))}

export default function WorkspaceClient(){
 const [token,setToken]=useState('')
 const [resume,setResume]=useState<Resume|null>(null)
 const [plan,setPlan]=useState('free')
 const [photo,setPhoto]=useState<string|null>(null)
 const [template,setTemplate]=useState<'modern'|'classic'>('modern')
 const [quality,setQuality]=useState<number|null>(null)
 const [loading,setLoading]=useState(true)
 const [error,setError]=useState('')
 const [message,setMessage]=useState('')
 const [tab,setTab]=useState<'cv'|'linkedin'|'carta'|'entrevista'>('cv')
 const [logged,setLogged]=useState(false)
 const [upgrade,setUpgrade]=useState(false)
 const [email,setEmail]=useState('')
 const [checkoutBusy,setCheckoutBusy]=useState(false)

 const contact=useMemo(()=>resume?[resume.contact.email,resume.contact.phone,resume.contact.location,resume.contact.linkedin].filter(Boolean).join(' · '):'',[resume])

 async function activatePayment(useToken:string){
   const p=new URLSearchParams(location.search),state=p.get('cv_payment'),order=p.get('order');if(!state||!order)return
   const orderToken=localStorage.getItem(`cv_ai_order_${order}`)||''
   history.replaceState({},'',location.pathname)
   if(state==='failure')throw new Error('El pago no se completó.')
   if(!orderToken)throw new Error('Volviste del pago, pero no encontramos el comprobante local para validarlo.')
   setMessage('Verificando el pago con Mercado Pago…')
   const data=await postCv(CV_API,{action:'activate_payment',token:useToken,order_id:order,order_token:orderToken})
   if(data.status!=='approved')throw new Error('El pago todavía figura pendiente. Volvé a intentar en unos minutos.')
   setMessage('Pago aprobado. Estamos preparando tu CV Pro.')
 }

 async function load(){
   setLoading(true);setError('')
   try{
     const {data:auth}=await cvAuthClient().auth.getSession();setLogged(!!auth.session)
     let useToken=localStorage.getItem(SESSION_KEY)||'';setToken(useToken)
     if(!useToken&&!auth.session)throw new Error('No encontramos el análisis previo. Volvé a Postulá Mejor y analizá tu CV primero.')
     if(useToken)await activatePayment(useToken)
     let data=await callPro({action:'get_resume',token:useToken})
     setPlan(data.plan||'free');setTemplate(data.preferred_template==='classic'?'classic':'modern');setPhoto(data.photo_url||null)
     if(!data.resume&&(data.plan==='pro'||data.plan==='active')){
       setMessage('Redactando la versión final y pasándola por el control factual…')
       data=await callPro({action:'generate_pro',token:useToken})
       setQuality(Number(data.quality?.confidence||100));setPhoto(data.photo_url||null)
     }
     if(!data.resume)throw new Error('Tu plan todavía no está habilitado para generar CV Pro.')
     setResume(data.resume);if(data.quality?.confidence)setQuality(Number(data.quality.confidence));setMessage('')
   }catch(e){setError(e instanceof Error?e.message:'No pudimos abrir tu CV.')}finally{setLoading(false)}
 }
 useEffect(()=>{load()},[])

 async function chooseTemplate(t:'modern'|'classic'){setTemplate(t);try{await callPro({action:'select_template',token,template:t})}catch{}}
 async function uploadPhoto(file:File){setError('');try{if(file.size>1048576)throw new Error('La foto debe pesar menos de 1 MB.');const data=await callPro({action:'save_photo',token,mime:file.type,data:await toBase64(file)});setPhoto(data.photo_url);setMessage('Foto guardada en forma privada y aplicada al diseño moderno.')}catch(e){setError(e instanceof Error?e.message:'No pudimos guardar la foto.')}}
 function printCv(){setTab('cv');window.setTimeout(()=>window.print(),100)}
 function downloadWord(){if(!resume)return;const jobs=resume.experience.map(j=>`<h3>${esc(j.role)} · ${esc(j.company)}</h3><small>${esc([j.start_date,j.end_date].filter(Boolean).join(' — '))}</small><ul>${j.bullets.map(b=>`<li>${esc(b)}</li>`).join('')}</ul>`).join('');const html=`<html><head><meta charset="utf-8"><style>body{font-family:Arial;color:#17191d;max-width:760px;margin:35px auto}h1{font-size:30px}h2{font-size:14px;border-bottom:1px solid #bbb}p,li{font-size:11px;line-height:1.5}.violet{color:#6957ff}</style></head><body><h1>${esc(resume.candidate_name)}</h1><p class="violet"><b>${esc(resume.headline)}</b></p><p>${esc(contact)}</p><h2>Perfil profesional</h2><p>${esc(resume.summary)}</p><h2>Experiencia</h2>${jobs}<h2>Formación</h2>${resume.education.map(e=>`<p><b>${esc(e.degree)}</b> · ${esc(e.institution)} ${e.date?esc(e.date):''}</p>`).join('')}<h2>Habilidades</h2><p>${resume.skills.map(esc).join(' · ')}</p></body></html>`;const blob=new Blob([html],{type:'application/msword;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`CV-${resume.candidate_name.replace(/[^a-z0-9]+/gi,'-')}.doc`;a.click();URL.revokeObjectURL(url)}
 async function copy(text:string){try{await navigator.clipboard.writeText(text);setMessage('Copiado al portapapeles.')}catch{}}
 async function startUpgrade(e:FormEvent){e.preventDefault();setCheckoutBusy(true);setError('');try{const status=await postCv(CV_API,{action:'status',token});const d=await postCv(`${PAY_API}?action=checkout`,{plan:'active',email:email.trim(),session_id:status.session.id,return_url:'https://postulamejor.com/busqueda-activa'});localStorage.setItem(`cv_ai_order_${d.order_id}`,d.order_token);location.href=d.init_point}catch(e){setError(e instanceof Error?e.message:'No pudimos abrir Mercado Pago.');setCheckoutBusy(false)}}

 if(loading)return <div className={styles.loading}><div><div className={styles.spinner}/><h2>Preparando tu espacio…</h2><p>No te mandamos a una sección vacía: cuando termine, vas a entrar directamente a tu CV final y sus herramientas.</p></div></div>
 if(error&&!resume)return <div className={styles.error}>{error} <a href="/" style={{color:'inherit',fontWeight:800}}>Volver al inicio</a></div>
 if(!resume)return null

 const ResumeBody=()=> <><h2 className={styles.sectionTitle}>Perfil profesional</h2><p className={styles.summary}>{resume.summary}</p><h2 className={styles.sectionTitle}>Experiencia</h2>{resume.experience.map((j,i)=><article className={styles.job} key={`${j.company}-${i}`}><h3>{j.role} · {j.company}</h3><small>{[j.start_date,j.end_date].filter(Boolean).join(' — ')}</small><ul>{j.bullets.map((b,k)=><li key={k}>{b}</li>)}</ul></article>)}<h2 className={styles.sectionTitle}>Formación</h2>{resume.education.map((e,i)=><article className={styles.job} key={i}><h3>{e.degree}</h3><small>{e.institution}{e.date?` · ${e.date}`:''}</small></article>)}</>

 return <>
  <section className={styles.hero}><div><span>CV PRO</span><h1>Tu candidatura ya está lista.</h1><p>Revisala, elegí el diseño que más te represente y guardala. La redacción fue comparada contra los hechos de tu CV antes de entregarse.</p></div>{quality!==null&&<div className={styles.quality}>✓ Control factual aprobado · {quality}%</div>}</section>
  {error&&<div className={styles.error} style={{marginBottom:14}}>{error}</div>}{message&&<div className={styles.accountNudge} style={{marginBottom:14}}>{message}</div>}
  <div className={styles.grid}><div><div className={styles.resumeWrap}><div className={`${styles.resume} ${template==='modern'?styles.modern:styles.classic}`}>
    {template==='modern'?<><aside className={styles.modernSide}>{photo&&<img src={photo} className={styles.photo} alt="Foto del candidato"/>}<h4>Contacto</h4><p>{resume.contact.email}<br/>{resume.contact.phone}<br/>{resume.contact.location}<br/>{resume.contact.linkedin}</p><h4>Habilidades</h4><ul>{resume.skills.map(s=><li key={s}>{s}</li>)}</ul>{resume.languages.length>0&&<><h4>Idiomas</h4><ul>{resume.languages.map(s=><li key={s}>{s}</li>)}</ul></>}{resume.certifications.length>0&&<><h4>Certificaciones</h4><ul>{resume.certifications.map(s=><li key={s}>{s}</li>)}</ul></>}</aside><section className={styles.modernMain}><h1 className={styles.name}>{resume.candidate_name}</h1><p className={styles.headline}>{resume.headline}</p><ResumeBody/></section></>:<section className={styles.classicBody}><header className={styles.classicHead}>{photo&&<img src={photo} className={styles.photo} alt="Foto del candidato"/>}<h1 className={styles.name}>{resume.candidate_name}</h1><p className={styles.headline}>{resume.headline}</p><p className={styles.classicContact}>{contact}</p></header><ResumeBody/><h2 className={styles.sectionTitle}>Habilidades</h2><p className={styles.summary}>{resume.skills.join(' · ')}</p></section>}
   </div></div>
   <div className={styles.tabs}><button data-on={tab==='cv'} onClick={()=>setTab('cv')}>CV final</button><button data-on={tab==='linkedin'} onClick={()=>setTab('linkedin')}>LinkedIn</button><button data-on={tab==='carta'} onClick={()=>setTab('carta')}>Postulación</button><button data-on={tab==='entrevista'} onClick={()=>setTab('entrevista')}>Entrevista</button></div>
   {tab==='linkedin'&&<section className={styles.extra}><h2>LinkedIn listo para copiar</h2><p>Vos decidís qué actualizar; no entramos a tu cuenta.</p><div className={styles.copy}><b>Titular</b><p>{resume.linkedin.headline}</p><button onClick={()=>copy(resume.linkedin.headline)}>Copiar</button></div><div className={styles.copy}><b>Acerca de</b><p>{resume.linkedin.about}</p><button onClick={()=>copy(resume.linkedin.about)}>Copiar</button></div><h3>Experiencia</h3><ul>{resume.linkedin.experience_bullets.map((x,i)=><li key={i}>{x}</li>)}</ul></section>}
   {tab==='carta'&&<section className={styles.extra}><h2>Mensaje de postulación</h2><p>{resume.cover_message}</p><button onClick={()=>copy(resume.cover_message)}>Copiar mensaje</button></section>}
   {tab==='entrevista'&&<section className={styles.extra}><h2>Preparación de entrevista</h2>{resume.interview.general_tip&&<p className={styles.tip}><b>Tip general:</b> {resume.interview.general_tip}</p>}{resume.interview.questions.map((q,i)=><div className={styles.copy} key={i}><b>{i+1}. {q.question}</b><p><strong>Por qué puede aparecer:</strong> {q.why}</p><p><strong>Cómo encararla:</strong> {q.answer_strategy}</p>{q.tip&&<p className={styles.tip}><b>Tip:</b> {q.tip}</p>}</div>)}</section>}
   {!logged&&<div className={styles.accountNudge}>Tu CV Pro funciona sin obligarte a crear una cuenta. Si después activás Búsqueda Activa, te vamos a pedir una para guardar el tablero y que puedas volver desde cualquier dispositivo. <a href="/cuenta?modo=crear">Crear cuenta ahora</a>.</div>}
  </div><aside className={styles.panel}><section className={styles.box}><h3>Elegí tu diseño</h3><p>El contenido es el mismo; cambia la forma de presentarlo.</p><div className={styles.templateBtns}><button data-on={template==='modern'} onClick={()=>chooseTemplate('modern')}>Moderno</button><button data-on={template==='classic'} onClick={()=>chooseTemplate('classic')}>Clásico</button></div><label className={styles.photoLabel}>Conservar mi foto<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const f=e.target.files?.[0];if(f)uploadPhoto(f)}}/><span>{photo?'✓ Foto aplicada':'Si tu CV original tenía foto, subila acá. La guardamos privada.'}</span></label><div className={styles.actions}><button onClick={printCv}>Guardar como PDF</button><button onClick={downloadWord}>Descargar para Word</button></div></section><section className={`${styles.box} ${styles.upgrade}`}><h3>{plan==='active'?'Búsqueda Activa ya está incluida':'Ahora llevá este CV a búsquedas reales.'}</h3><p>{plan==='active'?'Prepará versiones específicas, entrevistas y seguimiento de cada postulación.':'Con Búsqueda Activa adaptamos este CV a hasta 10 ofertas y te damos un tablero de seguimiento durante 30 días.'}</p>{plan==='active'?<a href="/busqueda-activa">Abrir Búsqueda Activa</a>:<button onClick={()=>setUpgrade(true)}>Activar Búsqueda Activa</button>}</section></aside></div>
  {upgrade&&<div className={styles.modal}><form className={styles.modalCard} onSubmit={startUpgrade}><h3>Pasar a Búsqueda Activa</h3><p>Usá el email que querés asociar a tu compra. Después te pediremos crear o iniciar sesión para guardar tu tablero.</p><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com"/><div className={styles.modalBtns}><button type="button" onClick={()=>setUpgrade(false)}>Cancelar</button><button disabled={checkoutBusy}>{checkoutBusy?'Abriendo pago…':'Continuar · $12.900'}</button></div></form></div>}
 </>
}
