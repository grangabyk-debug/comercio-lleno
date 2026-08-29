'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import styles from './cv-ia-production.module.css'
import {CV_API} from './cvAuth'

const PAY_API='https://wtcntclzcubkbtcsqkzc.supabase.co/functions/v1/cv-ai-purchase'
const SESSION_KEY='cv_ai_session_token_v1'

type Perspective={score:number;verdict:string;interview_decision:string;strengths:string[];issues:{severity:'high'|'medium'|'low';title:string;explanation:string;fix:string}[];missing_keywords:string[]}
type Diagnostic={score:number;ats:Perspective;recruiter:Perspective;manager:Perspective;issues:Perspective['issues'];summary:string;target_role:string|null;job_specific:boolean}
type Experience={company:string;role:string;start_date:string|null;end_date:string|null;bullets:string[]}
type ResumePackage={candidate_name:string;headline:string;contact:{email:string|null;phone:string|null;location:string|null;linkedin:string|null};summary:string;experience:Experience[];education:{institution:string;degree:string;date:string|null}[];skills:string[];languages:string[];certifications:string[];cover_message:string;linkedin:{headline:string;about:string;experience_bullets:string[];skills:string[]};interview:{questions:{question:string;why:string;answer_strategy:string}[]}}
type SessionState={id:string;plan:'free'|'pro'|'active';entitlement_until:string|null;free_analyses_used:number;active_searches_used:number;has_master_resume:boolean;last_diagnostic?:Diagnostic|null}
type PublicComment={id:string;display_name:string;role_label:string|null;rating:number;body:string;created_at:string}
type Application={id:string;company_name:string|null;role_name:string;status:string;analysis:any;created_at:string;updated_at:string}

type PlanName='pro'
const plans=[
 {name:'Diagnóstico',price:'$0',suffix:'',badge:'PARA EMPEZAR',features:['Score general real','Triple Filtro IA','Mejoras prioritarias','Compatibilidad con una búsqueda'],cta:'Analizar gratis',highlight:false,plan:null},
 {name:'CV Pro+',price:'$5.990',suffix:' / 30 días',badge:'MÁS ELEGIDO',features:['Todo el diagnóstico','CV reescrito sin inventar experiencia','Versión adaptada a un puesto','Carta o mensaje de postulación','LinkedIn: textos optimizados listos para copiar'],cta:'Quiero mi CV Pro+',highlight:true,plan:'pro' as PlanName},
]

async function postJson(url:string,body:any){
 const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
 const data=await response.json().catch(()=>({ok:false,error:'Respuesta inválida del servidor.'}))
 if(!response.ok||!data?.ok)throw new Error(data?.error||'No pudimos completar la operación.')
 return data
}
function fileToBase64(file:File){return new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error('No pudimos leer el archivo.'));reader.onload=()=>{const value=String(reader.result||'');resolve(value.includes(',')?value.split(',')[1]:value)};reader.readAsDataURL(file)})}
function safeText(value:string|null|undefined){return value?.trim()||''}
function escapeHtml(value:string){return value.replace(/[&<>"']/g,(m)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]||m))}
function resumeHtml(r:ResumePackage){
 const contact=[r.contact.email,r.contact.phone,r.contact.location,r.contact.linkedin].filter(Boolean).map(String).join(' · ')
 const exp=r.experience.map(x=>`<section><h3>${escapeHtml(x.role)} · ${escapeHtml(x.company)}</h3><small>${escapeHtml([x.start_date,x.end_date].filter(Boolean).join(' — '))}</small><ul>${x.bullets.map(b=>`<li>${escapeHtml(b)}</li>`).join('')}</ul></section>`).join('')
 const edu=r.education.map(x=>`<li><b>${escapeHtml(x.degree)}</b> · ${escapeHtml(x.institution)} ${x.date?`(${escapeHtml(x.date)})`:''}</li>`).join('')
 return `<!doctype html><html><head><meta charset="utf-8"><title>CV ${escapeHtml(r.candidate_name)}</title><style>body{font-family:Arial,sans-serif;color:#17191d;max-width:780px;margin:40px auto;padding:0 24px;line-height:1.42}h1{font-size:32px;margin:0}h2{font-size:15px;margin:24px 0 8px;border-bottom:1px solid #ddd;padding-bottom:5px}h3{font-size:13px;margin:15px 0 2px}p,li{font-size:11.5px}small{font-size:10px;color:#666}.headline{color:#5b49df;font-weight:700}.contact{font-size:10px;color:#666}.skills{font-size:11px}</style></head><body><h1>${escapeHtml(r.candidate_name)}</h1><p class="headline">${escapeHtml(r.headline)}</p><p class="contact">${escapeHtml(contact)}</p><h2>Perfil profesional</h2><p>${escapeHtml(r.summary)}</p><h2>Experiencia</h2>${exp}<h2>Formación</h2><ul>${edu}</ul><h2>Habilidades</h2><p class="skills">${r.skills.map(escapeHtml).join(' · ')}</p>${r.languages.length?`<h2>Idiomas</h2><p>${r.languages.map(escapeHtml).join(' · ')}</p>`:''}${r.certifications.length?`<h2>Certificaciones</h2><p>${r.certifications.map(escapeHtml).join(' · ')}</p>`:''}</body></html>`
}

export default function CvIaExperience(){
 const fileRef=useRef<HTMLInputElement>(null)
 const initialized=useRef(false)
 const [file,setFile]=useState<File|null>(null)
 const [targetRole,setTargetRole]=useState('')
 const [jobText,setJobText]=useState('')
 const [token,setToken]=useState('')
 const [session,setSession]=useState<SessionState|null>(null)
 const [diagnostic,setDiagnostic]=useState<Diagnostic|null>(null)
 const [analyzing,setAnalyzing]=useState(false)
 const [progress,setProgress]=useState(0)
 const [notice,setNotice]=useState('')
 const [error,setError]=useState('')
 const [checkoutPlan,setCheckoutPlan]=useState<PlanName|null>(null)
 const [checkoutEmail,setCheckoutEmail]=useState('')
 const [checkoutBusy,setCheckoutBusy]=useState(false)
 const [resume,setResume]=useState<ResumePackage|null>(null)
 const [generating,setGenerating]=useState(false)
 const [quality,setQuality]=useState<number|null>(null)
 const [tab,setTab]=useState<'cv'|'linkedin'|'carta'|'entrevista'>('cv')
 const [comments,setComments]=useState<PublicComment[]>([])
 const [commentName,setCommentName]=useState('')
 const [commentRole,setCommentRole]=useState('')
 const [commentText,setCommentText]=useState('')
 const [commentRating,setCommentRating]=useState(5)
 const [commentNotice,setCommentNotice]=useState('')
 const [applications,setApplications]=useState<Application[]>([])
 const [activeCompany,setActiveCompany]=useState('')
 const [activeRole,setActiveRole]=useState('')
 const [activeJob,setActiveJob]=useState('')
 const [activeBusy,setActiveBusy]=useState(false)
 const [activeResult,setActiveResult]=useState<any>(null)

 const ready=useMemo(()=>Boolean(file&&targetRole.trim().length>2),[file,targetRole])
 const isPaid=session?.plan==='pro'||session?.plan==='active'
 const activeValid=session?.plan==='active'&&(!session.entitlement_until||new Date(session.entitlement_until).getTime()>Date.now())
 const remaining=Math.max(0,10-(session?.active_searches_used||0))

 async function ensureSession(){
  const stored=typeof window!=='undefined'?localStorage.getItem(SESSION_KEY)||'':''
  const data=await postJson(CV_API,{action:'session',token:stored})
  localStorage.setItem(SESSION_KEY,data.token)
  setToken(data.token);setSession(data.session)
  if(data.session?.last_diagnostic){setDiagnostic(data.session.last_diagnostic)}
  return {token:data.token,session:data.session as SessionState}
 }
 async function refreshStatus(useToken=token){if(!useToken)return;const data=await postJson(CV_API,{action:'status',token:useToken});setSession(data.session);if(data.session.last_diagnostic)setDiagnostic(data.session.last_diagnostic);return data.session as SessionState}
 async function loadComments(useToken=token){if(!useToken)return;try{const data=await postJson(CV_API,{action:'comments',token:useToken});setComments(data.comments||[])}catch{}}
 async function loadApplications(useToken=token){if(!useToken)return;try{const data=await postJson(CV_API,{action:'applications',token:useToken});setApplications(data.applications||[])}catch{}}
 async function generateProWithToken(useToken=token){
  if(!useToken)return
  setGenerating(true);setError('');setNotice('Tu pago está activo. El redactor está preparando el CV Pro+ y después pasa por un control factual separado.')
  try{const data=await postJson(CV_API,{action:'generate_pro',token:useToken,target_role:targetRole,job_text:jobText});setResume(data.resume);setQuality(Number(data.quality?.confidence||100));setNotice('CV Pro+ terminado y aprobado por el control de calidad.');await refreshStatus(useToken);window.setTimeout(()=>document.getElementById('mi-cv')?.scrollIntoView({behavior:'smooth'}),100)}catch(e){setError(e instanceof Error?e.message:'No pudimos generar el CV.')}finally{setGenerating(false)}
 }
 async function handlePaymentReturn(useToken:string){
  const params=new URLSearchParams(location.search),state=params.get('cv_payment'),order=params.get('order');if(!state||!order)return
  const orderToken=localStorage.getItem(`cv_ai_order_${order}`)||''
  history.replaceState({},'',location.pathname+location.hash)
  if(state==='failure'){setError('El pago no se completó. No se realizó ningún desbloqueo.');return}
  if(!orderToken){setError('Volviste del pago, pero no encontramos el comprobante local para validarlo. Escribinos y lo revisamos.');return}
  setNotice(state==='pending'?'Mercado Pago todavía está procesando el pago.':'Verificando el pago con Mercado Pago…')
  try{const data=await postJson(CV_API,{action:'activate_payment',token:useToken,order_id:order,order_token:orderToken});if(data.status==='approved'){setNotice('Pago aprobado. Tu plan ya está activo.');const s=await refreshStatus(useToken);if(s?.last_diagnostic)await generateProWithToken(useToken)}else setNotice('El pago sigue pendiente. Cuando Mercado Pago lo apruebe, tocá “Verificar pago” o recargá esta página.')}catch(e){setError(e instanceof Error?e.message:'No pudimos verificar el pago.')}
 }

 useEffect(()=>{if(initialized.current)return;initialized.current=true;(async()=>{try{const s=await ensureSession();await Promise.all([loadComments(s.token),s.session.plan==='active'?loadApplications(s.token):Promise.resolve()]);await handlePaymentReturn(s.token)}catch(e){setError(e instanceof Error?e.message:'No pudimos iniciar CV IA.')}})()},[])
 useEffect(()=>{if(session?.plan==='active'&&token)loadApplications(token)},[session?.plan,token])

 async function analyze(e?:FormEvent){
  e?.preventDefault();if(!ready||analyzing)return
  if(!file)return
  setAnalyzing(true);setDiagnostic(null);setError('');setNotice('');setProgress(1)
  let timer:number|undefined
  try{
   const s=token?{token,session}:await ensureSession();const useToken=s.token
   if(file.size>6*1024*1024)throw new Error('El archivo supera los 6 MB. Reducilo y volvé a intentar.')
   timer=window.setInterval(()=>setProgress(p=>Math.min(3,p+1)),4200)
   const base64=await fileToBase64(file)
   const data=await postJson(CV_API,{action:'diagnose',token:useToken,target_role:targetRole.trim(),job_text:jobText.trim(),file:{name:file.name,mime:file.type||'application/pdf',data:base64}})
   setProgress(4);setDiagnostic(data.diagnostic);await refreshStatus(useToken);window.setTimeout(()=>document.getElementById('resultado')?.scrollIntoView({behavior:'smooth',block:'start'}),120)
  }catch(e){setError(e instanceof Error?e.message:'No pudimos analizar el CV.')}finally{if(timer)window.clearInterval(timer);setAnalyzing(false)}
 }
 function openPlan(plan:PlanName|null){if(!plan){document.getElementById('analisis')?.scrollIntoView({behavior:'smooth'});return}setCheckoutPlan(plan);setError('')}
 async function startCheckout(e:FormEvent){
  e.preventDefault();if(!checkoutPlan||!session?.id)return
  setCheckoutBusy(true);setError('')
  try{const data=await postJson(`${PAY_API}?action=checkout`,{plan:checkoutPlan,email:checkoutEmail.trim(),session_id:session.id,return_url:location.origin+location.pathname});localStorage.setItem(`cv_ai_order_${data.order_id}`,data.order_token);location.href=data.init_point}catch(e){setError(e instanceof Error?e.message:'No pudimos abrir Mercado Pago.');setCheckoutBusy(false)}
 }
 function downloadWord(){if(!resume)return;const blob=new Blob([resumeHtml(resume)],{type:'application/msword;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`CV-${resume.candidate_name.replace(/[^a-z0-9]+/gi,'-')}.doc`;a.click();URL.revokeObjectURL(url)}
 function printResume(){setTab('cv');window.setTimeout(()=>window.print(),120)}
 async function copyText(text:string){try{await navigator.clipboard.writeText(text);setNotice('Copiado al portapapeles.')}catch{}}
 async function submitComment(e:FormEvent){e.preventDefault();if(!token)return;setCommentNotice('');try{await postJson(CV_API,{action:'submit_comment',token,display_name:commentName,role_label:commentRole,rating:commentRating,body:commentText});setCommentName('');setCommentRole('');setCommentText('');setCommentNotice('Gracias. Quedó enviado para una revisión rápida antes de publicarse.')}catch(e){setCommentNotice(e instanceof Error?e.message:'No pudimos enviar el comentario.')}}
 async function runActive(e:FormEvent){e.preventDefault();if(!token||activeBusy)return;setActiveBusy(true);setActiveResult(null);setError('');try{const data=await postJson(CV_API,{action:'active_adapt',token,company_name:activeCompany,role_name:activeRole,job_text:activeJob});setActiveResult(data);await refreshStatus(token);await loadApplications(token);setNotice('Nueva candidatura preparada y validada.')}catch(e){setError(e instanceof Error?e.message:'No pudimos preparar esta candidatura.')}finally{setActiveBusy(false)}}
 async function changeApplication(id:string,status:string){if(!token)return;try{await postJson(CV_API,{action:'update_application',token,id,status});setApplications(list=>list.map(x=>x.id===id?{...x,status}:x))}catch(e){setError(e instanceof Error?e.message:'No pudimos cambiar el estado.')}}

 const perspectives=diagnostic?[['Filtro automático',diagnostic.ats],['Recruiter',diagnostic.recruiter],['Responsable del área',diagnostic.manager]] as const:[]
 return <main className={styles.page}>
  <header className={styles.header}><a className={styles.brand} href="#inicio"><span className={styles.brandMark}>CV</span><span className={styles.brandText}><b>CV IA</b><small>candidaturas que compiten mejor</small></span></a><a className={styles.headerCta} href={resume?'#mi-cv':'#analisis'}>{resume?'Mi candidatura':'Analizar gratis'}</a></header>

  <section className={styles.hero} id="inicio">
   <div className={styles.heroCopy}><span className={styles.eyebrow}>NO ES OTRO GENERADOR DE CV</span><h1>¿Mandás CV y <em>no te llaman?</em></h1><p className={styles.heroLead}>Descubrí qué puede estar frenándote y prepará una candidatura específica para el trabajo que querés.</p><div className={styles.heroTrust}><span>✓ No inventamos experiencia</span><span>✓ 3 evaluaciones independientes</span><span>✓ Control de calidad en planes pagos</span><span>✓ Diagnóstico inicial gratis</span></div></div>
   <form className={styles.analyzerCard} id="analisis" onSubmit={analyze}>
    <div className={styles.stepLabel}><span>1</span><b>Subí tu CV</b><small>PDF, DOC, DOCX o TXT · máximo 6 MB</small></div>
    <input ref={fileRef} className={styles.fileInput} type="file" accept=".pdf,.doc,.docx,.txt" onChange={e=>setFile(e.target.files?.[0]||null)}/>
    <button className={`${styles.dropzone} ${file?styles.dropzoneReady:''}`} type="button" onClick={()=>fileRef.current?.click()}><span className={styles.uploadIcon}>↑</span><b>{file?.name||'Elegir mi CV'}</b><small>{file?'Archivo listo':'Tocá acá para buscarlo en tu celular'}</small></button>
    <div className={styles.stepLabel}><span>2</span><b>Decinos el puesto</b><small>El aviso laboral es opcional</small></div>
    <div className={styles.field}><label>Puesto al que querés postularte</label><input value={targetRole} onChange={e=>setTargetRole(e.target.value)} placeholder="Ej: Analista Comercial" maxLength={180}/></div>
    <div className={styles.field}><label>Pegá la oferta o descripción del trabajo <strong>(opcional)</strong></label><textarea value={jobText} onChange={e=>setJobText(e.target.value)} placeholder="Si tenés un aviso, copiá y pegalo acá para medir la coincidencia con ese empleo." rows={5}/><small>Podés dejarlo vacío. Si pegás el aviso, comparamos tu CV contra ese puesto; si no, hacemos un análisis general de tu perfil.</small></div>
    <button className={styles.primaryCta} type="submit" disabled={!ready||analyzing}>{analyzing?'Analizando de verdad…':'Analizar mi CV gratis'}</button>
    {analyzing&&<div className={styles.progress}><div className={`${styles.progressItem} ${progress>=1?styles.progressItemActive:''}`}><i className={styles.progressDot}/>Extrayendo únicamente hechos del CV</div><div className={`${styles.progressItem} ${progress>=2?styles.progressItemActive:''}`}><i className={styles.progressDot}/>Filtro automático + compatibilidad</div><div className={`${styles.progressItem} ${progress>=3?styles.progressItemActive:''}`}><i className={styles.progressDot}/>Recruiter + responsable del área</div><div className={`${styles.progressItem} ${progress>=4?styles.progressItemActive:''}`}><i className={styles.progressDot}/>Armando el diagnóstico</div></div>}
    <p className={styles.microcopy}>Sin tarjeta. Tu archivo se usa para el análisis y no publicamos su contenido.</p><div className={styles.privacyLine}><span>🔒</span><span>No usamos tu CV para inventar datos: si algo no está en la fuente, el sistema debe omitirlo o marcarlo como faltante.</span></div>
    {error&&<div className={`${styles.statusBox} ${styles.statusError}`}>{error}</div>}{notice&&<div className={`${styles.statusBox} ${styles.statusOk}`}>{notice}</div>}
   </form>
  </section>

  <section className={styles.valueBand}><div><strong>3</strong><span>miradas distintas</span></div><div><strong>2</strong><span>controles en planes pagos</span></div><div><strong>0</strong><span>experiencia inventada</span></div></section>

  <section className={styles.sectionPaper}><div className={styles.sectionIntro}><span className={styles.sectionTag}>TRIPLE FILTRO</span><h2>Tu CV visto desde tres lugares distintos.</h2><p>No buscamos que “suene lindo”. Buscamos que sea entendible para un sistema, convincente para selección y coherente con lo que necesita el puesto.</p></div><div className={styles.filterGrid}><article className={styles.filterCard}><span>01</span><b>Filtro automático</b><p>Estructura, términos relevantes, legibilidad y ajuste al aviso sin trucos de keywords.</p></article><article className={styles.filterCard}><span>02</span><b>Recruiter IA</b><p>Decide si la presentación da motivos suficientes para avanzar a una entrevista.</p></article><article className={styles.filterCard}><span>03</span><b>Responsable del área</b><p>Mira la experiencia real y qué tan bien demuestra capacidad para resolver ese trabajo.</p></article></div></section>

  {diagnostic&&<section className={styles.resultSection} id="resultado"><div className={styles.resultHeader}><div><span className={styles.resultTag}>DIAGNÓSTICO REAL</span><h2>{diagnostic.summary}</h2><p>{diagnostic.job_specific?'El análisis se hizo contra la búsqueda que pegaste.':'El análisis se hizo sobre el perfil general.'}</p></div><div className={styles.scoreRing} style={{'--score':`${diagnostic.score*3.6}deg`} as React.CSSProperties}><div><strong>{diagnostic.score}</strong><small>/100</small></div></div></div>
   <div className={styles.scoreGrid}>{perspectives.map(([name,p])=><div className={styles.scoreCard} key={name}><span>{name}</span><b>{p.score}%</b><i><u style={{width:`${p.score}%`}}/></i></div>)}</div>
   <div className={styles.perspectiveGrid}>{perspectives.map(([name,p])=><article className={styles.perspective} key={name}><div className={styles.perspectiveTop}><b>{name}</b><strong>{p.score}</strong></div><p>{p.verdict}</p><p><b>Decisión:</b> {p.interview_decision}</p>{p.strengths.slice(0,2).map(x=><p key={x}>✓ {x}</p>)}</article>)}</div>
   <div className={styles.issueList}>{diagnostic.issues.slice(0,5).map((x,i)=><article className={`${styles.issue} ${x.severity==='high'?styles.issueHigh:''}`} key={`${x.title}-${i}`}><b>{x.title}</b><p>{x.explanation}</p><p><strong>Qué haríamos:</strong> {x.fix}</p></article>)}</div>
   <div className={styles.resultUpsell}><div><small>SIGUIENTE PASO</small><b>Convertir el diagnóstico en una candidatura lista para enviar.</b><p>El redactor trabaja sólo con los hechos extraídos y otro agente audita el resultado antes de entregarlo.</p></div><button onClick={()=>openPlan('pro')}>Crear mi CV Pro+</button></div>
  </section>}

  <section className={styles.section}><div className={styles.sectionIntro}><span className={styles.sectionTag}>LA DIFERENCIA</span><h2>Una IA gratis redacta. Acá hay un proceso.</h2></div><div className={styles.compareCard}><div className={styles.compareHead}><span></span><b>Prompt genérico</b><b>CV IA</b></div>{[['Redacta texto','Sí','Sí'],['Extrae hechos antes de escribir','No necesariamente','Sí'],['3 evaluaciones separadas','No','Sí'],['Control factual del CV pago','Lo tenés que hacer vos','Incluido'],['Versiones por búsqueda','Manual','Incluido'],['LinkedIn','Tenés que pedirlo','Paquete listo para copiar']].map(row=><div className={styles.compareRow} key={row[0]}><span>{row[0]}</span><i>{row[1]}</i><strong>{row[2]}</strong></div>)}</div></section>

  <section className={styles.sectionPaper} id="planes"><div className={styles.sectionIntro}><span className={styles.sectionTag}>EMPEZÁ GRATIS</span><h2>Pagás cuando querés pasar del diagnóstico a la acción.</h2><p>El diagnóstico es gratis. CV Pro+ se habilita mediante Mercado Pago y dura 30 días.</p></div><div className={styles.plansGrid}>{plans.map(p=><article className={`${styles.plan} ${p.highlight?styles.planHighlight:''}`} key={p.name}><span className={styles.planBadge}>{p.badge}</span><h3>{p.name}</h3><div className={styles.price}><strong>{p.price}</strong><small>{p.suffix}</small></div><ul>{p.features.map(f=><li key={f}>✓ {f}</li>)}</ul><button onClick={()=>openPlan(p.plan)}>{p.cta}</button>{p.plan&&<p className={styles.planNote}>La optimización de LinkedIn entrega textos listos para copiar. No accedemos ni modificamos tu cuenta de LinkedIn.</p>}</article>)}</div></section>

  {(isPaid||resume||generating)&&<section className={styles.workspace} id="mi-cv"><div className={styles.workspaceInner}><div className={styles.workspaceHead}><span className={styles.sectionTag}>TU ESPACIO</span><h2>{resume?'Tu candidatura ya está lista.':'Tu plan está activo.'}</h2><p>{resume?'Podés guardar el CV, copiar el paquete de LinkedIn y practicar las preguntas que surgieron de tu propio perfil.':'Ahora falta generar la versión final y pasarla por el control factual.'}</p>{quality!==null&&<span className={styles.qualityPill}>✓ Control factual aprobado · confianza {quality}%</span>}</div>
   {!resume&&<div className={styles.outputCard}><h3>{generating?'Preparando tu CV…':'Generar CV Pro+'}</h3><p>{generating?'Primero redactamos y después un segundo agente compara el resultado contra los hechos extraídos. Puede tardar unos segundos.':'Usamos el diagnóstico que ya hiciste. Si el auditor detecta algo no respaldado, el sistema corrige o frena la entrega.'}</p><button className={styles.primaryCta} disabled={generating||!diagnostic} onClick={()=>generateProWithToken()}>{generating?'Controlando calidad…':diagnostic?'Generar ahora':'Primero hacé el diagnóstico'}</button></div>}
   {resume&&<><div className={styles.tabs}><button data-active={tab==='cv'} onClick={()=>setTab('cv')}>CV final</button><button data-active={tab==='linkedin'} onClick={()=>setTab('linkedin')}>LinkedIn</button><button data-active={tab==='carta'} onClick={()=>setTab('carta')}>Postulación</button><button data-active={tab==='entrevista'} onClick={()=>setTab('entrevista')}>Entrevista</button></div>
    {tab==='cv'&&<article className={styles.outputCard}><h3 className={styles.resumeName}>{resume.candidate_name}</h3><p className={styles.resumeHeadline}>{resume.headline}</p><p className={styles.contactLine}>{[resume.contact.email,resume.contact.phone,resume.contact.location,resume.contact.linkedin].filter(Boolean).join(' · ')}</p><h4>Perfil profesional</h4><p>{resume.summary}</p><h4>Experiencia</h4>{resume.experience.map((x,i)=><div className={styles.experienceItem} key={`${x.company}-${i}`}><b>{x.role} · {x.company}</b><small>{[x.start_date,x.end_date].filter(Boolean).join(' — ')}</small><ul>{x.bullets.map(b=><li key={b}>{b}</li>)}</ul></div>)}<h4>Formación</h4><ul>{resume.education.map((x,i)=><li key={`${x.institution}-${i}`}><b>{x.degree}</b> · {x.institution}{x.date?` · ${x.date}`:''}</li>)}</ul><h4>Habilidades</h4><p>{resume.skills.join(' · ')}</p>{resume.languages.length>0&&<><h4>Idiomas</h4><p>{resume.languages.join(' · ')}</p></>}<div className={styles.actionRow}><button onClick={printResume}>Guardar como PDF</button><button onClick={downloadWord}>Descargar para Word</button></div></article>}
    {tab==='linkedin'&&<article className={styles.outputCard}><h3>LinkedIn listo para copiar</h3><p>No entramos a tu cuenta: te damos exactamente qué poner y vos decidís qué actualizar.</p><div className={styles.copyBox}><b>Titular</b><p>{resume.linkedin.headline}</p><button onClick={()=>copyText(resume.linkedin.headline)}>Copiar</button></div><div className={styles.copyBox}><b>Acerca de</b><p>{resume.linkedin.about}</p><button onClick={()=>copyText(resume.linkedin.about)}>Copiar</button></div><h4>Bullets sugeridos para experiencia</h4><ul>{resume.linkedin.experience_bullets.map(x=><li key={x}>{x}</li>)}</ul><h4>Habilidades a destacar</h4><p>{resume.linkedin.skills.join(' · ')}</p></article>}
    {tab==='carta'&&<article className={styles.outputCard}><h3>Mensaje de postulación</h3><p>{resume.cover_message}</p><div className={styles.actionRow}><button onClick={()=>copyText(resume.cover_message)}>Copiar mensaje</button><button onClick={()=>setTab('cv')}>Volver al CV</button></div></article>}
    {tab==='entrevista'&&<article className={styles.outputCard}><h3>Preparación de entrevista</h3>{resume.interview.questions.map((q,i)=><div className={styles.copyBox} key={`${q.question}-${i}`}><b>{i+1}. {q.question}</b><p><strong>Por qué puede aparecer:</strong> {q.why}</p><p><strong>Cómo encararla:</strong> {q.answer_strategy}</p></div>)}</article>}
   </>}
   {false&&activeValid&&resume&&<><div className={styles.workspaceHead} style={{marginTop:42}}><span className={styles.sectionTag}>HERRAMIENTAS AVANZADAS</span><h2>Una versión para cada oportunidad.</h2><p>Te quedan {remaining} de 10 adaptaciones incluidas.</p></div><form className={styles.activeForm} onSubmit={runActive}><input value={activeCompany} onChange={e=>setActiveCompany(e.target.value)} placeholder="Empresa (opcional)"/><input value={activeRole} onChange={e=>setActiveRole(e.target.value)} placeholder="Puesto" required/><textarea value={activeJob} onChange={e=>setActiveJob(e.target.value)} placeholder="Pegá la oferta laboral completa" required/><span className={styles.remaining}>{remaining} adaptaciones disponibles.</span><button disabled={activeBusy||remaining<1}>{activeBusy?'Analizando y controlando…':'Preparar esta candidatura'}</button></form>
    {activeResult&&<article className={styles.outputCard}><h3>{activeResult.match_score}% de compatibilidad</h3><p>{activeResult.verdict}</p><h4>Consejos para esta postulación</h4><ul>{activeResult.application_tips?.map((x:string)=><li key={x}>{x}</li>)}</ul><p><b>La versión adaptada quedó guardada en esta candidatura.</b></p></article>}
    <div className={styles.applications}>{applications.map(app=><article className={styles.application} key={app.id}><div><b>{app.role_name}</b><small>{app.company_name||'Empresa no indicada'} · Match {app.analysis?.match_score??'—'}%</small></div><small>{new Date(app.updated_at).toLocaleDateString('es-AR')}</small><select value={app.status} onChange={e=>changeApplication(app.id,e.target.value)}><option value="preparing">Preparando</option><option value="applied">Postulado</option><option value="interview">Entrevista</option><option value="offer">Oferta</option><option value="rejected">No avanzó</option><option value="paused">Pausado</option></select></article>)}</div></>}
  </div></section>}

  <section className={styles.section}><div className={styles.sectionIntro}><span className={styles.sectionTag}>COMUNIDAD</span><h2>Experiencias reales, no testimonios inventados.</h2><p>Los comentarios se publican después de una revisión simple para evitar spam, datos privados o contenido falso.</p></div><div className={styles.communityGrid}><div className={styles.commentsList}>{comments.length?comments.map(c=><article key={c.id}><div className={styles.avatar}>{c.display_name.slice(0,1).toUpperCase()}</div><div><b>{c.display_name} {'★'.repeat(c.rating)}</b><small>{c.role_label||'Usuario de CV IA'}</small><p>{c.body}</p></div></article>):<div className={styles.emptyComments}>Todavía no hay experiencias públicas. Preferimos arrancar vacío antes que inventar testimonios.</div>}</div><form className={styles.commentForm} onSubmit={submitComment}><b>Dejá tu experiencia</b><p>Si usaste el análisis o un plan pago, contanos qué te pareció. No publiques teléfono, email ni otros datos sensibles.</p><input value={commentName} onChange={e=>setCommentName(e.target.value)} placeholder="Tu nombre" maxLength={40}/><input value={commentRole} onChange={e=>setCommentRole(e.target.value)} placeholder="Área o puesto (opcional)" maxLength={70}/><div className={styles.stars}>{[1,2,3,4,5].map(n=><button type="button" key={n} data-on={n<=commentRating} onClick={()=>setCommentRating(n)}>★</button>)}</div><textarea value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="¿Cómo fue tu experiencia?" rows={4} maxLength={600}/><button type="submit">Enviar comentario</button>{commentNotice&&<p>{commentNotice}</p>}</form></div></section>

  <section className={styles.finalCta}><h2>No necesitás “un CV más lindo”. Necesitás una candidatura que tenga razones para avanzar.</h2><p>El primer diagnóstico es gratis. Sin tarjeta.</p><a href="#analisis">Analizar mi CV</a></section>
  <footer className={styles.footer}><div><b>CV IA</b><span>Un producto digital de Llena Group.</span></div><small>Gabriel Alejandro Granvillano · CUIT 20-38422407-6 · Los resultados orientan y mejoran la presentación de una candidatura; no garantizan contratación ni entrevista.</small></footer>
  {!resume&&<a className={styles.mobileSticky} href="#analisis">Analizar gratis</a>}

  {checkoutPlan&&<div className={styles.checkoutOverlay} onMouseDown={e=>{if(e.target===e.currentTarget)setCheckoutPlan(null)}}><form className={styles.checkoutModal} onSubmit={startCheckout}><div className={styles.checkoutTop}><div><span className={styles.planBadge}>PAGO SEGURO</span><h3>CV Pro+</h3></div><button className={styles.closeBtn} type="button" onClick={()=>setCheckoutPlan(null)}>×</button></div><p>30 días. Incluye generación, versión adaptada, LinkedIn, postulación y preparación de entrevista.</p><label>Email para asociar tu compra<input type="email" required value={checkoutEmail} onChange={e=>setCheckoutEmail(e.target.value)} placeholder="tu@email.com"/></label><div className={styles.checkoutPrice}><span>Total</span><strong>$5.990</strong></div><button className={styles.checkoutButton} disabled={checkoutBusy}>{checkoutBusy?'Abriendo Mercado Pago…':'Continuar con Mercado Pago'}</button><p>El plan se activa únicamente después de verificar el pago aprobado con Mercado Pago.</p></form></div>}
 </main>
}
