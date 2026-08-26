'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useEffect,useRef,useState} from 'react'
import {createPortal} from 'react-dom'
import styles from './home-companies.module.css'

type Company={name:string;domain:string;initials:string}
const companies:Company[]=[
 {name:'Coca-Cola FEMSA',domain:'coca-colafemsa.com',initials:'CF'},
 {name:'Cencosud',domain:'cencosud.com',initials:'CE'},
 {name:'Fleni',domain:'fleni.org.ar',initials:'FL'},
 {name:'PedidosYa',domain:'pedidosya.com.ar',initials:'PY'},
 {name:'Despegar',domain:'despegar.com',initials:'DE'},
 {name:'EY',domain:'ey.com',initials:'EY'},
 {name:'Emi Labs',domain:'emilabs.ai',initials:'EL'},
 {name:'Minor Hotels Europe & Americas',domain:'minorhotels.com',initials:'MH'},
 {name:'Marriott International',domain:'marriott.com',initials:'MI'},
 {name:'Wyndham Hotels & Resorts',domain:'wyndhamhotels.com',initials:'WH'},
 {name:'Givaudan',domain:'givaudan.com',initials:'GI'},
 {name:'Rex',domain:'pintureriasrex.com',initials:'RX'},
 {name:'Taranto',domain:'taranto.com.ar',initials:'TA'},
]

function CompanyLogo({domain,initials}:{domain:string;initials:string}){
 const sources=[
  `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(`https://${domain}`)}&sz=256`,
  `https://icons.duckduckgo.com/ip3/${domain}.ico`,
  `https://${domain}/favicon.ico`,
 ]
 const [sourceIndex,setSourceIndex]=useState(0)
 const src=sources[sourceIndex]
 return <span className={styles.mark} aria-hidden="true">
  <span className={styles.fallback}>{initials}</span>
  {src?<img src={src} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={()=>setSourceIndex(i=>i<sources.length-1?i+1:sources.length)}/>:null}
 </span>
}

export default function HomeCompanyStrip(){
 const pathname=usePathname()
 const rail=useRef<HTMLDivElement>(null)
 const [host,setHost]=useState<HTMLElement|null>(null)
 const ownsMount=useRef(false)

 useEffect(()=>{
  if(pathname!=='/')return
  const target=document.querySelector<HTMLElement>('.pm7-stories')
  if(!target||target.dataset.pmCompanyStripMounted==='1')return
  target.dataset.pmCompanyStripMounted='1'
  ownsMount.current=true
  const original=target.querySelector<HTMLElement>('.pm7-stories-inner')
  const previousDisplay=original?.style.display||''
  if(original)original.style.display='none'
  setHost(target)
  return ()=>{
   if(!ownsMount.current)return
   ownsMount.current=false
   delete target.dataset.pmCompanyStripMounted
   if(original)original.style.display=previousDisplay
  }
 },[pathname])

 if(pathname!=='/'||!host)return null
 const move=(direction:number)=>{const el=rail.current;if(!el)return;el.scrollBy({left:direction*Math.max(280,el.clientWidth*.76),behavior:'smooth'})}
 const strip=<div className={styles.wrap} aria-label="Empresas con oportunidades públicas">
  <div className={styles.inner}>
   <div className={styles.copy}>
    <span>OPORTUNIDADES PÚBLICAS</span>
    <b>Empresas con avisos concretos disponibles.</b>
    <p className={styles.action}>Tocá una empresa para ver sus vacantes individuales.</p>
    <small className={styles.disclaimer}>Mostramos empresas porque encontramos avisos públicos concretos; no implica patrocinio ni relación comercial.</small>
   </div>
   <div className={styles.railShell}>
    <button className={`${styles.arrow} ${styles.prev}`} type="button" onClick={()=>move(-1)} aria-label="Ver empresas anteriores">‹</button>
    <div ref={rail} className={styles.logos} role="list" aria-label="Empresas con oportunidades públicas disponibles">
     {companies.map(c=><Link className={styles.logo} key={c.name} title={`Ver oportunidades de ${c.name}`} role="listitem" href={`/empleos?empresa=${encodeURIComponent(c.name)}`}><CompanyLogo domain={c.domain} initials={c.initials}/><b>{c.name}</b><small>Ver vacantes</small></Link>)}
    </div>
    <button className={`${styles.arrow} ${styles.next}`} type="button" onClick={()=>move(1)} aria-label="Ver más empresas">›</button>
   </div>
  </div>
 </div>
 return createPortal(strip,host)
}
