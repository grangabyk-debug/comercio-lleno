'use client'

import {FormEvent,useEffect,useMemo,useRef,useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'
import type {PreviewGig} from '../postula-preview/gigs'
import FlexCredits from './FlexCredits'
import FlexImagePicker from './FlexImagePicker'
import {flexCategoryImage} from './flexVisuals'

type FlexCard=PreviewGig&{
 real?:boolean;postId?:string;publisherAvatar?:string;publisherKind?:'person'|'company';privateIdentity?:boolean;imageSource?:string;contactPhone?:string
}
type Draft={title:string;category:string;description:string;location_text:string;compensation_text:string;duration_text:string;scheduled_for:string;image_path:string;image_url:string;allow_phone_contact:boolean;contact_phone:string}
const emptyDraft:Draft={title:'',category:'',description:'',location_text:'',compensation_text:'',duration_text:'',scheduled_for:'',image_path:'',image_url:'',allow_phone_contact:false,contact_phone:''}
const PUBLISH_RETURN='/servicios-flex?clasificar=1'

async function authHeaders(){const{data}=await cvAuthClient().auth.getSession();return data.session?.access_token?{Authorization:`Bearer ${data.session.access_token}`}:{}}
function whenLabel(value:string|null|undefined){if(!value)return'A coordinar';const d=new Date(value);return Number.isNaN(d.getTime())?'A coordinar':d.toLocaleDateString('es-AR',{day:'2-digit',month:'short'})}
function isExample(g:PreviewGig){return g.posterRole.includes('Vista ilustrativa')||g.tags.includes('Ejemplo')}
function initials(name:string){return name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'PM'}
function phoneHref(value:string){return `tel:${value.replace(/[^\d+]/g,'')}`}
function cardFromPost(p:any):FlexCard{
 const category=String(p.category||'Otros'),kind=p.publisher_kind==='company'?'company':'person'
 return {id:`real-${p.id}`,postId:String(p.id),real:true,title:String(p.title),category,location:String(p.location_text||'A coordinar'),when:whenLabel(p.scheduled_for),pay:String(p.compensation_text||'A acordar'),duration:String(p.duration_text||'A coordinar'),poster:String(p.publisher_display_name||(kind==='company'?'Empresa':'Persona')),posterRole:p.public_identity===false?(kind==='company'?'Empresa · identidad reservada':'Perfil privado'):kind==='company'?'Empresa':'Persona',rating:'nuevo',verified:p.verification_level==='verified',image:String(p.image_url||flexCategoryImage(category)),summary:String(p.description||''),requirements:['Confirmar alcance, fecha e importe por mensajes','El pago del servicio se acuerda directamente entre las partes','No compartir claves ni documentación sensible','Reportar cualquier conducta sospechosa'],tags:[category,p.verification_level==='verified'?'Verificado':'Validación básica'].filter(Boolean),publisherAvatar:String(p.publisher_avatar_public||''),publisherKind:kind,privateIdentity:p.public_identity===false,imageSource:String(p.image_source||'category'),contactPhone:String(p.contact_phone_public||'')}
}
function PublisherAvatar({gig}:{gig:FlexCard}){
 if(gig.publisherAvatar)return <span className="pm33-publisher-avatar has-photo" style={{backgroundImage:`url(${gig.publisherAvatar})`}} aria-hidden="true"/>
 return <span className="pm33-publisher-avatar" data-kind={gig.publisherKind||'person'} aria-hidden="true">{gig.publisherKind==='company'?<svg viewBox="0 0 24 24"><path d="M4 21V6.5L12 3v18M4 21h16M15 9h5v12M7 9h2m-2 4h2m-2 4h2"/></svg>:gig.privateIdentity?<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4.8 21c.7-4.4 3-6.5 7.2-6.5s6.5 2.1 7.2 6.5"/></svg>:initials(gig.poster)}</span>
}

export default function ChangasExplorer({gigs,categories}:{gigs:PreviewGig[];categories:string[]}){
 const catsRef=useRef<HTMLDivElement|null>(null)
 const[category,setCategory]=useState('Para hoy')
 const[saved,setSaved]=useState<string[]>([])
 const[open,setOpen]=useState<FlexCard|null>(null)
 const[chat,setChat]=useState(false)
 const[real,setReal]=useState<FlexCard[]>([])
 const[publish,setPublish]=useState(false)
 const[authChoice,setAuthChoice]=useState(false)
 const[draft,setDraft]=useState<Draft>(emptyDraft)
 const[busy,setBusy]=useState(false)
 const[notice,setNotice]=useState('')
 const[message,setMessage]=useState('')
 const[acceptRules,setAcceptRules]=useState(false)
 const[selectedCompanyId,setSelectedCompanyId]=useState<string|null>(null)
 const[creditRefresh,setCreditRefresh]=useState(0)
 const[publicIdentity,setPublicIdentity]=useState(true)

 async function loadPosts(){
  const headers=await authHeaders();const r=await fetch('/api/postula/flex',{headers,cache:'no-store'});const d=await r.json().catch(()=>({}));if(!d?.ok||!Array.isArray(d.posts))return
  const cards=d.posts.map((p:any)=>cardFromPost(p));setReal(cards);if(Array.isArray(d.favorites))setSaved(d.favorites.map((id:any)=>`real-${id}`));const deep=new URLSearchParams(location.search).get('tarea');if(deep){const found=cards.find((x:FlexCard)=>x.postId===deep);if(found){setOpen(found);setChat(false)}}
 }
 async function openPublish(){
  const{data}=await cvAuthClient().auth.getSession()
  if(!data.session){setPublish(false);setAuthChoice(true);return}
  setAuthChoice(false);setNotice('');setAcceptRules(false);setSelectedCompanyId(null);setCreditRefresh(v=>v+1);setDraft(emptyDraft);setPublicIdentity(true);setPublish(true)
 }

 useEffect(()=>{void loadPosts()},[])
 useEffect(()=>{
  const launch=()=>{void openPublish()}
  window.addEventListener('pm:flex-publish',launch)
  const params=new URLSearchParams(location.search)
  if(params.get('publicar')==='1'||location.hash==='#publicar-flex'){
   if(params.get('publicar')==='1')history.replaceState({},'',location.pathname)
   window.setTimeout(launch,0)
  }
  return()=>window.removeEventListener('pm:flex-publish',launch)
 },[])
 useEffect(()=>{
  if(!publish&&!authChoice)return
  const previous=document.body.style.overflow;document.body.style.overflow='hidden'
  return()=>{document.body.style.overflow=previous}
 },[publish,authChoice])

 const all=useMemo(()=>[...real,...gigs],[real,gigs])
 const allCategories=useMemo(()=>Array.from(new Set([...categories,...real.map(x=>x.category)])),[categories,real])
 const publishCategories=useMemo(()=>Array.from(new Set(allCategories.filter(x=>x!=='Para hoy').concat('Otros'))),[allCategories])
 const filtered=useMemo(()=>category==='Para hoy'?all.filter(g=>/hoy|mañana/i.test(g.when)).concat(all.filter(g=>!/hoy|mañana/i.test(g.when)).slice(0,4)):all.filter(g=>g.category===category),[category,all])
 const previewImage=draft.image_url||flexCategoryImage(draft.category||'Otros')
 const previewWhen=draft.scheduled_for?whenLabel(draft.scheduled_for):'Fecha a coordinar'
 const authNext=encodeURIComponent(PUBLISH_RETURN)

 async function toggle(g:FlexCard){
  const next=!saved.includes(g.id);setSaved(v=>next?[...v,g.id]:v.filter(x=>x!==g.id))
  if(!g.real||!g.postId)return
  const{data}=await cvAuthClient().auth.getSession();if(!data.session){setSaved(v=>v.filter(x=>x!==g.id));location.assign('/login?next=/servicios-flex');return}
  try{const r=await fetch('/api/postula/flex',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${data.session.access_token}`},body:JSON.stringify({action:'favorite',post_id:g.postId,saved:next})});const d=await r.json().catch(()=>({}));if(!r.ok||!d?.ok)throw new Error(d?.error||'No pudimos actualizar favoritos.');setNotice(next?'Guardado en Mi cuenta.':'Quitado de favoritos.')}catch(e){setSaved(v=>next?v.filter(x=>x!==g.id):[...v,g.id]);setNotice(e instanceof Error?e.message:'No pudimos actualizar favoritos.')}
 }
 function scrollCats(direction:-1|1){catsRef.current?.scrollBy({left:direction*Math.min(520,Math.max(280,catsRef.current.clientWidth*.72)),behavior:'smooth'})}
 async function create(e:FormEvent){
  e.preventDefault();if(busy)return;if(!acceptRules){setNotice('Para publicar necesitás aceptar las reglas de publicación, los Términos, los Términos específicos de Servicios Flex y la Política de Privacidad.');return}setBusy(true);setNotice('')
  try{const headers={'Content-Type':'application/json',...(await authHeaders())};const r=await fetch('/api/postula/flex',{method:'POST',headers,body:JSON.stringify({action:'create',...draft,company_id:selectedCompanyId,public_identity:publicIdentity,policy_version:'services-flex-2026-08-25',responsibility_ack:true})});const d=await r.json().catch(()=>({}));if(!r.ok||!d?.ok){if(d?.code==='no_credits')setCreditRefresh(v=>v+1);throw new Error(d?.error||'No pudimos publicar.')}const p=d.post;setDraft(emptyDraft);setAcceptRules(false);setCreditRefresh(v=>v+1);setPublish(false);await loadPosts();setNotice('Servicio Flex publicado. Ya puede recibir consultas.');setCategory(String(p?.category||'Para hoy'))}catch(e){setNotice(e instanceof Error?e.message:'No pudimos publicar.')}finally{setBusy(false)}
 }
 async function respond(e:FormEvent){e.preventDefault();if(!open?.real||!open.postId||busy)return;const clean=message.trim();if(clean.length<3)return;setBusy(true);setNotice('');try{const headers={'Content-Type':'application/json',...(await authHeaders())};if(!('Authorization' in headers)){location.assign('/login?next=/servicios-flex');return}const r=await fetch('/api/postula/flex',{method:'POST',headers,body:JSON.stringify({action:'respond',post_id:open.postId,message:clean})});const d=await r.json().catch(()=>({}));if(!r.ok||!d?.ok)throw new Error(d?.error||'No pudimos enviar el mensaje.');setMessage('');setNotice('Mensaje enviado. La conversación quedó asociada a este Servicio Flex.');setChat(false)}catch(e){setNotice(e instanceof Error?e.message:'No pudimos enviar el mensaje.')}finally{setBusy(false)}}

 return <>
  <div className="pm15-flex-toolbar"><div><span>PUBLICAR ES SIMPLE</span><b>¿Necesitás resolver una tarea puntual?</b><small>Contá la tarea y la zona. La fecha y el importe pueden acordarse después.</small></div><button id="publicar-flex" type="button" data-services-flex-publish="1" className="pm15-publish-flex" onClick={()=>void openPublish()}>+ Publicar Servicio Flex</button></div>
  <div className="pm15-category-shell" aria-label="Categorías de Servicios Flex"><button type="button" className="pm15-cat-arrow left" onClick={()=>scrollCats(-1)} aria-label="Ver categorías anteriores">←</button><div className="pm7-gig-cats" ref={catsRef}>{allCategories.map(c=><button key={c} data-on={c===category} onClick={()=>setCategory(c)}>{c}</button>)}</div><button type="button" className="pm15-cat-arrow right" onClick={()=>scrollCats(1)} aria-label="Ver más categorías">→</button></div>
  {notice&&<div className="pm8-notice" style={{margin:'12px 0'}}>{notice}</div>}
  <div className="pm7-gig-grid">{filtered.map(g=><article className="pm7-gig-card" key={g.id}>
    <div className="pm7-gig-photo" style={{backgroundImage:`url(${g.image})`}}><span>{g.when}</span><button onClick={()=>void toggle(g as FlexCard)} data-saved={saved.includes(g.id)} aria-label="Guardar Servicio Flex">{saved.includes(g.id)?'♥':'♡'}</button><div className="pm7-gig-price"><b>{g.pay}</b><small>{g.duration}</small></div></div>
    <div className="pm7-gig-body"><div className="pm7-gig-person"><PublisherAvatar gig={g as FlexCard}/><div><b>{g.poster}</b><small>{isExample(g)?g.posterRole:<>{g.posterRole}{g.rating!=='nuevo'?` · ★ ${g.rating}`:' · publicación nueva'}{g.verified?' · verificado':''}</>}</small></div></div><h3>{g.title}</h3><p>{g.summary}</p><div className="pm7-gig-tags">{g.tags.map(t=><span key={t}>{t}</span>)}</div><div className="pm7-gig-foot"><span>{g.location}</span><button onClick={()=>{setOpen(g as FlexCard);setChat(false);setNotice('')}}>Ver servicio</button></div></div>
   </article>)}</div>

  {open&&<div className="pm7-gig-modal" role="dialog" aria-modal="true"><div className="pm7-gig-modal-card"><button className="pm7-modal-close" onClick={()=>{setOpen(null);setChat(false);setNotice('')}}>×</button><div className="pm7-modal-image" style={{backgroundImage:`url(${open.image})`}}/><div className="pm7-modal-content"><span className="pm7-mini-label">{open.category} · {open.when}</span><h2>{open.title}</h2><div className="pm7-modal-pay"><b>{open.pay}</b><span>{open.duration}</span></div><p>{open.summary}</p><h4>Antes de acordar</h4><ul>{open.requirements.map(x=><li key={x}>{x}</li>)}</ul><div className="pm7-gig-person big"><PublisherAvatar gig={open}/><div><b>{open.poster}</b><small>{isExample(open)?open.posterRole:<>{open.posterRole}{open.verified?' · identidad verificada':' · validación básica'}</>}</small></div></div>{isExample(open)?<><div className="pm7-safety-line">Este contenido es ilustrativo y sirve para mostrar cómo funciona Servicios Flex. No es un servicio activo ni tiene una persona real detrás.</div><button className="pm7-primary-wide" data-services-flex-publish="1" onClick={()=>{setOpen(null);void openPublish()}}>Publicar un servicio real</button></>:<>{chat?<form className="pm7-mini-chat" onSubmit={respond}><div>Consultá todo lo necesario antes de acordar el servicio.</div><input value={message} onChange={e=>setMessage(e.target.value)} placeholder="Escribí un mensaje…"/><button disabled={busy||!message.trim()}>{busy?'Enviando…':'Enviar'}</button></form>:<button className="pm7-primary-wide" onClick={()=>setChat(true)}>Chatear por Postulá Mejor</button>}{open.contactPhone&&<a href={phoneHref(open.contactPhone)} style={{display:'grid',placeItems:'center',width:'100%',minHeight:45,marginTop:9,border:'1px solid #d9dee2',borderRadius:13,background:'#fff',color:'#111',fontSize:13,fontWeight:900,textDecoration:'none'}}>Llamar · {open.contactPhone}</a>}</>}<div className="pm7-safety-line">El servicio no se confirma sin acuerdo de ambas partes. El pago se acuerda directamente entre ustedes. Postulá Mejor no recibe ni custodia ese dinero. No compartas claves ni documentos sensibles por chat.</div></div></div></div>}

  {authChoice&&<div className="pm34-auth-overlay" role="dialog" aria-modal="true" aria-labelledby="pm34-auth-title"><div className="pm34-auth-card"><button type="button" className="pm34-close" onClick={()=>setAuthChoice(false)} aria-label="Cerrar">×</button><span className="pm34-kicker">PUBLICAR SERVICIO FLEX</span><h2 id="pm34-auth-title">¿Ya tenés una cuenta?</h2><p>Para publicar necesitamos asociar el servicio a una cuenta. Elegí cómo querés continuar; no hace falta registrarte de nuevo si ya usás Postulá Mejor.</p><div className="pm34-auth-actions"><a className="pm34-auth-login" href={`/login?next=${authNext}`}><span>Ya tengo cuenta</span><b>Iniciar sesión</b><small>Entrás y volvés directo al clasificador de publicación.</small></a><a className="pm34-auth-signup" href={`/registro?next=${authNext}`}><span>Soy nuevo/a</span><b>Crear cuenta gratis</b><small>Una cuenta sirve para Empleos y Servicios Flex.</small></a></div><button type="button" className="pm34-auth-cancel" onClick={()=>setAuthChoice(false)}>Seguir viendo servicios</button></div></div>}

  {publish&&<div className="pm34-publish-overlay" role="dialog" aria-modal="true" aria-labelledby="pm34-publish-title"><form className="pm34-publish-card" onSubmit={create}>
   <button type="button" className="pm34-close pm34-publish-close" onClick={()=>{setPublish(false);setAcceptRules(false)}} aria-label="Cerrar">×</button>
   <header className="pm34-publish-head"><div><span className="pm34-kicker">PUBLICAR SERVICIO FLEX</span><h2 id="pm34-publish-title">Creá una publicación clara en pocos minutos.</h2><p>Completá lo esencial. La fecha, la duración y el importe pueden quedar a coordinar y resolverlos después por mensajes.</p></div><div className="pm34-publish-steps" aria-hidden="true"><span><i>1</i> Servicio</span><span><i>2</i> Datos</span><span><i>3</i> Publicación</span></div></header>

   <div className="pm34-publish-layout"><div className="pm34-publish-main">
    <section className="pm34-section pm34-credit-section"><div className="pm34-section-title"><span>CUENTA Y CRÉDITOS</span><h3>¿Desde qué cuenta publicás?</h3></div><FlexCredits companyId={selectedCompanyId} onCompanyChange={setSelectedCompanyId} refreshKey={creditRefresh}/></section>

    <section className="pm34-section"><div className="pm34-section-title"><span>01 · EL SERVICIO</span><h3>Contá qué necesitás.</h3><p>Un título concreto y una descripción simple reciben mejores respuestas.</p></div><div className="pm34-fields"><label className="pm34-field"><span>Título de la tarea <b>*</b></span><input value={draft.title} onChange={e=>setDraft(v=>({...v,title:e.target.value}))} required minLength={5} placeholder="Ej. Armar dos muebles este sábado"/><small>Describí una tarea concreta, no un puesto permanente.</small></label><label className="pm34-field"><span>Categoría <b>*</b></span><select value={draft.category} onChange={e=>setDraft(v=>({...v,category:e.target.value,image_path:'',image_url:''}))} required><option value="">Elegí una categoría</option>{publishCategories.map(c=><option key={c} value={c}>{c}</option>)}</select><small>La imagen predeterminada se adapta a esta categoría.</small></label><label className="pm34-field full"><span>Descripción <b>*</b></span><textarea value={draft.description} onChange={e=>setDraft(v=>({...v,description:e.target.value}))} required minLength={15} rows={5} placeholder="Explicá la tarea puntual, el resultado esperado, materiales disponibles y cualquier detalle importante."/><small>{draft.description.length}/1800 · Usá el campo de contacto para el teléfono. No publiques claves ni documentación sensible.</small></label></div></section>

    <section className="pm34-section"><div className="pm34-section-title"><span>02 · ZONA Y DATOS OPCIONALES</span><h3>Dejá lo importante y acordá el resto después.</h3><p>Sólo la zona o modalidad es obligatoria. Fecha, importe y duración pueden quedar a coordinar.</p></div><div className="pm34-fields"><label className="pm34-field"><span>Zona o modalidad <b>*</b></span><input value={draft.location_text} onChange={e=>setDraft(v=>({...v,location_text:e.target.value}))} required placeholder="Ej. Palermo, CABA · o Remoto"/></label><label className="pm34-field"><span>Fecha estimada</span><input type="date" value={draft.scheduled_for} onChange={e=>setDraft(v=>({...v,scheduled_for:e.target.value}))}/><small>Opcional. Si no la sabés todavía, queda “A coordinar”.</small></label><label className="pm34-field"><span>Importe del servicio</span><input value={draft.compensation_text} onChange={e=>setDraft(v=>({...v,compensation_text:e.target.value}))} placeholder="Ej. $40.000 por tarea"/><small>Opcional. Si lo dejás vacío, se mostrará “A acordar”.</small></label><label className="pm34-field"><span>Duración estimada</span><input value={draft.duration_text} onChange={e=>setDraft(v=>({...v,duration_text:e.target.value}))} placeholder="Ej. 3 horas"/><small>Opcional. También pueden definirla por mensajes.</small></label></div></section>

    <section className="pm34-section"><div className="pm34-section-title"><span>03 · IMAGEN, CONTACTO E IDENTIDAD</span><h3>Elegí cómo se va a mostrar y cómo te contactan.</h3><p>Mensajes de Postulá Mejor queda siempre activo. El teléfono es opcional.</p></div><FlexImagePicker category={draft.category} imagePath={draft.image_path} imageUrl={draft.image_url} onChange={({path,url})=>setDraft(v=>({...v,image_path:path,image_url:url}))} onReset={()=>setDraft(v=>({...v,image_path:'',image_url:''}))}/>
     <div style={{marginTop:14,padding:18,border:'1px solid #dfe3e6',borderRadius:20,background:'#f8fafb'}}>
      <div style={{marginBottom:13}}><span style={{display:'block',fontSize:9,fontWeight:950,letterSpacing:'.14em',color:'#6254e5'}}>MEDIO DE CONTACTO</span><b style={{display:'block',marginTop:5,fontSize:18}}>Mensajes primero, teléfono si querés.</b></div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,padding:'12px 14px',borderRadius:14,background:'#fff',border:'1px solid #e0e4e7'}}><div><b style={{display:'block',fontSize:13}}>Mensajería interna</b><small style={{display:'block',marginTop:3,fontSize:10,color:'#737d85'}}>Predeterminada y siempre disponible para este servicio.</small></div><span style={{padding:'6px 9px',borderRadius:999,background:'#d9ff59',fontSize:10,fontWeight:950}}>ACTIVA</span></div>
      <label style={{display:'grid',gridTemplateColumns:'22px 1fr',gap:10,alignItems:'start',marginTop:10,padding:'13px 14px',borderRadius:14,background:'#fff',border:'1px solid #e0e4e7',cursor:'pointer'}}><input type="checkbox" checked={draft.allow_phone_contact} onChange={e=>setDraft(v=>({...v,allow_phone_contact:e.target.checked,contact_phone:e.target.checked?v.contact_phone:''}))} style={{width:19,height:19,marginTop:1,accentColor:'#5f55e4'}}/><span><b style={{display:'block',fontSize:13}}>También pueden contactarme por teléfono</b><small style={{display:'block',marginTop:3,fontSize:10,lineHeight:1.4,color:'#737d85'}}>Tu número sólo será visible para usuarios que hayan iniciado sesión.</small></span></label>
      {draft.allow_phone_contact&&<label className="pm34-field" style={{marginTop:12}}><span>Teléfono <b>*</b></span><input type="tel" value={draft.contact_phone} onChange={e=>setDraft(v=>({...v,contact_phone:e.target.value}))} required inputMode="tel" autoComplete="tel" placeholder="Ej. +54 9 11 4054 0970"/><small>Podés usar código de área. No se muestra a visitantes anónimos.</small></label>}
     </div>
     <div className="pm33-identity-choice pm34-identity"><div><span>IDENTIDAD EN LA PUBLICACIÓN</span><b>{selectedCompanyId?'¿Mostrar la identidad de la empresa?':'¿Mostrar tu identidad?'}</b><p>{publicIdentity?selectedCompanyId?'Se mostrará el nombre y el logo de la empresa si tiene uno cargado.':'Se mostrará tu nombre y tu foto si la tenés cargada.':'La publicación mantendrá la identidad reservada. Si publicás como persona se mostrará sólo el primer nombre; si publicás como empresa aparecerá como Empresa.'}</p></div><button type="button" data-on={publicIdentity} onClick={()=>setPublicIdentity(v=>!v)}><i/><span>{publicIdentity?'Visible':'Reservada'}</span></button></div></section>

    <section className="pm34-section pm34-rules"><div className="pm34-section-title"><span>04 · REGLAS DE PUBLICACIÓN</span><h3>Publicá una tarea real, legal y segura.</h3></div><div className="pm34-rule-grid"><p><b>Información verdadera.</b> La cuenta que publica es responsable por la tarea y las condiciones informadas.</p><p><b>Sin datos sensibles.</b> No se permiten contraseñas, credenciales bancarias, pagos previos injustificados ni pedidos de documentación sin una razón legítima.</p><p><b>Sin abuso ni fraude.</b> No se admiten tareas ilegales, discriminatorias, engañosas, inseguras, esquemas piramidales, suplantaciones, acoso o explotación.</p><p><b>No reemplaza un empleo.</b> Una relación con dependencia, continuidad, supervisión o cobertura de un puesto habitual no debe encubrirse como Servicio Flex.</p></div><div data-services-flex-payment="1" style={{marginTop:14,padding:'13px 14px',borderRadius:14,background:'#f3ffcf',border:'1px solid #d8ee91',fontSize:12,lineHeight:1.5,color:'#424b38'}}><b style={{display:'block',marginBottom:3,color:'#1b2414'}}>Pago directo entre las partes</b>Postulá Mejor no recibe, retiene, custodia ni libera el dinero del servicio. Los pagos dentro de la plataforma corresponden únicamente a planes, herramientas o créditos de publicación.</div><label className="pm34-policy-check"><input type="checkbox" required checked={acceptRules} onChange={e=>setAcceptRules(e.target.checked)}/><span>Leí y acepto estas reglas, los <a href="/terminos" target="_blank" rel="noopener noreferrer">Términos y Condiciones</a>, los <a href="/terminos/servicios-flex" target="_blank" rel="noopener noreferrer">Términos específicos de Servicios Flex</a> y la <a href="/privacidad" target="_blank" rel="noopener noreferrer">Política de Privacidad</a>, y asumo la responsabilidad por la legalidad y veracidad de esta publicación.</span></label></section>
   </div>

   <aside className="pm34-publish-preview"><div className="pm34-preview-sticky"><span className="pm34-preview-label">VISTA PREVIA</span><div className="pm34-preview-photo" style={{backgroundImage:`url(${previewImage})`}}><span>{previewWhen}</span></div><div className="pm34-preview-body"><div className="pm34-preview-top"><span>{draft.category||'Categoría'}</span><b>{draft.compensation_text||'A acordar'}</b></div><h3>{draft.title||'Tu servicio va a verse así'}</h3><p>{draft.description||'Mientras completás el formulario, vas a ver acá un resumen de lo que recibirán las personas interesadas.'}</p><div className="pm34-preview-meta"><span>⌖ {draft.location_text||'Zona a definir'}</span><span>◷ {draft.duration_text||'Duración a coordinar'}</span><span>✉ Mensajes de Postulá Mejor</span>{draft.allow_phone_contact&&<span>☎ Teléfono habilitado</span>}</div></div></div><div className="pm34-preview-help"><b>Antes de publicar</b><span>✓ Tarea concreta</span><span>✓ Zona o modalidad</span><span>✓ Fecha opcional</span><span>✓ Importe opcional</span><span>✓ Contacto definido</span><span>✓ Sin datos sensibles</span></div></aside></div>

   {notice&&<div className="pm34-form-notice">{notice}</div>}
   <footer className="pm34-publish-footer"><button type="button" className="pm34-secondary" onClick={()=>{setPublish(false);setAcceptRules(false)}}>Cancelar</button><div><small>{acceptRules?'Todo listo para publicar.':'Aceptá las reglas para habilitar la publicación.'}</small><button className="pm34-primary" disabled={busy||!acceptRules}>{busy?'Publicando…':'Publicar Servicio Flex'}</button></div></footer>
  </form></div>}
 </>
}