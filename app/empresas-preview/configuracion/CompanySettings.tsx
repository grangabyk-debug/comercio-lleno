'use client'

import Link from 'next/link'
import {FormEvent,useEffect,useMemo,useState} from 'react'
import {cvAuthClient} from '../../cv-ia/cvAuth'

type Company={id:string;name:string;legal_name?:string|null;verification_status:string;trust_score:number;industry?:string|null;city?:string|null;province?:string|null;website?:string|null;phone?:string|null;tax_id?:string|null;description?:string|null}
type Member={user_id:string;email?:string|null;role:string;status:string;created_at:string}
type Invite={id:string;email:string;role:string;status:string;expires_at:string}
type Plan={code:string;label:string;status:string;provider?:string|null;current_period_end?:string|null;pending_plan?:string|null;pending_started_at?:string|null;nexo_enabled:boolean}
type Flex={total:number;free:number;bonus:number;period_remaining:number;purchased:number;period_expires_at?:string|null;purchases:Array<{id:string;pack_code:string;credits:number;amount_ars:number;status:string;provider?:string|null;credited_at?:string|null;created_at:string}>}
type Check={id:string;kind:string;status:string;checked_at?:string|null;created_at:string}
type Summary={company:Company;my_role:string;team:{members:Member[];invites:Invite[]};plan:Plan;flex:Flex;verification:{checks:Check[]};support:{open:number;urgent:number};billing:{fiscal_invoices_available:boolean;note:string}}

async function session(){const {data}=await cvAuthClient().auth.getSession();return data.session}
const roleLabel:Record<string,string>={owner:'Propietario',admin:'Administrador',recruiter:'Recursos Humanos',hiring_manager:'Responsable que entrevista',viewer:'Sólo lectura'}
const checkLabel:Record<string,string>={basic_identity:'Identidad básica',work_email:'Email laboral',website:'Sitio web',tax:'Datos fiscales',phone:'Teléfono',manual:'Revisión manual'}
const money=(value:number)=>new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(value||0)
const date=(value?:string|null)=>value?new Date(value).toLocaleDateString('es-AR'):'—'

export default function CompanySettings(){
 const [data,setData]=useState<Summary|null>(null),[email,setEmail]=useState(''),[role,setRole]=useState('recruiter'),[inviteUrl,setInviteUrl]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true)
 async function load(){
  setLoading(true)
  const s=await session();if(!s){setLoading(false);return}
  const r=await fetch('/api/postula/company/account',{headers:{Authorization:`Bearer ${s.access_token}`}})
  const d=await r.json().catch(()=>({}))
  if(r.ok&&d?.ok)setData(d)
  else setNotice(d?.error||'No pudimos cargar la Cuenta empresa.')
  setLoading(false)
 }
 useEffect(()=>{void load()},[])
 const canManage=Boolean(data&&['owner','admin'].includes(data.my_role))
 const pendingInvites=useMemo(()=>data?.team.invites.filter(x=>x.status==='pending')||[],[data])

 async function invite(e:FormEvent){
  e.preventDefault();if(!data||!canManage)return
  setBusy(true);setNotice('');setInviteUrl('')
  try{
   const s=await session();if(!s)throw new Error('Iniciá sesión.')
   const r=await fetch('/api/postula/company/team',{method:'POST',headers:{Authorization:`Bearer ${s.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({company_id:data.company.id,email,role})})
   const d=await r.json().catch(()=>({}));if(!r.ok||!d?.ok)throw new Error(d?.error||'No pudimos crear la invitación.')
   setInviteUrl(`${location.origin}${d.invite_url}`);setEmail('');setNotice('Invitación creada. Copiá el enlace o compartilo con esa persona.');await load()
  }catch(e){setNotice(e instanceof Error?e.message:'No pudimos invitar.')}finally{setBusy(false)}
 }
 async function changeMember(member:Member,nextRole:string,nextStatus=member.status){
  if(!data||!canManage||member.role==='owner')return
  setNotice('')
  try{
   const s=await session();if(!s)throw new Error('Iniciá sesión.')
   const r=await fetch('/api/postula/company/team',{method:'PATCH',headers:{Authorization:`Bearer ${s.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({company_id:data.company.id,user_id:member.user_id,role:nextRole,status:nextStatus})})
   const d=await r.json().catch(()=>({}));if(!r.ok||!d?.ok)throw new Error(d?.error||'No pudimos actualizar el permiso.')
   setNotice('Permiso actualizado.');await load()
  }catch(e){setNotice(e instanceof Error?e.message:'No pudimos actualizar el permiso.')}
 }

 if(loading)return <section className="pmset-loading">Preparando tu Cuenta empresa…</section>
 if(!data)return <section className="pmset-empty"><span>CUENTA EMPRESA</span><h1>Armemos tu espacio de contratación.</h1><p>Creá o vinculá una empresa para administrar identidad, equipo, publicaciones, créditos y soporte desde un mismo lugar.</p><Link href="/empresas/registro">+ Configurar empresa</Link></section>
 const {company,plan,flex}=data
 return <section className="pmset-page">
  <header className="pmset-head"><div><span>CUENTA EMPRESA</span><h1>{company.name}</h1><p>{company.industry||'Empresa'} · {[company.city,company.province].filter(Boolean).join(', ')||'Argentina'} · {roleLabel[data.my_role]||data.my_role}</p></div><div className="pmset-head-actions"><Link href="/empresas/panel">Panel</Link><Link href="/empresas/publicar" className="primary">+ Nueva búsqueda</Link></div></header>

  <div className="pmset-overview">
   <article><small>VALIDACIÓN</small><b>{company.verification_status==='verified'?'Empresa verificada':'Validación básica'}</b><span>{company.trust_score||0}% de señales completadas</span></article>
   <article><small>PLAN ACTUAL</small><b>{plan.label}</b><span>{plan.status==='authorized'?'Activo':plan.pending_plan?`Cambio a ${plan.pending_plan} pendiente`:'Nivel gratuito'}</span></article>
   <article data-good={plan.nexo_enabled}><small>NEXO MÓVIL</small><b>{plan.nexo_enabled?'Habilitado':'No incluido'}</b><span>{plan.nexo_enabled?'Disponible para tu equipo':'Disponible desde Selección IA'}</span></article>
   <article><small>TRABAJO FLEX</small><b>{flex.total} crédito{flex.total===1?'':'s'}</b><span>{flex.period_expires_at?`beneficio vigente hasta ${date(flex.period_expires_at)}`:'saldo disponible'}</span></article>
   <article><small>SOPORTE</small><b>{data.support.open} abierto{data.support.open===1?'':'s'}</b><span>{data.support.urgent?`${data.support.urgent} de prioridad urgente`:'sin urgencias abiertas'}</span></article>
  </div>

  {notice&&<div className="pmset-notice">{notice}<button onClick={()=>setNotice('')}>×</button></div>}

  <div className="pmset-grid">
   <article className="pmset-card pmset-identity"><div className="pmset-card-head"><div><span>IDENTIDAD Y VALIDACIÓN</span><h2>La empresa detrás de cada aviso.</h2></div><b data-status={company.verification_status}>{company.verification_status==='verified'?'Verificada':'Básica'}</b></div><div className="pmset-trust"><strong>{company.trust_score||0}%</strong><div><b>Señales de confianza</b><p>Postulá Mejor conserva la identidad real de la empresa aunque elijas publicar una búsqueda confidencial.</p></div></div><div className="pmset-facts"><div><small>Razón / nombre</small><b>{company.legal_name||company.name}</b></div><div><small>Actividad</small><b>{company.industry||'Pendiente'}</b></div><div><small>Ubicación</small><b>{[company.city,company.province].filter(Boolean).join(', ')||'Pendiente'}</b></div><div><small>Contacto</small><b>{company.phone?'Teléfono cargado':'Teléfono pendiente'}</b></div><div><small>Sitio web</small><b>{company.website||'Opcional'}</b></div><div><small>CUIT / ID fiscal</small><b>{company.tax_id?'Cargado':'Opcional por ahora'}</b></div></div>{data.verification.checks.length>0&&<div className="pmset-checks">{data.verification.checks.slice(0,6).map(x=><span key={x.id} data-ok={x.status==='passed'||x.status==='verified'}><i/>{checkLabel[x.kind]||x.kind}: {x.status}</span>)}</div>}<Link className="pmset-inline-action" href="/empresas/registro">Editar datos de empresa →</Link></article>

   <article className="pmset-card pmset-plan"><div className="pmset-card-head"><div><span>PLAN Y CAPACIDAD</span><h2>{plan.label}</h2></div><b data-status={plan.status}>{plan.status==='authorized'?'Activo':'Gratis'}</b></div><p className="pmset-bigcopy">Tu plan define búsquedas, volumen de candidatos y acceso a Nexo. Trabajo Flex usa créditos separados.</p><div className="pmset-plan-features"><div><span>Nexo móvil</span><b>{plan.nexo_enabled?'Incluido':'Desde Selección IA'}</b></div><div><span>Próxima renovación / período</span><b>{date(plan.current_period_end)}</b></div><div><span>Cambio pendiente</span><b>{plan.pending_plan||'Ninguno'}</b></div></div><div className="pmset-plan-actions"><Link href="/empresas">Ver o cambiar plan</Link>{plan.nexo_enabled?<Link href="/empresas/movil" className="dark">Abrir Nexo</Link>:<Link href="/empresas" className="dark">Habilitar Nexo</Link>}</div></article>
  </div>

  <div className="pmset-grid">
   <article className="pmset-card"><div className="pmset-card-head"><div><span>TRABAJO FLEX</span><h2>Créditos disponibles.</h2></div><b>{flex.total}</b></div><div className="pmset-credit-bars"><div><span>Incluidos por plan</span><strong>{flex.period_remaining}</strong></div><div><span>Comprados</span><strong>{flex.purchased}</strong></div><div><span>Bonificación</span><strong>{flex.bonus}</strong></div><div><span>Gratis</span><strong>{flex.free}</strong></div></div><p className="pmset-copy">Cada publicación Flex consume un crédito. Los créditos comprados se mantienen; los incluidos por el plan siguen su vigencia.</p><Link className="pmset-inline-action" href="/trabajos-flex">Publicar o comprar créditos →</Link></article>

   <article className="pmset-card"><div className="pmset-card-head"><div><span>PAGOS Y COMPROBANTES</span><h2>Historial de compras.</h2></div></div>{flex.purchases.length?<div className="pmset-purchases">{flex.purchases.slice(0,6).map(p=><div key={p.id}><div><b>{p.credits} crédito{p.credits===1?'':'s'} Flex</b><small>{date(p.credited_at||p.created_at)} · {p.status}</small></div><strong>{money(p.amount_ars)}</strong></div>)}</div>:<div className="pmset-zero"><b>Todavía no hay compras registradas.</b><p>Cuando compres créditos Flex o contrates productos compatibles, van a aparecer acá.</p></div>}<p className="pmset-legal-note">Los registros de pago no reemplazan una factura fiscal. Cuando la emisión fiscal esté configurada, los comprobantes descargables aparecerán en este mismo módulo.</p></article>
  </div>

  <article className="pmset-card pmset-team"><div className="pmset-card-head"><div><span>EQUIPO Y PERMISOS</span><h2>Cada persona con su propia cuenta.</h2></div><b>{data.team.members.filter(x=>x.status==='active').length} activos</b></div><p className="pmset-bigcopy">No compartas contraseñas. Invitá a cada integrante y asignale sólo el nivel de acceso que necesita.</p><div className="pmset-member-list">{data.team.members.map((m,i)=><div key={m.user_id} data-disabled={m.status!=='active'}><span className="pmset-member-avatar">{(m.email||String(i+1)).slice(0,2).toUpperCase()}</span><div className="pmset-member-info"><b>{m.email||`Integrante ${i+1}`}</b><small>{roleLabel[m.role]||m.role} · {m.status}</small></div>{canManage&&m.role!=='owner'?<><select aria-label="Rol" value={m.role} onChange={e=>changeMember(m,e.target.value)}><option value="admin">Administrador</option><option value="recruiter">Recursos Humanos</option><option value="hiring_manager">Responsable que entrevista</option><option value="viewer">Sólo lectura</option></select><button className="pmset-member-toggle" onClick={()=>changeMember(m,m.role,m.status==='active'?'disabled':'active')}>{m.status==='active'?'Pausar':'Reactivar'}</button></>:<span className="pmset-owner-badge">{m.role==='owner'?'Propietario':'Sin permiso de edición'}</span>}</div>)}</div>
   {canManage&&<form className="pmset-form" onSubmit={invite}><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="rrhh@empresa.com"/></label><label>Rol<select value={role} onChange={e=>setRole(e.target.value)}><option value="recruiter">Recursos Humanos</option><option value="hiring_manager">Responsable que entrevista</option><option value="admin">Administrador</option><option value="viewer">Sólo lectura</option></select></label><button disabled={busy}>{busy?'Creando…':'+ Invitar'}</button></form>}
   {inviteUrl&&<div className="pmset-invite-link"><b>Enlace listo para compartir</b><input readOnly value={inviteUrl}/><button onClick={()=>navigator.clipboard?.writeText(inviteUrl)}>Copiar</button></div>}
   {pendingInvites.length>0&&<div className="pmset-pending"><b>{pendingInvites.length} invitación{pendingInvites.length===1?' pendiente':'es pendientes'}</b>{pendingInvites.slice(0,6).map(x=><span key={x.id}>{x.email} · {roleLabel[x.role]||x.role}</span>)}</div>}
  </article>

  <div className="pmset-grid pmset-bottom-grid">
   <article className="pmset-card"><span className="pmset-kicker">SOPORTE</span><h2>Ayuda con contexto, no un formulario perdido.</h2><p className="pmset-bigcopy">El botón Ayuda está disponible en toda tu cuenta. Los reportes de seguridad y estafa se priorizan automáticamente.</p><div className="pmset-support-stat"><strong>{data.support.open}</strong><span>casos abiertos</span></div><button className="pmset-help-trigger" onClick={()=>document.querySelector<HTMLElement>('[data-pm-support-open]')?.click()}>Abrir Ayuda</button></article>
   <article className="pmset-card pmset-security"><span>SEGURIDAD Y PRIVACIDAD</span><h2>Los CV son para selección, no una base comercial.</h2><p>Los datos de candidatos deben utilizarse exclusivamente para procesos legítimos de contratación. No está permitido revenderlos, usarlos para marketing, compartirlos sin necesidad ni construir bases privadas paralelas fuera de la finalidad del servicio.</p><Link href="/terminos">Ver Términos →</Link></article>
  </div>
 </section>
}
