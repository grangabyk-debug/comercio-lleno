'use client'

import Link from 'next/link'
import {useEffect,useMemo,useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'

type SavedApplication={title:string;company:string;status:string;date:string}
const demoApps:SavedApplication[]=[{title:'Customer Support Representative',company:'Emi Labs',status:'Preparada',date:'Hoy'},{title:'Junior para Auditoría Externa',company:'EY',status:'Guardada',date:'Ayer'}]

export default function CandidateDashboard({jobCount=0}:{jobCount?:number}){
 const [email,setEmail]=useState('')
 const [apps,setApps]=useState<SavedApplication[]>([])
 useEffect(()=>{cvAuthClient().auth.getSession().then(({data})=>setEmail(data.session?.user.email||''));try{const raw=localStorage.getItem('pm_preview_applications');setApps(raw?JSON.parse(raw):demoApps)}catch{setApps(demoApps)}},[])
 const initials=useMemo(()=>email?email.split('@')[0].split(/[._-]/).filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase()).join(''):'YO',[email])
 return <div className="pm7-account-shell">
  <aside className="pm7-account-left"><div className="pm7-account-profile"><div className="pm7-account-cover"><span>BUSCANDO ALGO MEJOR</span></div><div className="pm7-account-avatar">{initials}</div><h2>Tu perfil</h2><p>{email||'Vista de preview · iniciá sesión para sincronizar tu actividad.'}</p><div className="pm7-account-progress"><div><b>72%</b><span>perfil completo</span></div><i><u/></i></div><Link href="/cv-ia">Completar perfil</Link></div><nav className="pm7-account-menu"><Link href="/postula-preview">Inicio</Link><Link href="/empleos-preview">Explorar empleos</Link><Link href="/changas-preview">Changas para hoy <small>NUEVO</small></Link><Link href="/plantillas-preview">Plantillas de CV</Link><Link href="/busqueda-activa">Búsqueda Activa</Link></nav></aside>

  <section className="pm7-account-feed"><header className="pm7-account-hello"><div><span className="pm7-eyebrow coral">TU ESPACIO</span><h1>Tu búsqueda,<br/><em>en movimiento.</em></h1><p>No hace falta que todo esté perfecto para avanzar. Elegí una cosa útil para hacer hoy.</p></div><Link href="/empleos-preview" className="pm7-btn-black">Buscar trabajo</Link></header>
  <div className="pm7-account-stats"><div><b>{jobCount||'60+'}</b><span>oportunidades</span></div><div><b>{apps.length}</b><span>en tu actividad</span></div><div><b>3</b><span>plantillas gratis</span></div><div><b>1</b><span>paso sugerido hoy</span></div></div>

  <article className="pm7-account-next"><div className="pm7-account-next-art"><span>HOY</span><div className="pm7-account-orbit"><i/><i/><i/></div></div><div><small>PRÓXIMO PASO</small><h2>Elegí un objetivo antes de mandar otro CV.</h2><p>Marcá puesto, zona y horario. Con eso podemos ordenar mejor el feed y las herramientas de CV.</p><div><Link href="/empleos-preview">Explorar por rubro</Link><Link href="/cv-ia">Revisar mi CV</Link></div></div></article>

  <div className="pm7-account-section-head"><div><span>ACTIVIDAD</span><h2>Lo último que hiciste</h2></div><Link href="/empleos-preview">Ver oportunidades →</Link></div>
  <div className="pm7-account-activity">{apps.map((a,i)=><article key={`${a.title}-${i}`}><span className={`pm7-activity-logo a${i%3}`}>{a.company.slice(0,2).toUpperCase()}</span><div><b>{a.title}</b><small>{a.company} · {a.date}</small></div><em>{a.status}</em><button aria-label="Más opciones">•••</button></article>)}</div>

  <div className="pm7-account-section-head"><div><span>DESCUBRÍ</span><h2>También podés ir por acá</h2></div></div><div className="pm7-account-discovery"><Link href="/changas-preview" className="yellow"><span>CHANGAS</span><h3>¿Tenés unas horas libres?</h3><p>Encontrá tareas puntuales cerca tuyo y hablá antes de aceptar.</p><b>Ver tareas →</b></Link><Link href="/plantillas-preview" className="violet"><span>MI CV</span><h3>Que se vea como vos querés.</h3><p>Tres diseños gratis y la biblioteca Pro visible antes de pagar.</p><b>Ver plantillas →</b></Link></div>
  </section>

  <aside className="pm7-account-right"><article className="pm7-account-tool"><span className="pm7-tool-icon cv">CV</span><div><small>HERRAMIENTA</small><h3>CV Pro+</h3></div><p>Adaptá tu presentación a un objetivo sin inventar experiencia.</p><Link href="/cv-ia">Abrir CV →</Link></article><article className="pm7-account-tool dark"><span className="pm7-tool-icon radar">◎</span><div><small>30 DÍAS</small><h3>Búsqueda Activa</h3></div><p>Radar, seguimiento, versiones por empresa y preparación de entrevistas.</p><Link href="/busqueda-activa">Ver plan →</Link></article><article className="pm7-account-tip"><span>TIP DE HOY</span><p>Una postulación elegida con criterio vale más que veinte enviadas sin mirar.</p></article></aside>
 </div>
}
