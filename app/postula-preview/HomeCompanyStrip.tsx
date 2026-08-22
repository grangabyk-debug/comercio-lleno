'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useEffect,useRef,useState} from 'react'
import {createPortal} from 'react-dom'
import styles from './home-companies.module.css'

type Company={name:string;domain:string;logoDomain?:string;initials:string}
const companies:Company[]=[
 {name:'Cencosud',domain:'cencosud.com',initials:'CE'},
 {name:'PedidosYa',domain:'pedidosya.com',logoDomain:'pedidosya.com.ar',initials:'PY'},
 {name:'Despegar',domain:'despegar.com',logoDomain:'despegar.com.ar',initials:'D'},
 {name:'Coca-Cola FEMSA',domain:'coca-colafemsa.com',initials:'CF'},
 {name:'Marriott',domain:'marriott.com',initials:'M'},
 {name:'Minor Hotels',domain:'minorhotels.com',initials:'MH'},
 {name:'Wyndham',domain:'wyndhamhotels.com',initials:'WH'},
 {name:'Givaudan',domain:'givaudan.com',initials:'G'},
 {name:'dLocal',domain:'dlocal.com',initials:'dL'},
 {name:'EY',domain:'ey.com',initials:'EY'},
]

function CompanyLogo({domain,logoDomain,initials}:{domain:string;logoDomain?:string;initials:string}){
 const resolved=logoDomain||domain
 const sources=[
  `https://unavatar.io/${resolved}?fallback=false`,
  `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(`https://${resolved}`)}&sz=256`,
  `https://icons.duckduckgo.com/ip3/${resolved}.ico`,
 ]
 const [sourceIndex,setSourceIndex]=useState(0)
 const src=sources[sourceIndex]
 return <span className={styles.mark} aria-hidden="true">
  <span className={styles.fallback}>{initials}</span>
  {src?<img src={src} alt="" referrerPolicy="no-referrer" onError={()=>setSourceIndex(i=>i<sources.length-1?i+1:sources.length)}/>:null}
 </span>
}

export default function HomeCompanyStrip(){
 const pathname=usePathname()
 const rail=useRef<HTMLDivElement>(null)
 const [host,setHost]=useState<HTMLElement|null>(null)

 useEffect(()=>{
  if(pathname!=='/')return
  const target=document.querySelector<HTMLElement>('.pm7-stories')
  if(!target)return
  const original=target.querySelector<HTMLElement>('.pm7-stories-inner')
  const previousDisplay=original?.style.display||''
  if(original)original.style.display='none'
  setHost(target)
  return ()=>{if(original)original.style.display=previousDisplay}
 },[pathname])

 if(pathname!=='/'||!host)return null
 const move=(direction:number)=>{const el=rail.current;if(!el)return;el.scrollBy({left:direction*Math.max(280,el.clientWidth*.76),behavior:'smooth'})}
 const strip=<div className={styles.wrap} aria-label="Empresas con oportunidades públicas">
  <div className={styles.inner}>
   <div className={styles.copy}>
    <span>OPORTUNIDADES PÚBLICAS</span>
    <b>Empresas que hoy tienen búsquedas abiertas.</b>
    <p className={styles.action}>Tocá una empresa para ver solamente sus oportunidades.</p>
    <small className={styles.disclaimer}>Las marcas aparecen por sus avisos públicos; no implica patrocinio ni relación comercial.</small>
   </div>
   <div className={styles.railShell}>
    <button className={`${styles.arrow} ${styles.prev}`} type="button" onClick={()=>move(-1)} aria-label="Ver empresas anteriores">‹</button>
    <div ref={rail} className={styles.logos} role="list" aria-label="Empresas con oportunidades públicas disponibles">
     {companies.map(c=><Link className={styles.logo} key={c.name} title={`Ver oportunidades de ${c.name}`} role="listitem" href={`/empleos?empresa=${encodeURIComponent(c.name)}`}><CompanyLogo {...c}/><b>{c.name}</b><small>Ver empleos</small></Link>)}
    </div>
    <button className={`${styles.arrow} ${styles.next}`} type="button" onClick={()=>move(1)} aria-label="Ver más empresas">›</button>
   </div>
  </div>
 </div>
 return createPortal(strip,host)
}
