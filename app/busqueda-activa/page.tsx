import type { Metadata } from 'next'
import ActiveClient from './ActiveClient'
import styles from './active.module.css'

export const metadata:Metadata={title:{absolute:'Búsqueda Activa | Postulá Mejor'},description:'Adaptá tu CV a ofertas reales y seguí tus postulaciones.',robots:{index:false,follow:false}}

export default function BusquedaActivaPage(){return <main className={styles.page}><header className={styles.top}><a className={styles.back} href="/mi-cv">← Mi CV</a><a className={styles.brand} href="/"><span>postula</span><strong>mejor</strong><span>.com</span></a><a className={styles.account} href="/cuenta">Mi cuenta</a></header><section className={styles.main}><ActiveClient/></section></main>}
