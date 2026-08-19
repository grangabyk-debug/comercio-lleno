'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import styles from './active.module.css'
import HumanHelpChat from './HumanHelpChat'
import { CV_ACCOUNT_API, CV_API, CV_PRO_API, SESSION_KEY, cvAuthClient, postCv, trackCvEvent } from '../cv-ia/cvAuth'

type AppItem={id:string;company_name:string|null;role_name:string;status:string;analysis:any;adapted_resume:any;interview_pack:any[];job_text:string;created_at:string;updated_at:string}
type View='home'|'new'|'tracking'|'prepare'|'learn'|'search'
const columns=[['preparing','Preparando'],['applied','Postulado'],['interview','Entrevista'],['offer','Oferta'],['rejected','No avanzó']] as const
const OWNER_AUTH_API='https://pejkycdttogpmmdntzuq.supabase.co/functions/v1/cv-ai-owner-auth'
const portals=[
 {name:'LinkedIn Jobs',note:'Abrí tu búsqueda en LinkedIn',href:'https://www.linkedin.com/jobs/'},
 {name:'Indeed',note:'Buscar empleos en Argentina',href:'https://ar.indeed.com/'},
 {name:'Bumeran',note:'Ofertas locales y perfiles variados',href:'https://www.bumeran.com.ar/'},
 {name:'Computrabajo',note:'Vacantes y empresas en Argentina',href:'https://ar.computrabajo.com/'},
]
const learning=[
 {name:'EF SET',tag:'INGLÉS · CERTIFICADO GRATIS',time:'50–90 min',desc:'Medí tu nivel de inglés con escala CEFR y obtené un certificado gratuito para sumar al CV o LinkedIn.',href:'https://www.efset.org/es/english-certificate/',cta:'Hacer test oficial'},
 {name:'IBM SkillsBuild',tag:'CURSOS · CREDENCIALES',time:'Autogestionado',desc:'Formación gratuita en habilidades laborales, atención al cliente, tecnología, IA, datos y más. Algunos recorridos entregan credenciales digitales.',href:'https://skillsbuild.org/es/adult-learners',cta:'Ver cursos de IBM'},
 {name:'Cisco Skills for All',tag:'TECNOLOGÍA · GRATIS',time:'Autogestionado',desc:'Cursos gratuitos respaldados por Cisco en ciberseguridad, redes, Python y datos. Útil para construir habilidades demostrables.',href:'https://skillsforall.com/',cta:'Ver cursos de Cisco'},
]

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
 const [view,setView]=useState<View>('home')
 const [guideOpen,setGuideOpen]=useState(false)

 async function activatePayment(useToken:string){const p=new URLSearchParams(location.search),state=p.get('cv_payment'),order=p.get('order');if(!state||!order)return;const ot=localStorage.getItem(`cv_ai_order_${order}`)||'';history.replaceState({},'',location.pathname);if(state==='failure')throw new Error('El pago no se completó.');if(!ot)throw new Error('No encontramos el comprobante local para validar el pago.');setMessage('Verificando tu pago…');const d=await postCv(CV_API,{action:'activate_payment',token:useToken,order_id:order,order_token:ot});if(d.status!=='approved')throw new Error('El pago todavía está pendiente.');setMessage('Pago aprobado. Ahora vinculá tu cuenta para guardar el tablero.')}
 async function ownerAutoSession(useToken:string){try{const r=await fetch(OWNER_AUTH_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session_token:useToken})});const d=await r.json().catch(()=>null);if(!r.ok||!d?.ok||!d?.token_hash)return null;const verified=await cvAuthClient().auth.verifyOtp({type:'magiclink',token_hash:d.token_hash});if(verified.error)return null;return verified.data.session||null}catch{return null}}

 async function load(){setLoading(true);setError('');try{
   void trackCvEvent('active_opened',{source:'dashboard_preview'},'/busqueda-activa')
   let useToken=localStorage.getItem(SESSION_KEY)||'';setToken(useToken);if(useToken)await activatePayment(useToken)
   const client=cvAuthClient();let {data:a}=await client.auth.getSession();let authSession=a.session
   if(useToken){const ownerSession=await ownerAutoSession(useToken);if(ownerSession)authSession=ownerSession}
   if(!authSession){setLogged(false);const d=await pro({action:'get_resume',token:useToken});setPlan(d.plan||'free');setLoading(false);return}
   setLogged(true);const linked=await accountCall(authSession.access_token,{action:'link',session_token:useToken});if(linked.session_token){useToken=linked.session_token;localStorage.setItem(SESSION_KEY,useToken);setToken(useToken)}setOwner(linked.account?.role==='owner');if(linked.account?.role==='owner')await accountCall(authSession.access_token,{action:'owner_prepare',session_token:useToken})
   const data=await pro({action:'get_resume',token:useToken});setPlan(data.plan||'free');if(!data.resume&&(data.plan==='active'||linked.account?.role==='owner'))await pro({action:'generate_pro',token:useToken});
   const list=await pro({action:'applications',token:useToken});setApps(list.applications||[]);setRemaining(Number(list.remaining||0));setMessage('')
 }catch(e){setError(e instanceof Error?e.message:'No pudimos abrir Búsqueda Activa.')}finally{setLoading(false)}}
 useEffect(()=>{load()},[])

 const grouped=useMemo(()=>Object.fromEntries(columns.map(([key])=>[key,apps.filter(a=>a.status===key)])),[apps])
 const appliedCount=apps.filter(a=>a.status==='applied'||a.status==='interview'||a.status==='offer'||a.status==='rejected').length
 const interviewCount=apps.filter(a=>a.status==='interview'||a.status==='offer').length
 const avgMatch=apps.length?Math.round(apps.reduce((s,a)=>s+Number(a.analysis?.match_score||0),0)/apps.length):0
 const funnel=appliedCount?Math.round((interviewCount/appliedCount)*100):0

 async function submit(e:FormEvent){e.preventDefault();if(busy)return;setBusy(true);setError('');setMessage('');void trackCvEvent('active_application_started',{has_job_offer:true},'/busqueda-activa');try{const d=await pro({action:'active_adapt',token,company_name:company,role_name:role,job_text:job});setMessage('Candidatura preparada y validada. La agregamos al tablero.');setCompany('');setRole('');setJob('');void trackCvEvent('active_application_completed',{score:Number(d.match_score||0),remaining:Number(d.remaining||0)},'/busqueda-activa');const list=await pro({action:'applications',token});setApps(list.applications||[]);setRemaining(Number(list.remaining||0));const created=(list.applications||[]).find((a:AppItem)=>a.id===d.application_id);if(created){setSelected(created);setView('tracking')}}catch(e){setError(e instanceof Error?e.message:'No pudimos preparar esta candidatura.')}finally{setBusy(false)}}
 async function move(app:AppItem,status:string){try{await pro({action:'update_application',token,id:app.id,status});setApps(x=>x.map(a=>a.id===app.id?{...a,status}:a));if(selected?.id===app.id)setSelected({...app,status});void trackCvEvent('application_status_changed',{status},'/busqueda-activa')}catch(e){setError(e instanceof Error?e.message:'No pudimos actualizar el estado.')}}

 if(loading)return <div className={styles.loading}><div><div className={styles.spinner}/><h2>Abriendo tu tablero…</h2><p>Estamos recuperando tu cuenta y tus postulaciones.</p></div></div>
 if(!logged)return <div className={styles.accountGate}><span className={styles.tag}>BÚSQUEDA ACTIVA</span><h2>Ahora sí necesitás una cuenta.</h2><p>El tablero, las versiones adaptadas y el seguimiento tienen que quedar asociados a vos para que puedas volver mañana o desde otro dispositivo. Creá o iniciá sesión con el email que usaste para tu compra.</p>{error&&<div className={styles.error}>{error}</div>}<a href="/cuenta?modo=crear&next=/busqueda-activa">Crear o iniciar sesión</a></div>
 if(plan!=='active'&&!owner)return <div className={styles.accountGate}><h2>Búsqueda Activa no está habilitada.</h2><p>Tu cuenta está lista, pero este plan todavía no figura activo.</p><a href="/mi-cv">Volver a mi CV Pro+</a></div>

 const nav=[['home','Resumen'],['new','Nueva oportunidad'],['tracking','Seguimiento'],['prepare','Preparación'],['learn','Cursos y pruebas'],['search','Buscar empleos']] as const
 const OpportunityForm=<aside className="baFormCard"><div className="baFormHead"><div><span>NUEVA OPORTUNIDAD</span><h2>Convertí una oferta en una candidatura preparada.</h2></div><button type="button" onClick={()=>setGuideOpen(true)}>Cómo se usa</button></div><p>Pegá el aviso completo. Postulá Mejor compara requisitos contra tu CV base, prioriza lo relevante y prepara una versión específica sin inventar experiencia.</p><form className={styles.form} onSubmit={submit}><input value={company} onChange={e=>setCompany(e.target.value)} placeholder="Empresa (opcional)"/><input value={role} onChange={e=>setRole(e.target.value)} placeholder="Puesto" required/><textarea value={job} onChange={e=>setJob(e.target.value)} placeholder="Pegá acá la oferta laboral completa" required/><button className={styles.primary} disabled={busy||(!owner&&remaining<1)}>{busy?'Analizando, redactando y auditando…':'Preparar candidatura'}</button><span className={styles.note}>Se guarda únicamente si supera el control factual. Una candidatura exitosa descuenta una búsqueda.</span></form></aside>

 const Tracking=<section className={styles.boardWrap}><div className={styles.boardTitle}><div><span className="baEyebrow">SEGUIMIENTO</span><h2>Tu embudo de búsqueda</h2></div><button onClick={()=>load()}>Actualizar</button></div><div className={styles.board}>{columns.map(([key,label])=><div className={styles.column} key={key}><div className={styles.columnHead}><b>{label}</b><span>{grouped[key]?.length||0}</span></div>{(grouped[key]||[]).map((a:AppItem)=><article className={styles.card} key={a.id} onClick={()=>setSelected(a)}><b>{a.role_name}</b><small>{a.company_name||'Empresa no indicada'}</small><small className={styles.match}>Match {a.analysis?.match_score??'—'}%</small><select value={a.status} onClick={e=>e.stopPropagation()} onChange={e=>move(a,e.target.value)}><option value="preparing">Preparando</option><option value="applied">Postulado</option><option value="interview">Entrevista</option><option value="offer">Oferta</option><option value="rejected">No avanzó</option><option value="paused">Pausado</option></select></article>)}{!grouped[key]?.length&&<div className={styles.empty}>Todavía no hay postulaciones acá.</div>}</div>)}</div>{selected&&<section className={styles.detail}><div className={styles.detailTop}><div><h2>{selected.role_name}</h2><p>{selected.company_name||'Empresa no indicada'}</p></div><div className={styles.score}>{selected.analysis?.match_score??'—'}%</div></div><p>{selected.analysis?.verdict}</p><div className={styles.detailGrid}><div className={styles.sub}><h3>Consejos para postularte</h3><ul>{(selected.analysis?.application_tips||[]).map((x:string,i:number)=><li key={i}>{x}</li>)}</ul></div><div className={styles.sub}><h3>Preparación de entrevista</h3>{(selected.interview_pack||[]).map((q:any,i:number)=><div key={i}><p><b>{q.question}</b></p><p>{q.answer_strategy}</p>{q.tip&&<p className={styles.tip}><b>Tip:</b> {q.tip}</p>}</div>)}</div></div></section>}</section>

 return <>
 <section className="baHero"><div><span className={styles.tag}>BÚSQUEDA ACTIVA · 30 DÍAS</span><h1>Un centro de búsqueda, no sólo un tablero.</h1><p>Prepará mejores candidaturas, seguí lo que pasa, practicá entrevistas y sumá habilidades reales que después puedas demostrar.</p>{owner&&<span className={styles.ownerTag}>Modo propietario · acceso ilimitado</span>}</div><div className="baPlanCard"><span>PLAN ACTIVO</span><strong>{owner?'∞':remaining}</strong><b>{owner?'pruebas disponibles':'candidaturas disponibles'}</b><small>Tu espacio conserva el historial durante el período activo.</small></div></section>
 <nav className="baNav" aria-label="Secciones de Búsqueda Activa">{nav.map(([key,label])=><button key={key} data-on={view===key} onClick={()=>setView(key)}>{label}</button>)}<button className="baHuman" onClick={()=>setHelpOpen(true)}>Ayuda humana</button></nav>
 {error&&<div className={styles.error}>{error}</div>}{message&&<div className={styles.success}>{message}</div>}

 {view==='home'&&<div className="baHome">
   <section className="baMetrics"><article><span>CANDIDATURAS</span><strong>{apps.length}</strong><small>preparadas en tu tablero</small></article><article><span>MATCH PROMEDIO</span><strong>{avgMatch?`${avgMatch}%`:'—'}</strong><small>contra las ofertas cargadas</small></article><article><span>ENTREVISTAS</span><strong>{interviewCount}</strong><small>oportunidades que avanzaron</small></article><article><span>CONVERSIÓN</span><strong>{appliedCount?`${funnel}%`:'—'}</strong><small>postulación → entrevista</small></article></section>
   <div className="baHomeGrid"><section className="baFocus"><span>HOY</span><h2>Tu próxima acción debería ser concreta.</h2><p>{apps.length?'Revisá las candidaturas en preparación, actualizá estados y elegí una oferta nueva para adaptar.':'Empezá cargando una oportunidad real. Con una sola oferta ya podemos comparar tu perfil y armar una candidatura específica.'}</p><div><button onClick={()=>setView('new')}>Preparar una candidatura</button><button onClick={()=>setView('search')}>Buscar oportunidades</button></div></section><section className="baChecklist"><span>RUTINA DE BÚSQUEDA</span><h3>Una estrategia simple para sostener 30 días</h3><ol><li>Elegí ofertas que realmente encajen con tu objetivo.</li><li>Adaptá el CV a cada aviso antes de postularte.</li><li>Registrá el resultado para detectar patrones.</li><li>Practicá entrevista antes de que te llamen.</li><li>Sumá sólo cursos y pruebas que hayas completado.</li></ol></section></div>
   <section className="baQuick"><div><span>ACCESOS RÁPIDOS</span><h2>Todo lo que podés usar desde acá</h2></div><div className="baQuickGrid"><button onClick={()=>setView('new')}><b>Nueva oportunidad</b><small>Adaptar CV + consejos + entrevista</small></button><button onClick={()=>setView('tracking')}><b>Seguimiento</b><small>Estados, match y avance real</small></button><button onClick={()=>setView('prepare')}><b>Preparación</b><small>Entrevista, follow-up y checklist</small></button><button onClick={()=>setView('learn')}><b>Sumar habilidades</b><small>Pruebas y cursos confiables</small></button></div></section>
 </div>}

 {view==='new'&&<div className="baSingle">{OpportunityForm}<section className="baHow"><span>QUÉ HACE POSTULÁ MEJOR</span><h2>La oferta se convierte en un plan de postulación.</h2><div><article><b>1. Compara</b><p>Detecta requisitos, habilidades y responsabilidades del aviso.</p></article><article><b>2. Adapta</b><p>Prioriza hechos reales de tu CV que encajan mejor con ese puesto.</p></article><article><b>3. Audita</b><p>Controla que la versión final no agregue experiencia inexistente.</p></article><article><b>4. Prepara</b><p>Te deja consejos y preguntas probables para entrevista.</p></article></div></section></div>}

 {view==='tracking'&&Tracking}

 {view==='prepare'&&<div className="baTools"><section className="baToolLead"><span>PREPARACIÓN</span><h2>Antes y después de postularte.</h2><p>Las búsquedas que funcionan mejor no terminan cuando mandás el CV. Acá concentramos las tareas que suelen quedar desperdigadas.</p></section><div className="baToolGrid"><article><span>ENTREVISTA</span><h3>Practicar sobre una oferta real</h3><p>Abrí una candidatura del tablero y usá sus preguntas, estrategia de respuesta y tips como simulador.</p><button onClick={()=>setView('tracking')}>Elegir candidatura</button></article><article><span>FOLLOW-UP</span><h3>Recordatorio de seguimiento</h3><p>Registrá el estado de cada postulación. Si pasan varios días sin respuesta, prepará un mensaje breve y profesional.</p><button onClick={()=>setView('tracking')}>Ver seguimiento</button></article><article><span>PERFIL</span><h3>LinkedIn listo para copiar</h3><p>Tu CV Pro+ ya incluye textos de LinkedIn. Volvé a Mi CV para revisar titular, extracto, experiencia y habilidades.</p><a href="/mi-cv">Abrir LinkedIn Pro+</a></article><article><span>PROYECTO DEMOSTRABLE</span><h3>Convertí práctica en evidencia real</h3><p>Elegí una habilidad de la oferta y armá un mini proyecto personal. Sólo lo sumás al CV después de completarlo y poder mostrarlo.</p><button onClick={()=>setView('learn')}>Ver ideas y formación</button></article></div></div>}

 {view==='learn'&&<div className="baLearn"><section className="baToolLead"><span>CURSOS Y PRUEBAS</span><h2>Sumá habilidades que puedas demostrar.</h2><p>No agregamos cursos automáticamente al CV. Primero los hacés; después, si corresponde, los incorporás como formación, credencial o proyecto personal.</p></section><div className="baLearnGrid">{learning.map(item=><article key={item.name}><span>{item.tag}</span><h3>{item.name}</h3><b>{item.time}</b><p>{item.desc}</p><a href={item.href} target="_blank" rel="noreferrer">{item.cta}</a></article>)}</div><section className="baEvidence"><div><span>PORTAFOLIO / EXPERIENCIA PERSONAL</span><h2>También podés sumar evidencia sin mentir.</h2><p>Un proyecto personal terminado puede ser válido para demostrar una habilidad. Ejemplos: una planilla de control de stock, una simulación de atención al cliente, un dashboard simple, una pieza de contenido, un pequeño sitio o un caso de ventas. Siempre debe figurar como proyecto/práctica personal, no como empleo.</p></div><a href="/mi-cv">Revisar mi CV Pro+</a></section></div>}

 {view==='search'&&<div className="baSearch"><section className="baToolLead"><span>BUSCAR EMPLEOS</span><h2>Encontrá oportunidades y traelas a tu tablero.</h2><p>Por ahora podés abrir los principales portales y, cuando encuentres una vacante, copiar el aviso completo en Nueva oportunidad.</p></section><div className="baPortalGrid">{portals.map(p=><a key={p.name} href={p.href} target="_blank" rel="noreferrer"><b>{p.name}</b><span>{p.note}</span><small>Abrir portal</small></a>)}</div><section className="baConnector"><div><span>PRÓXIMA INTEGRACIÓN</span><h2>Buscador dentro de Postulá Mejor</h2><p>La opción más plug-and-play que encontramos es integrar un agregador por API. Jooble ofrece una REST API para buscar por palabras clave, ubicación, radio y salario; Adzuna también dispone de API de búsqueda y datos salariales. En esta preview no conectamos ninguna clave todavía.</p></div><div><b>Jooble API</b><small>Recomendada para primera prueba</small><b>Adzuna API</b><small>Alternativa con datos de empleo y salarios</small></div></section></div>}

 {guideOpen&&<div className="baGuideOverlay" onClick={()=>setGuideOpen(false)}><section className="baGuide" onClick={e=>e.stopPropagation()}><button className="baGuideClose" onClick={()=>setGuideOpen(false)}>Cerrar</button><span>NUEVA OPORTUNIDAD · GUÍA RÁPIDA</span><h2>¿Para qué sirve?</h2><p>Sirve para preparar una candidatura distinta para cada trabajo. No mandás el mismo CV a todos: pegás la oferta y el sistema decide qué partes de tu experiencia conviene destacar.</p><ol><li><b>Empresa:</b> es opcional. Te ayuda a reconocer la candidatura después.</li><li><b>Puesto:</b> escribí el cargo al que te postulás.</li><li><b>Oferta completa:</b> copiá descripción, requisitos y responsabilidades del aviso.</li><li><b>Preparar candidatura:</b> generamos y auditamos una versión específica.</li><li><b>Seguimiento:</b> movela por Preparando, Postulado, Entrevista, Oferta o No avanzó.</li></ol><button onClick={()=>{setGuideOpen(false);setView('new')}}>Entendido, cargar una oportunidad</button></section></div>}

 <HumanHelpChat open={helpOpen} token={token} onClose={()=>setHelpOpen(false)} onNotice={setMessage} onError={setError}/>
 </>
}
