'use client'

import {usePathname} from 'next/navigation'
import styles from './home-companies.module.css'

const companies=[
 {name:'Cencosud',domain:'cencosud.com',initials:'CE'},
 {name:'PedidosYa',domain:'pedidosya.com',initials:'PY'},
 {name:'Despegar',domain:'despegar.com',initials:'D'},
 {name:'Coca-Cola FEMSA',domain:'coca-colafemsa.com',initials:'CF'},
 {name:'Marriott',domain:'marriott.com',initials:'M'},
 {name:'Minor Hotels',domain:'minorhotels.com',initials:'MH'},
 {name:'Wyndham',domain:'wyndhamhotels.com',initials:'WH'},
 {name:'Givaudan',domain:'givaudan.com',initials:'G'},
 {name:'dLocal',domain:'dlocal.com',initials:'dL'},
 {name:'EY',domain:'ey.com',initials:'EY'},
]

function CompanyLogo({name,domain,initials}:{name:string;domain:string;initials:string}){
 const logo=`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`
 return <span className={styles.mark} aria-hidden="true"><span className={styles.fallback}>{initials}</span><img src={logo} alt="" loading="lazy" referrerPolicy="no-referrer" onError={e=>{e.currentTarget.style.display='none'}}/></span>
}

export default function HomeCompanyStrip(){
 const pathname=usePathname()
 if(pathname!=='/')return null
 return <section className={styles.wrap} aria-label="Empresas con oportunidades públicas">
  <div className={styles.inner}>
   <div className={styles.copy}>
    <span>OPORTUNIDADES PÚBLICAS</span>
    <b>Empresas que hoy tienen búsquedas abiertas.</b>
    <small>Mostramos marcas con avisos públicos visibles en nuestro catálogo. No implica patrocinio, alianza ni relación comercial.</small>
   </div>
   <div className={styles.logos} role="list" aria-label="Empresas con oportunidades públicas disponibles">
    {companies.map(c=><div className={styles.logo} key={c.name} title={c.name} role="listitem"><CompanyLogo {...c}/><b>{c.name}</b><small>Ver oportunidades</small></div>)}
   </div>
  </div>
 </section>
}
