import styles from '../postula-preview/platform.module.css'
import {PlatformFooter,PlatformHeader,MobileNav} from '../postula-preview/PlatformChrome'
import {getJobCatalog} from '../postula-preview/jobs'
import JobsExplorer from './JobsExplorer'
import './jobs-premium.css'
import '../postula-preview/premium-v5.css'

export const metadata={title:'Ofertas de empleo | Postulá Mejor Preview',description:'Explorador de oportunidades laborales de Postulá Mejor.',robots:{index:false,follow:false}}
export const revalidate=21600

export default async function JobsPage(){
  const jobs=await getJobCatalog()
  const ba=jobs.filter(j=>/buenos aires|caba|capital federal/i.test(j.location)).length
  const areas=new Set(jobs.map(j=>j.area)).size
  return <main className={`${styles.page} pm-jobs-page-v5`}>
    <PlatformHeader/>
    <section className="pm-jobs-hero"><div className="pm-jobs-hero-inner"><div><span className="pm-kicker">TRABAJO REAL · FUENTES TRAZABLES · IA CUANDO SUMA</span><h1>Encontrá algo que te cierre.<br/><em>Y presentate mejor.</em></h1><p>No queremos que mandes CV a ciegas. Buscá por área, zona o modalidad, guardá oportunidades y prepará cada postulación con contexto.</p></div><div className="pm-hero-stats"><div><strong>{jobs.length}+</strong><span>ofertas disponibles ahora</span></div><div><strong>{ba}</strong><span>en Buenos Aires</span></div><div><strong>{areas}</strong><span>áreas distintas</span></div><div><strong>6 h</strong><span>ciclo de actualización</span></div></div></div></section>
    <section className={`${styles.section} ${styles.jobsBand}`} style={{paddingTop:28}}><div className={styles.sectionInner}><div className="pm-catalog-note"><div><b>Catálogo inicial inteligente.</b> Priorizamos ofertas públicas de fuentes oficiales como páginas de carrera y ATS públicos. No fingimos representar al empleador ni copiamos formularios privados.</div><span>Postularse sigue siendo gratis</span></div><JobsExplorer jobs={jobs}/></div></section>
    <PlatformFooter/><MobileNav active="empleos"/>
  </main>
}
