import type { Metadata } from 'next'
import WorkspaceClient from './WorkspaceClient'
import styles from './workspace.module.css'

export const metadata:Metadata={title:{absolute:'Mi CV Pro | Postulá Mejor'},description:'Tu CV Pro, LinkedIn, postulación y preparación de entrevista.',robots:{index:false,follow:false}}

export default function MiCvPage(){return <main className={styles.page}><header className={styles.top}><a className={styles.back} href="/">← Inicio</a><a className={styles.brand} href="/"><span>postula</span><strong>mejor</strong><span>.com</span></a><a className={styles.account} href="/cuenta">Mi cuenta</a></header><section className={styles.main}><WorkspaceClient/></section></main>}
