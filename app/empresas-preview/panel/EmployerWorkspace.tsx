'use client'

import dynamic from 'next/dynamic'
import {useEffect,useState} from 'react'
import EmployerDashboardLive from './EmployerDashboardLive'
import EmployerCandidateReputationInline from './EmployerCandidateReputationInline'

const EmployerJobManager=dynamic(()=>import('./EmployerJobManager'),{ssr:false,loading:()=> <div className="pm48-module-loading">Cargando empleos…</div>})
const FlexManager=dynamic(()=>import('../../changas-preview/FlexManager'),{ssr:false,loading:()=> <div className="pm48-module-loading">Cargando Servicios Flex…</div>})
const CompanySettings=dynamic(()=>import('../configuracion/CompanySettings'),{ssr:false,loading:()=> <div className="pm48-module-loading">Cargando datos de empresa…</div>})
const CompanyBranding=dynamic(()=>import('../configuracion/CompanyBranding'),{ssr:false})
const NotificationSettings=dynamic(()=>import('../../postula-preview/NotificationSettings'),{ssr:false})
const EmployerSetupOnboarding=dynamic(()=>import('./EmployerSetupOnboarding'),{ssr:false})

type View='resumen'|'candidatos'|'mensajes'|'publicaciones'|'empresa'
type PublicationView='empleos'|'flex'
const views:readonly [View,string,string][]=[['resumen','Resumen','⌂'],['candidatos','Candidatos','◎'],['mensajes','Mensajes','✉'],['publicaciones','Publicaciones','▤'],['empresa','Configuración','⚙']]

export default function EmployerWorkspace(){
 const [view,setView]=useState<View>('resumen'),[publicationView,setPublicationView]=useState<PublicationView>('empleos')
 useEffect(()=>{const tab=new URLSearchParams(window.location.search).get('tab') as View|null;if(tab&&views.some(([key])=>key===tab))setView(tab)},[])
 function choose(next:View){setView(next);const url=new URL(window.location.href);if(next==='resumen')url.searchParams.delete('tab');else url.searchParams.set('tab',next);window.history.replaceState({},'',url)}
 const needsLive=view==='resumen'||view==='candidatos'||view==='mensajes'
 return <div className="pm48-workspace" data-view={view}>
  <aside className="pm48-sidebar" aria-label="Dashboard de empresa"><div className="pm48-brand"><i>PM</i><div><b>Postulá Mejor</b><small>Dashboard empresa</small></div></div><nav>{views.map(([key,label,icon])=><button type="button" key={key} data-on={view===key} onClick={()=>choose(key)}><span>{icon}</span>{label}</button>)}</nav><div className="pm48-side-bottom"><a href="/empresas/publicar">＋ Nueva búsqueda</a><a href="/">Ver sitio público ↗</a></div></aside>
  <main className="pm48-workspace-main">
   <div className="pm48-mobile-nav">{views.map(([key,label])=><button type="button" key={key} data-on={view===key} onClick={()=>choose(key)}>{label}</button>)}</div>
   {needsLive&&<div className="pm48-live"><EmployerDashboardLive/>{view==='candidatos'&&<EmployerCandidateReputationInline/>}</div>}
   {view==='publicaciones'&&<section className="pm48-view pm48-publications"><header><div><small>PUBLICACIONES</small><h1>Empleos y Servicios Flex.</h1><p>Administrá lo publicado sin llenar el resumen principal de información.</p></div><a href="/empresas/publicar">Nueva búsqueda</a></header><div className="pm48-segmented"><button type="button" data-on={publicationView==='empleos'} onClick={()=>setPublicationView('empleos')}>Empleos</button><button type="button" data-on={publicationView==='flex'} onClick={()=>setPublicationView('flex')}>Servicios Flex</button></div><div className="pm48-module">{publicationView==='empleos'?<EmployerJobManager/>:<FlexManager accountMode/>}</div></section>}
   {view==='empresa'&&<section className="pm48-view pm48-settings"><header><div><small>CONFIGURACIÓN</small><h1>Tu empresa, en un solo lugar.</h1><p>Datos, imagen, validación, créditos y notificaciones dentro de la misma dashboard.</p></div></header><div className="pm48-settings-stack"><CompanySettings/><CompanyBranding/><details className="pm48-settings-details"><summary><div><small>NOTIFICACIONES</small><b>Avisos y permisos del dispositivo</b></div><span>Administrar</span></summary><div><NotificationSettings audience="employer"/></div></details><details className="pm48-settings-details"><summary><div><small>CUENTA Y VALIDACIÓN</small><b>Créditos, validación y puesta a punto</b></div><span>Administrar</span></summary><div><EmployerSetupOnboarding/></div></details></div></section>}
  </main>
 </div>
}
