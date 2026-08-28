'use client'

import dynamic from 'next/dynamic'
import {useEffect,useState} from 'react'
import EmployerDashboardLive from './EmployerDashboardLive'
import EmployerDashboardLoadGuard from './EmployerDashboardLoadGuard'
import EmployerCandidateReputationInline from './EmployerCandidateReputationInline'

const EmployerJobManager=dynamic(()=>import('./EmployerJobManager'),{ssr:false,loading:()=> <div className="pm48-module-loading">Cargando empleos…</div>})
const FlexManager=dynamic(()=>import('../../changas-preview/FlexManager'),{ssr:false,loading:()=> <div className="pm48-module-loading">Cargando Servicios Flex…</div>})
const EmployerCompanyProfile=dynamic(()=>import('./EmployerCompanyProfile'),{ssr:false,loading:()=> <div className="pm48-module-loading">Cargando datos de empresa…</div>})
const EmployerTeamPermissions=dynamic(()=>import('./EmployerTeamPermissions'),{ssr:false,loading:()=> <div className="pm48-module-loading">Cargando equipo…</div>})
const EmployerBillingCenter=dynamic(()=>import('./EmployerBillingCenter'),{ssr:false,loading:()=> <div className="pm48-module-loading">Cargando planes y pagos…</div>})
const CompanyBranding=dynamic(()=>import('../configuracion/CompanyBranding'),{ssr:false})
const NotificationSettings=dynamic(()=>import('../../postula-preview/NotificationSettings'),{ssr:false})

type View='resumen'|'candidatos'|'mensajes'|'publicaciones'|'empresa'|'equipo'|'planes'|'configuracion'
type PublicationView='empleos'|'flex'
const views:readonly [View,string,string][]=[
 ['resumen','Resumen','⌂'],
 ['candidatos','Candidatos','◎'],
 ['mensajes','Mensajes','✉'],
 ['publicaciones','Publicaciones','▤'],
 ['empresa','Empresa','◫'],
 ['equipo','Equipo y permisos','♙'],
 ['planes','Planes y pagos','$'],
 ['configuracion','Configuración','⚙'],
]
function validView(value:string|null):value is View{return Boolean(value&&views.some(([key])=>key===value))}

export default function EmployerWorkspace(){
 const [view,setView]=useState<View>('resumen'),[publicationView,setPublicationView]=useState<PublicationView>('empleos')
 useEffect(()=>{
  const syncFromUrl=()=>{const tab=new URLSearchParams(window.location.search).get('tab');setView(validView(tab)?tab:'resumen')}
  const syncFromNav=(event:Event)=>{const tab=(event as CustomEvent<string>).detail;if(validView(tab))setView(tab)}
  syncFromUrl()
  window.addEventListener('popstate',syncFromUrl)
  window.addEventListener('pm:employer-tab',syncFromNav)
  return()=>{window.removeEventListener('popstate',syncFromUrl);window.removeEventListener('pm:employer-tab',syncFromNav)}
 },[])
 function choose(next:View){
  setView(next)
  const url=new URL(window.location.href)
  if(next==='resumen')url.searchParams.delete('tab');else url.searchParams.set('tab',next)
  window.history.replaceState({},'',url)
  window.dispatchEvent(new CustomEvent('pm:employer-tab',{detail:next}))
 }
 const needsLive=view==='resumen'||view==='candidatos'||view==='mensajes'
 return <div className="pm48-workspace" data-view={view}>
  <EmployerDashboardLoadGuard/>
  <aside className="pm48-sidebar" aria-label="Dashboard de empresa"><nav>{views.map(([key,label,icon])=><button type="button" key={key} data-on={view===key} onClick={()=>choose(key)}><span>{icon}</span>{label}</button>)}</nav><div className="pm48-side-bottom"><a href="/empresas/publicar">＋ Nueva búsqueda</a><a href="/">Ver sitio público ↗</a></div></aside>
  <main className="pm48-workspace-main">
   <div className="pm48-mobile-nav">{views.map(([key,label])=><button type="button" key={key} data-on={view===key} onClick={()=>choose(key)}>{label}</button>)}</div>
   {needsLive&&<div className="pm48-live"><EmployerDashboardLive/><EmployerCandidateReputationInline active={view==='candidatos'}/></div>}

   {view==='publicaciones'&&<section className="pm48-view pm48-publications"><header><div><small>PUBLICACIONES</small><h1>Empleos y Servicios Flex.</h1><p>Administrá tus publicaciones sin mezclar candidatos, pagos ni configuración.</p></div><a href="/empresas/publicar">Nueva búsqueda</a></header><div className="pm48-segmented"><button type="button" data-on={publicationView==='empleos'} onClick={()=>setPublicationView('empleos')}>Empleos</button><button type="button" data-on={publicationView==='flex'} onClick={()=>setPublicationView('flex')}>Servicios Flex</button></div><div className="pm48-module">{publicationView==='empleos'?<EmployerJobManager/>:<FlexManager accountMode/>}</div></section>}

   {view==='empresa'&&<section className="pm48-view pm48-company"><header><div><small>EMPRESA</small><h1>Datos e identidad.</h1><p>Nombre, actividad, contacto, descripción, imagen y validación de la empresa.</p></div></header><div className="pm48-settings-stack"><EmployerCompanyProfile/><CompanyBranding/></div></section>}

   {view==='equipo'&&<section className="pm48-view pm48-team-view"><header><div><small>EQUIPO Y PERMISOS</small><h1>Accesos claros para cada persona.</h1><p>Invitá integrantes y definí exactamente qué puede hacer cada uno.</p></div></header><EmployerTeamPermissions/></section>}

   {view==='planes'&&<section className="pm48-view pm48-billing-view"><header><div><small>PLANES Y PAGOS</small><h1>Plan, créditos y compras.</h1><p>Todo lo económico de la cuenta empresa queda en una sección propia.</p></div></header><EmployerBillingCenter/></section>}

   {view==='configuracion'&&<section className="pm48-view pm48-settings"><header><div><small>CONFIGURACIÓN</small><h1>Preferencias de la cuenta.</h1><p>Activá o desactivá avisos y permisos del dispositivo. Los datos, el equipo y los pagos se administran en sus secciones correspondientes.</p></div></header><div className="pm48-settings-stack"><NotificationSettings audience="employer"/></div></section>}
  </main>
 </div>
}
