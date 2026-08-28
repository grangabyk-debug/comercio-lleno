'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useEffect,useState} from 'react'
import {createPortal} from 'react-dom'
import {cvAuthClient} from '../cv-ia/cvAuth'

type Active='inicio'|'empleos'|'cuenta'|'cv'|'changas'|'mensajes'
type IconKind='home'|'search'|'bolt'|'menu'|'user'|'chat'|'briefcase'|'heart'|'settings'|'logout'|'building'|'calendar'
type EmployerTab='resumen'|'candidatos'|'mensajes'|'publicaciones'|'empresa'|'equipo'|'planes'|'configuracion'
const employerTabs:EmployerTab[]=['resumen','candidatos','mensajes','publicaciones','empresa','equipo','planes','configuracion']
function validEmployerTab(value:string|null):value is EmployerTab{return Boolean(value&&employerTabs.includes(value as EmployerTab))}

function Icon({kind}:{kind:IconKind}){
 const common={fill:'none',stroke:'currentColor',strokeWidth:1.85,strokeLinecap:'round' as const,strokeLinejoin:'round' as const}
 if(kind==='home')return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M3.8 10.4 12 3.8l8.2 6.6v9.1a.7.7 0 0 1-.7.7h-5.2v-6H9.7v6H4.5a.7.7 0 0 1-.7-.7z"/></svg>
 if(kind==='search')return <svg viewBox="0 0 24 24" aria-hidden="true"><circle {...common} cx="10.7" cy="10.7" r="6.3"/><path {...common} d="m15.5 15.5 4.5 4.5"/></svg>
 if(kind==='bolt')return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M13.3 2.8 5.9 13h5.2l-.5 8.2L18.1 11h-5.2z"/></svg>
 if(kind==='menu')return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M5 7h14M5 12h14M5 17h14"/></svg>
 if(kind==='user')return <svg viewBox="0 0 24 24" aria-hidden="true"><circle {...common} cx="12" cy="8" r="3.4"/><path {...common} d="M5.5 20c.7-4 3-6 6.5-6s5.8 2 6.5 6"/></svg>
 if(kind==='chat')return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M4.5 5.3h15v10.2h-8.1l-4.8 3.3v-3.3H4.5z"/></svg>
 if(kind==='briefcase')return <svg viewBox="0 0 24 24" aria-hidden="true"><rect {...common} x="3.5" y="7" width="17" height="12" rx="2"/><path {...common} d="M9 7V5.5h6V7M3.8 12.2c5.4 2.2 10.9 2.2 16.4 0"/></svg>
 if(kind==='heart')return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M12 20.2 4.5 13a5 5 0 0 1 7.5-6.6A5 5 0 0 1 19.5 13z"/></svg>
 if(kind==='settings')return <svg viewBox="0 0 24 24" aria-hidden="true"><circle {...common} cx="12" cy="12" r="3"/><path {...common} d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M18 6l-1.4 1.4M7.4 16.6 6 18"/></svg>
 if(kind==='building')return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M5 20V5h9v15M14 9h5v11M8 8h3M8 11.5h3M8 15h3M17 12h.1M17 15h.1M3 20h18"/></svg>
 if(kind==='calendar')return <svg viewBox="0 0 24 24" aria-hidden="true"><rect {...common} x="3.5" y="5.5" width="17" height="15" rx="2"/><path {...common} d="M7.5 3.5v4M16.5 3.5v4M3.5 10h17M7.5 14h.1M12 14h.1M16.5 14h.1M7.5 17h.1M12 17h.1"/></svg>
 if(kind==='logout')return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9"/></svg>
 return null
}

export default function MobileNavigation({active='inicio'}:{active?:Active}){
 const pathname=usePathname()||'/'
 const employer=pathname.startsWith('/empresas')
 const [logged,setLogged]=useState<boolean|null>(null)
 const [open,setOpen]=useState(false)
 const [busy,setBusy]=useState(false)
 const [unread,setUnread]=useState(0)
 const [employerTab,setEmployerTab]=useState<EmployerTab>('resumen')

 useEffect(()=>{
  let alive=true
  const client=cvAuthClient()
  const sync=(session:any)=>{if(!alive)return;setLogged(Boolean(session));if(!session)setUnread(0)}
  client.auth.getSession().then(({data})=>sync(data.session)).catch(()=>sync(null))
  const {data:listener}=client.auth.onAuthStateChange((_event,session)=>sync(session))
  return()=>{alive=false;listener.subscription.unsubscribe()}
 },[])

 useEffect(()=>{
  if(!employer)return
  const syncFromUrl=()=>{const tab=new URLSearchParams(window.location.search).get('tab');setEmployerTab(validEmployerTab(tab)?tab:'resumen')}
  const syncFromNav=(event:Event)=>{const tab=(event as CustomEvent<string>).detail;if(validEmployerTab(tab))setEmployerTab(tab)}
  syncFromUrl()
  window.addEventListener('popstate',syncFromUrl)
  window.addEventListener('pm:employer-tab',syncFromNav)
  return()=>{window.removeEventListener('popstate',syncFromUrl);window.removeEventListener('pm:employer-tab',syncFromNav)}
 },[employer])

 useEffect(()=>{
  if(!logged)return
  let alive=true,channel:any=null
  const client=cvAuthClient()
  const load=async()=>{
   const {data}=await client.auth.getSession();const token=data.session?.access_token;if(!token||!alive)return
   try{const r=await fetch(`/api/postula/messages?audience=${employer?'employer':'candidate'}`,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});const d=await r.json().catch(()=>({}));if(r.ok&&alive)setUnread((d?.conversations||[]).reduce((n:number,x:any)=>n+Number(x?.unread_count||0),0))}catch{}
  }
  const start=async()=>{
   const {data}=await client.auth.getSession();const user=data.session?.user;if(!user||!alive)return
   await load()
   channel=client.channel(`pm-nav-${user.id}-${employer?'employer':'candidate'}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'pm_notifications',filter:`user_id=eq.${user.id}`},(payload:any)=>{if(payload?.new?.notification_type==='message'&&document.visibilityState==='visible')void load()}).subscribe()
  }
  void start()
  const focus=()=>{if(document.visibilityState==='visible')void load()}
  const visible=()=>{if(document.visibilityState==='visible')void load()}
  const read=()=>void load()
  window.addEventListener('focus',focus);window.addEventListener('pm:messages-read',read);document.addEventListener('visibilitychange',visible)
  return()=>{alive=false;window.removeEventListener('focus',focus);window.removeEventListener('pm:messages-read',read);document.removeEventListener('visibilitychange',visible);if(channel)void client.removeChannel(channel)}
 },[logged,employer])

 useEffect(()=>{
  if(!open)return
  const previous=document.body.style.overflow;document.body.style.overflow='hidden'
  const key=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpen(false)}
  window.addEventListener('keydown',key)
  return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',key)}
 },[open])

 async function logout(){
  if(busy)return;setBusy(true)
  try{await cvAuthClient().auth.signOut({scope:'local'})}catch{}
  finally{setOpen(false);setLogged(false);setBusy(false);location.replace(employer?'/empresas':'/')}
 }

 function employerNavigate(tab:EmployerTab){window.dispatchEvent(new CustomEvent('pm:employer-tab',{detail:tab}))}
 const close=()=>setOpen(false)
 const closeEmployer=(tab:EmployerTab)=>{employerNavigate(tab);close()}
 const guest=logged!==true
 const menuLabel=logged===null?'Cargando cuenta':'Menú'
 const sheet=open?<div className="pm46-sheet-backdrop" role="presentation" onMouseDown={event=>{if(event.currentTarget===event.target)setOpen(false)}}><section className="pm46-sheet" role="dialog" aria-modal="true" aria-label="Menú móvil de Postulá Mejor">
  <div className="pm46-sheet-grabber"/>
  <header className="pm46-sheet-head"><div><small>{guest?'POSTULÁ MEJOR':employer?'CUENTA EMPRESA':'TU CUENTA'}</small><h2>{guest?'Explorá o ingresá.':employer?'Gestioná tu empresa.':'Todo lo tuyo, acá.'}</h2></div><button type="button" onClick={close} aria-label="Cerrar menú">×</button></header>
  {guest?<>
   <div className="pm46-auth-actions">{employer?<><Link href="/empresas/login" onClick={close}>Ingresar como empresa</Link><Link href="/empresas/registro" className="secondary" onClick={close}>Crear cuenta empresa</Link></>:<><Link href="/login" onClick={close}>Iniciar sesión</Link><Link href="/registro" className="secondary" onClick={close}>Crear cuenta gratis</Link></>}</div>
   <nav className="pm46-sheet-links" aria-label="Navegación pública"><Link href="/" onClick={close}><Icon kind="home"/><span><b>Inicio</b><small>Volver a Postulá Mejor</small></span></Link><Link href="/empleos" onClick={close}><Icon kind="search"/><span><b>Empleos</b><small>Explorar oportunidades</small></span></Link><Link href="/servicios-flex" onClick={close}><Icon kind="bolt"/><span><b>Servicios Flex</b><small>Buscar u ofrecer servicios</small></span></Link><Link href="/empresas" onClick={close}><Icon kind="building"/><span><b>Empresas</b><small>Publicar y contratar</small></span></Link></nav>
  </>:<>
   <nav className="pm46-sheet-links" aria-label="Opciones de cuenta">{employer?<><Link href="/empresas/calendario" onClick={close}><Icon kind="calendar"/><span><b>Calendario</b><small>Entrevistas y tareas del equipo</small></span></Link><Link href="/empresas/panel?tab=publicaciones" onClick={()=>closeEmployer('publicaciones')}><Icon kind="briefcase"/><span><b>Publicaciones</b><small>Empleos y Servicios Flex</small></span></Link><Link href="/empresas/panel?tab=empresa" onClick={()=>closeEmployer('empresa')}><Icon kind="building"/><span><b>Empresa</b><small>Datos, identidad y perfil</small></span></Link><Link href="/empresas/panel?tab=equipo" onClick={()=>closeEmployer('equipo')}><Icon kind="user"/><span><b>Equipo y permisos</b><small>Integrantes y accesos</small></span></Link><Link href="/empresas/panel?tab=planes" onClick={()=>closeEmployer('planes')}><Icon kind="briefcase"/><span><b>Planes y pagos</b><small>Suscripción y créditos</small></span></Link><Link href="/empresas/panel?tab=configuracion" onClick={()=>closeEmployer('configuracion')}><Icon kind="settings"/><span><b>Configuración</b><small>Preferencias de la cuenta</small></span></Link><Link href="/" onClick={close} className="pm46-role-switch"><Icon kind="user"/><span><b>Soy postulante</b><small>Ir al lado de búsqueda de empleo</small></span></Link></>:<><Link href="/calendario" onClick={close}><Icon kind="calendar"/><span><b>Calendario</b><small>Entrevistas y tareas personales</small></span></Link><Link href="/mi-cuenta" onClick={close}><Icon kind="user"/><span><b>Mi cuenta</b><small>Perfil y resumen</small></span></Link><Link href="/mi-cuenta?tab=mensajes" onClick={close}><Icon kind="chat"/><span><b>Mensajes</b><small>Empleos y Servicios Flex</small></span>{unread>0&&<em>{unread>99?'99+':unread}</em>}</Link><Link href="/mi-cuenta?tab=postulaciones" onClick={close}><Icon kind="briefcase"/><span><b>Postulaciones</b><small>Seguí tus procesos</small></span></Link><Link href="/mi-cuenta?tab=favoritos" onClick={close}><Icon kind="heart"/><span><b>Favoritos</b><small>Lo que guardaste</small></span></Link><Link href="/mi-cuenta?tab=configuracion" onClick={close}><Icon kind="settings"/><span><b>Configuración</b><small>Privacidad y preferencias</small></span></Link><Link href="/empresas" onClick={close} className="pm46-role-switch"><Icon kind="building"/><span><b>Soy empresa</b><small>Publicá empleos y gestioná candidatos</small></span></Link></>}</nav>
   <button type="button" className="pm46-logout" onClick={()=>void logout()} disabled={busy}><Icon kind="logout"/><span><b>{busy?'Cerrando sesión…':'Cerrar sesión'}</b><small>Salir de esta cuenta en el dispositivo</small></span></button>
  </>}
 </section></div>:null

 const employerMenuActive=employer&&(pathname.includes('/calendario')||['publicaciones','empresa','equipo','planes','configuracion'].includes(employerTab))
 return <>
  <div className="pm46-mobile-root" data-auth={logged===true?'in':'out'} data-audience={employer?'employer':'candidate'}>
   {logged===true?<nav className="pm46-dock" aria-label="Navegación móvil">
    <Link href={employer?'/empresas/panel':'/'} onClick={employer?()=>employerNavigate('resumen'):undefined} data-active={employer?employerTab==='resumen'&&!pathname.includes('/calendario'):active==='inicio'}><span><Icon kind={employer?'building':'home'}/></span><b>{employer?'Panel':'Inicio'}</b></Link>
    <Link href={employer?'/empresas/panel?tab=candidatos':'/empleos'} onClick={employer?()=>employerNavigate('candidatos'):undefined} data-active={employer?employerTab==='candidatos'&&!pathname.includes('/calendario'):active==='empleos'}><span><Icon kind={employer?'user':'search'}/></span><b>{employer?'Candidatos':'Empleos'}</b></Link>
    <Link href={employer?'/empresas/panel?tab=mensajes':'/servicios-flex'} onClick={employer?()=>employerNavigate('mensajes'):undefined} data-active={employer?employerTab==='mensajes'&&!pathname.includes('/calendario'):active==='changas'}><span><Icon kind={employer?'chat':'bolt'}/>{employer&&unread>0&&<i>{unread>9?'9+':unread}</i>}</span><b>{employer?'Mensajes':'Servicios'}</b></Link>
    <button type="button" data-active={employer?employerMenuActive:active==='cuenta'||active==='mensajes'||pathname==='/calendario'} onClick={()=>setOpen(true)} aria-expanded={open}><span><Icon kind="menu"/>{!employer&&unread>0&&<i>{unread>9?'9+':unread}</i>}</span><b>Menú</b></button>
   </nav>:<button type="button" className="pm46-guest-menu" onClick={()=>setOpen(true)} aria-expanded={open}><span className="pm46-guest-mark"><i/><i/><i/></span><b>{menuLabel}</b><small>{logged===null?'':'Ingresar · explorar'}</small></button>}
  </div>
  {sheet&&typeof document!=='undefined'?createPortal(sheet,document.body):null}
 </>
}
