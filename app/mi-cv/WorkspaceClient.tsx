'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import styles from './workspace.module.css'
import { CV_API, CV_PRO_API, SESSION_KEY, authHeaders, cvAuthClient, postCv, trackCvEvent } from '../cv-ia/cvAuth'
import { compressPhotoFile, dataUrlParts, getPendingPhoto, getPendingPhotoSource, savePendingPhoto } from '../cv-ia/photoTools'

const PAY_API='https://wtcntclzcubkbtcsqkzc.supabase.co/functions/v1/cv-ai-purchase'
type Job={company:string;role:string;start_date:string|null;end_date:string|null;bullets:string[]}
type Resume={candidate_name:string;headline:string;contact:{email:string|null;phone:string|null;location:string|null;linkedin:string|null};summary:string;experience:Job[];education:{institution:string;degree:string;date:string|null}[];skills:string[];languages:string[];certifications:string[];cover_message:string;linkedin:{headline:string;about:string;experience_bullets:string[];skills:string[]};interview:{general_tip?:string;questions:{question:string;why:string;answer_strategy:string;tip?:string}[]}}
type Palette='navy'|'graphite'|'violet'|'burgundy'|'forest'|'sand'

async function callPro(body:any){const headers:Record<string,string>={'Content-Type':'application/json',...(await authHeaders())};const r=await fetch(CV_PRO_API,{method:'POST',headers,body:JSON.stringify(body)});const d=await r.json().catch(()=>({ok:false,error:'Respuesta inválida'}));if(!r.ok||!d?.ok)throw new Error(d?.error||'No pudimos completar la operación.');return d}
function esc(v:string){return v.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[m]||m))}
const paletteHex:Record<Palette,{accent:string;side:string}>={navy:{accent:'#1f4b73',side:'#172532'},graphite:{accent:'#46545b',side:'#202427'},violet:{accent:'#6957ff',side:'#1d1a2b'},burgundy:{accent:'#8f2848',side:'#471b2b'},forest:{accent:'#176b5b',side:'#153d35'},sand:{accent:'#a56832',side:'#5b412e'}}
const palettes:Palette[]=['navy','graphite','violet','burgundy','forest','sand']

export default function WorkspaceClient(){
 const [token,setToken]=useState('')
 const [resume,setResume]=useState<Resume|null>(null)
 const [plan,setPlan]=useState('free')
 const [owner,setOwner]=useState(false)
 const [photo,setPhoto]=useState<string|null>(null)
 const [photoNote,setPhotoNote]=useState('')
 const [template,setTemplate]=useState<'modern'|'classic'>('modern')
 const [palette,setPalette]=useState<Palette>('navy')
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
 const highlightedSkills=useMemo(()=>resume?.skills.slice(0,6)||[],[resume])

 async function activatePayment(useToken:string){
   const p=new URLSearchParams(location.search),state=p.get('cv_payment'),order=p.get('order');if(!state||!order)return
   const orderToken=localStorage.getItem(`cv_ai_order_${order}`)||''
   history.replaceState({},'',location.pathname)
   if(state==='failure')throw new Error('El pago no se completó.')
   if(!orderToken)throw new Error('Volviste del pago, pero no encontramos el comprobante local para validarlo.')
   setMessage('Verificando el pago con Mercado Pago…')
   const data=await postCv(CV_API,{action:'activate_payment',token:useToken,order_id:order,order_token:orderToken})
   if(data.status!=='approved')throw new Error('El pago todavía figura pendiente. Volvé a intentar en unos minutos.')
   setMessage('Pago aprobado. Estamos preparando tu espacio CV Pro.')
 }

 async function syncPendingPhoto(useToken:string,pending:string){
   const parts=dataUrlParts(pending);if(!parts)return
   try{await callPro({action:'save_photo',token:useToken,mime:parts.mime,data:parts.data});setPhotoNote('✓ Foto conservada y sincronizada con tu acceso.')}catch{}
 }

 async function load(){
   setLoading(true);setError('')
   try{
     void trackCvEvent('cv_pro_opened',{source:'workspace'},'/mi-cv')
     const {data:auth}=await cvAuthClient().auth.getSession();setLogged(!!auth.session)
     let useToken=localStorage.getItem(SESSION_KEY)||'';setToken(useToken)
     if(!useToken&&!auth.session)throw new Error('No encontramos el análisis previo. Volvé a Postulá Mejor y analizá tu CV primero.')
     if(useToken)await activatePayment(useToken)
     let data=await callPro({action:'get_resume',token:useToken})
     const isOwner=data.account?.role==='owner';setOwner(isOwner)
     if(data.account?.email)setEmail(String(data.account.email))
     setPlan(data.plan||'free');setTemplate(data.preferred_template==='classic'?'classic':'modern')
     const pending=getPendingPhoto(),pendingSource=getPendingPhotoSource()
     if(pending){setPhoto(pending);setPhotoNote(pendingSource==='auto'?'✓ Conservamos automáticamente la foto que encontramos en tu CV.':'✓ Foto optimizada y aplicada en este dispositivo.');if(auth.session)void syncPendingPhoto(useToken,pending)}
     else if(data.photo_url){setPhoto(data.photo_url);setPhotoNote('✓ Foto sincronizada con tu acceso.')}
     else setPhotoNote('Si tu CV tenía foto, intentamos recuperarla automáticamente. Si no aparece, elegila acá y la optimizamos nosotros.')
     const storedPalette=(localStorage.getItem('postula_cv_palette')||'navy') as Palette;if(palettes.includes(storedPalette))setPalette(storedPalette)
     if(!data.resume&&((data.plan==='pro'||data.plan==='active')||isOwner)){
       setMessage('Redactando la versión final y pasándola por el control factual…')
       data=await callPro({action:'generate_pro',token:useToken})
       setQuality(Number(data.quality?.confidence||100));if(!pending&&data.photo_url)setPhoto(data.photo_url);void trackCvEvent('cv_pro_generated',{plan:isOwner?'owner':data.plan||'pro'},'/mi-cv')
     }
     if(!data.resume)throw new Error('Tu plan todavía no está habilitado para generar CV Pro.')
     setResume(data.resume);if(data.quality?.confidence)setQuality(Number(data.quality.confidence));setMessage('')
   }catch(e){setError(e instanceof Error?e.message:'No pudimos abrir tu CV.')}finally{setLoading(false)}
 }
 useEffect(()=>{load()},[])

 async function chooseTemplate(t:'modern'|'classic'){setTemplate(t);try{await callPro({action:'select_template',token,template:t})}catch{}}
 function choosePalette(p:Palette){setPalette(p);localStorage.setItem('postula_cv_palette',p);void trackCvEvent('palette_changed',{palette:p},'/mi-cv')}
 async function uploadPhoto(file:File){
   setError('');setPhotoNote('Optimizando la foto…')
   try{
     const optimized=await compressPhotoFile(file)
     savePendingPhoto(optimized,'manual');setPhoto(optimized);setPhotoNote('✓ Foto optimizada automáticamente. No tenés que achicarla ni comprimirla vos.')
     void trackCvEvent('photo_uploaded',{file_type:file.type,source:'manual'},'/mi-cv')
     if(logged){
       const parts=dataUrlParts(optimized)
       if(parts){try{await callPro({action:'save_photo',token,mime:parts.mime,data:parts.data});setPhotoNote('✓ Foto optimizada, aplicada y sincronizada con tu acceso.')}catch{setPhotoNote('✓ Foto aplicada en este dispositivo. La sincronizaremos cuando tu acceso esté disponible.')}}
     }
   }catch(e){setError(e instanceof Error?e.message:'No pudimos preparar la foto. Probá con JPG, PNG o WEBP.')}
 }
 function printCv(){setTab('cv');void trackCvEvent('cv_pdf_downloaded',{},'/mi-cv');window.setTimeout(()=>window.print(),100)}
 function downloadWord(){if(!resume)return;void trackCvEvent('cv_word_downloaded',{},'/mi-cv');const jobs=resume.experience.map(j=>`<h3>${esc(j.role)} · ${esc(j.company)}</h3><small>${esc([j.start_date,j.end_date].filter(Boolean).join(' — '))}</small><ul>${j.bullets.map(b=>`<li>${esc(b)}</li>`).join('')}</ul>`).join('');const theme=paletteHex[palette];const photoHtml=photo?`<img src="${photo}" style="width:105px;height:105px;object-fit:cover;border-radius:12px;float:right;margin:0 0 15px 18px"/>`:'';const html=`<html><head><meta charset="utf-8"><style>body{font-family:Arial;color:#17191d;max-width:760px;margin:35px auto}h1{font-size:30px}h2{font-size:14px;border-bottom:1px solid #bbb}p,li{font-size:11px;line-height:1.5}.accent{color:${theme.accent}}</style></head><body>${photoHtml}<h1>${esc(resume.candidate_name)}</h1><p class="accent"><b>${esc(resume.headline)}</b></p><p>${esc(contact)}</p><h2>Perfil profesional</h2><p>${esc(resume.summary)}</p><h2>Experiencia</h2>${jobs}<h2>Formación</h2>${resume.education.map(e=>`<p><b>${esc(e.degree)}</b> · ${esc(e.institution)} ${e.date?esc(e.date):''}</p>`).join('')}<h2>Habilidades destacadas</h2><p>${highlightedSkills.map(esc).join(' · ')}</p></body></html>`;const blob=new Blob([html],{type:'application/msword;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`CV-${resume.candidate_name.replace(/[^a-z0-9]+/gi,'-')}.doc`;a.click();URL.revokeObjectURL(url)}
 async function copy(text:string){try{await navigator.clipboard.writeText(text);setMessage('Copiado al portapapeles.')}catch{}}
 function changeTab(next:'cv'|'linkedin'|'carta'|'entrevista'){setTab(next);void trackCvEvent('workspace_tab_view',{tab:next},'/mi-cv');window.setTimeout(()=>document.querySelector('[data-workspace-tabs]')?.scrollIntoView({behavior:'smooth',block:'start'}),50)}
 async function startUpgrade(e:FormEvent){e.preventDefault();setError('');if(owner){setUpgrade(false);void trackCvEvent('plan_clicked',{plan:'active',source:'owner'},'/mi-cv');window.location.href='/busqueda-activa';return}setCheckoutBusy(true);try{const status=await postCv(CV_API,{action:'status',token});const d=await postCv(`${PAY_API}?action=checkout`,{plan:'active',email:email.trim(),session_id:status.session.id,return_url:'https://postulamejor.com/busqueda-activa'});localStorage.setItem(`cv_ai_order_${d.order_id}`,d.order_token);void trackCvEvent('checkout_started',{plan:'active'},'/mi-cv');const popup=window.open(d.init_point,'_blank','noopener,noreferrer');if(!popup)location.href=d.init_point;else{setCheckoutBusy(false);setUpgrade(false);setMessage('Abrimos Mercado Pago en otra pestaña. Esta página queda abierta para que no pierdas tu CV.')}}catch(e){setError(e instanceof Error?e.message:'No pudimos abrir Mercado Pago.');setCheckoutBusy(false)}}

 if(loading)return <div className={styles.loading}><div><div className={styles.spinner}/><h2>Preparando tu espacio CV Pro…</h2><p>Estamos armando el CV y verificando que la redacción siga siendo fiel a tu experiencia.</p></div></div>
 if(error&&!resume)return <div className={styles.error}>{error} <a href="/" style={{color:'inherit',fontWeight:800}}>Volver al inicio</a></div>
 if(!resume)return null

 const paletteClass=palette==='graphite'?styles.paletteGraphite:palette==='violet'?styles.paletteViolet:palette==='burgundy'?styles.paletteBurgundy:palette==='forest'?styles.paletteForest:palette==='sand'?styles.paletteSand:styles.paletteNavy
 const ResumeBody=()=> <><h2 className={styles.sectionTitle}>Perfil profesional</h2><p className={styles.summary}>{resume.summary}</p><h2 className={styles.sectionTitle}>Experiencia</h2>{resume.experience.map((j,i)=><article className={styles.job} key={`${j.company}-${i}`}><h3>{j.role} · {j.company}</h3><small>{[j.start_date,j.end_date].filter(Boolean).join(' — ')}</small><ul>{j.bullets.map((b,k)=><li key={k}>{b}</li>)}</ul></article>)}<h2 className={styles.sectionTitle}>Formación</h2>{resume.education.map((e,i)=><article className={styles.job} key={i}><h3>{e.degree}</h3><small>{e.institution}{e.date?` · ${e.date}`:''}</small></article>)}</>

 return <>
  <section className={styles.hero}><div><span>TU ESPACIO CV PRO</span><h1>Tu candidatura ya está lista.</h1><p>Revisala, elegí diseño y color, y guardala. La redacción fue comparada contra los hechos de tu CV antes de entregarse.</p></div>{quality!==null&&<div className={styles.quality}>✓ Control factual aprobado · {quality}%</div>}</section>
  {owner&&<div className={styles.ownerBanner}>Modo propietario · CV Pro y Búsqueda Activa desbloqueados para pruebas.</div>}
  {error&&<div className={styles.error} style={{marginBottom:14}}>{error}</div>}{message&&<div className={styles.accountNudge} style={{marginBottom:14}}>{message}</div>}
  <div className={styles.grid}><div className={styles.workspaceMain}>
   <div className={styles.workspaceGuide}><div className={styles.guideArrow}>↓</div><div><b>Hay más que el CV final</b><span>Cuando termines de revisarlo, más abajo vas a encontrar tu LinkedIn, el mensaje para postularte y la preparación de entrevista.</span></div></div>
   <div className={styles.resumeWrap}><div className={`${styles.resume} ${template==='modern'?styles.modern:styles.classic} ${paletteClass}`}>
    {template==='modern'?<><aside className={styles.modernSide}>{photo&&<img src={photo} className={styles.photo} alt="Foto del candidato"/>}<h4>Contacto</h4><p>{resume.contact.email}<br/>{resume.contact.phone}<br/>{resume.contact.location}<br/>{resume.contact.linkedin}</p><h4>Habilidades destacadas</h4><ul>{highlightedSkills.map(s=><li key={s}>{s}</li>)}</ul>{resume.languages.length>0&&<><h4>Idiomas</h4><ul>{resume.languages.map(s=><li key={s}>{s}</li>)}</ul></>}{resume.certifications.length>0&&<><h4>Certificaciones</h4><ul>{resume.certifications.slice(0,5).map(s=><li key={s}>{s}</li>)}</ul></>}</aside><section className={styles.modernMain}><h1 className={styles.name}>{resume.candidate_name}</h1><p className={styles.headline}>{resume.headline}</p><ResumeBody/></section></>:<section className={styles.classicBody}><header className={styles.classicHead}>{photo&&<img src={photo} className={styles.photo} alt="Foto del candidato"/>}<h1 className={styles.name}>{resume.candidate_name}</h1><p className={styles.headline}>{resume.headline}</p><p className={styles.classicContact}>{contact}</p></header><ResumeBody/><h2 className={styles.sectionTitle}>Habilidades destacadas</h2><p className={styles.summary}>{highlightedSkills.join(' · ')}</p></section>}
   </div></div>
   <div className={styles.tabs} data-workspace-tabs><button data-tab="cv" data-on={tab==='cv'} onClick={()=>changeTab('cv')}>CV final</button><button data-tab="linkedin" data-on={tab==='linkedin'} onClick={()=>changeTab('linkedin')}>LinkedIn</button><button data-tab="carta" data-on={tab==='carta'} onClick={()=>changeTab('carta')}>Postulación</button><button data-tab="entrevista" data-on={tab==='entrevista'} onClick={()=>changeTab('entrevista')}>Entrevista</button></div>
   {tab==='cv'&&<div className={styles.tabHint}>Estás viendo tu CV final. Usá los otros botones para completar el resto de tu candidatura.</div>}
   {tab==='linkedin'&&<section className={styles.extra}><h2>LinkedIn listo para copiar</h2><p className={styles.leadText}>Vos decidís qué actualizar; no entramos a tu cuenta.</p><div className={styles.copy}><b>Titular</b><p className={styles.importantText}>{resume.linkedin.headline}</p><button onClick={()=>copy(resume.linkedin.headline)}>Copiar</button></div><div className={styles.copy}><b>Acerca de</b><p>{resume.linkedin.about}</p><button onClick={()=>copy(resume.linkedin.about)}>Copiar</button></div><h3>Experiencia</h3><ul>{resume.linkedin.experience_bullets.map((x,i)=><li key={i}>{x}</li>)}</ul></section>}
   {tab==='carta'&&<section className={styles.extra}><h2>Mensaje de postulación</h2><p>{resume.cover_message}</p><button onClick={()=>copy(resume.cover_message)}>Copiar mensaje</button></section>}
   {tab==='entrevista'&&<section className={styles.extra}><h2>Preparación de entrevista</h2>{resume.interview.general_tip&&<p className={styles.tip}><b>Tip general:</b> {resume.interview.general_tip}</p>}{resume.interview.questions.map((q,i)=><div className={styles.copy} key={i}><b>{i+1}. {q.question}</b><p><strong>Por qué puede aparecer:</strong> {q.why}</p><p><strong>Cómo encararla:</strong> {q.answer_strategy}</p>{q.tip&&<p className={styles.tip}><b>Tip:</b> {q.tip}</p>}</div>)}</section>}
   {!logged&&<div className={styles.saveAccess}><div><b>¿Querés guardar tu CV y acceder desde cualquier dispositivo?</b><span>Crear acceso es opcional en CV Pro. Si después activás Búsqueda Activa, esta misma cuenta ya te sirve y sólo vas a tener que contratar el plan.</span></div><a href="/cuenta?modo=crear&next=/mi-cv">Guardar mi CV y crear acceso</a></div>}
  </div><aside className={styles.panel}><section className={styles.box}><h3>Personalizá tu CV</h3><p>El contenido se mantiene. Vos elegís la presentación.</p><h4 className={styles.controlTitle}>Diseño</h4><div className={styles.templateBtns}><button data-on={template==='modern'} onClick={()=>chooseTemplate('modern')}>Moderno</button><button data-on={template==='classic'} onClick={()=>chooseTemplate('classic')}>Clásico</button></div><h4 className={styles.controlTitle}>Color</h4><div className={styles.paletteBtns}><button aria-label="Azul profesional" title="Azul profesional" data-on={palette==='navy'} onClick={()=>choosePalette('navy')}><i className={styles.swatchNavy}/><span>Azul</span></button><button aria-label="Grafito" title="Grafito" data-on={palette==='graphite'} onClick={()=>choosePalette('graphite')}><i className={styles.swatchGraphite}/><span>Grafito</span></button><button aria-label="Violeta" title="Violeta" data-on={palette==='violet'} onClick={()=>choosePalette('violet')}><i className={styles.swatchViolet}/><span>Violeta</span></button><button aria-label="Bordó" title="Bordó" data-on={palette==='burgundy'} onClick={()=>choosePalette('burgundy')}><i className={styles.swatchBurgundy}/><span>Bordó</span></button><button aria-label="Verde petróleo" title="Verde petróleo" data-on={palette==='forest'} onClick={()=>choosePalette('forest')}><i className={styles.swatchForest}/><span>Verde</span></button><button aria-label="Arena y cobre" title="Arena y cobre" data-on={palette==='sand'} onClick={()=>choosePalette('sand')}><i className={styles.swatchSand}/><span>Arena</span></button></div><label className={styles.photoLabel}>Conservar mi foto<input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f)uploadPhoto(f)}}/><span>{photoNote}</span><small>Podés elegir una foto de varios MB: la reducimos automáticamente sin que tengas que hacer nada.</small></label><div className={styles.actions}><button onClick={printCv}>Guardar como PDF</button><button onClick={downloadWord}>Descargar para Word</button></div></section><section className={`${styles.box} ${styles.upgrade}`}><h3>{plan==='active'||owner?'Llevá este CV a búsquedas reales.':'Ahora llevá este CV a búsquedas reales.'}</h3><p>{plan==='active'||owner?'Tu acceso a Búsqueda Activa está disponible. Prepará versiones específicas y seguí cada postulación.':'Con Búsqueda Activa adaptamos este CV a hasta 10 ofertas y te damos un tablero de seguimiento durante 30 días.'}</p>{plan==='active'||owner?<a href="/busqueda-activa" onClick={()=>void trackCvEvent('plan_clicked',{plan:'active',source:owner?'owner':'included'},'/mi-cv')}>Abrir Búsqueda Activa</a>:<button onClick={()=>{setUpgrade(true);void trackCvEvent('plan_clicked',{plan:'active'},'/mi-cv')}}>Activar Búsqueda Activa</button>}</section></aside></div>
  {upgrade&&<div className={styles.modal}><form className={styles.modalCard} onSubmit={startUpgrade}><h3>Pasar a Búsqueda Activa</h3><p>{logged?'Tu acceso ya está creado. Sólo falta activar Búsqueda Activa con el pago.':'Usá el email que querés asociar a tu compra. Después te pediremos crear o iniciar sesión para guardar tu tablero.'}</p><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com"/><div className={styles.modalBtns}><button type="button" onClick={()=>setUpgrade(false)}>Cancelar</button><button disabled={checkoutBusy}>{checkoutBusy?'Abriendo pago…':'Continuar · $12.900'}</button></div></form></div>}
 </>
}
