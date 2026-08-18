import type { Metadata } from 'next'
import { Suspense } from 'react'
import AccountClient from './AccountClient'
import styles from './account.module.css'

const icon='/postula-mejor-favicon.svg'
export const metadata:Metadata={
  metadataBase:new URL('https://postulamejor.com'),
  title:{absolute:'Mi cuenta | Postulá Mejor'},
  description:'Accedé a tu CV Pro, Búsqueda Activa y seguimiento de postulaciones.',
  applicationName:'Postulá Mejor',
  robots:{index:false,follow:false},
  icons:{icon:[{url:icon,type:'image/svg+xml',sizes:'any'}],shortcut:icon,apple:icon},
  openGraph:{siteName:'Postulá Mejor',title:'Mi cuenta | Postulá Mejor',description:'Accedé a tu CV Pro, Búsqueda Activa y seguimiento de postulaciones.'},
  twitter:{card:'summary',title:'Mi cuenta | Postulá Mejor',description:'Accedé a tu CV Pro, Búsqueda Activa y seguimiento de postulaciones.'},
}

export default function CuentaPage(){return <main className={styles.page}><header className={styles.top}><a className={styles.back} href="/">← Volver</a><a className={styles.brand} href="/"><span>postula</span><strong>mejor</strong><span>.com</span></a></header><section className={styles.main}><div className={styles.intro}><span>TU ESPACIO PRIVADO</span><h1>Volvé a tu búsqueda cuando quieras.</h1><p>En Búsqueda Activa tu cuenta guarda el tablero, las versiones de cada postulación y el progreso que vayas registrando.</p></div><Suspense fallback={<div className={styles.card}>Cargando acceso…</div>}><AccountClient/></Suspense></section></main>}
