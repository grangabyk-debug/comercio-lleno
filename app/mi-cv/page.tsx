import type { Metadata } from 'next'
import WorkspaceClient from './WorkspaceClient'
import AtsWorkspaceBridge from './AtsWorkspaceBridge'
import TemplateWorkspaceBridge from './TemplateWorkspaceBridge'
import styles from './workspace.module.css'
import './workspace-screen-fix.css'
import './ats-workspace.css'
import './template-preserve.css'

const icon='/postula-mejor-favicon.svg'
export const metadata:Metadata={
  metadataBase:new URL('https://postulamejor.com'),
  title:{absolute:'Tu espacio CV Pro+ | Postulá Mejor'},
  description:'Tu espacio CV Pro+: CV final, versión ATS, LinkedIn, postulación y preparación de entrevista.',
  applicationName:'Postulá Mejor',
  robots:{index:false,follow:false},
  icons:{icon:[{url:icon,type:'image/svg+xml',sizes:'any'}],shortcut:icon,apple:icon},
  openGraph:{siteName:'Postulá Mejor',title:'Tu espacio CV Pro+ | Postulá Mejor',description:'Tu CV Pro+, versión ATS, LinkedIn, postulación y preparación de entrevista.'},
  twitter:{card:'summary',title:'Tu espacio CV Pro+ | Postulá Mejor',description:'Tu CV Pro+, versión ATS, LinkedIn, postulación y preparación de entrevista.'},
}

export default function MiCvPage(){return <main className={styles.page}><header className={styles.top}><a className={styles.back} href="/">← Inicio</a><a className={styles.brand} href="/"><span>postula</span><strong>mejor</strong><span>.com</span></a><a className={styles.account} href="/cuenta">Guardar / acceder</a></header><section className={styles.main}><WorkspaceClient/><TemplateWorkspaceBridge/><AtsWorkspaceBridge/></section></main>}
