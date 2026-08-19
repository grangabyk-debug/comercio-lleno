import type { Metadata } from 'next'
import ActiveClient from './ActiveClient'
import styles from './active.module.css'
import './active-color-theme.css'

const icon='/postula-mejor-favicon.svg'
export const metadata:Metadata={
  metadataBase:new URL('https://postulamejor.com'),
  title:{absolute:'Búsqueda Activa | Postulá Mejor'},
  description:'Adaptá tu CV a ofertas reales y seguí tus postulaciones.',
  applicationName:'Postulá Mejor',
  robots:{index:false,follow:false},
  icons:{icon:[{url:icon,type:'image/svg+xml',sizes:'any'}],shortcut:icon,apple:icon},
  openGraph:{siteName:'Postulá Mejor',title:'Búsqueda Activa | Postulá Mejor',description:'Adaptá tu CV a ofertas reales y seguí tus postulaciones.'},
  twitter:{card:'summary',title:'Búsqueda Activa | Postulá Mejor',description:'Adaptá tu CV a ofertas reales y seguí tus postulaciones.'},
}

export default function BusquedaActivaPage(){return <main className={`${styles.page} active-color-theme`}><header className={styles.top}><a className={styles.back} href="/mi-cv">← Mi CV</a><a className={styles.brand} href="/"><span>postula</span><strong>mejor</strong><span>.com</span></a><a className={styles.account} href="/cuenta">Mi cuenta</a></header><section className={styles.main}><ActiveClient/></section></main>}
