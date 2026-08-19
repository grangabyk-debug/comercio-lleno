import styles from '../postula-preview/platform.module.css'
import {PlatformFooter,PlatformHeader,MobileNav} from '../postula-preview/PlatformChrome'
import {previewJobs} from '../postula-preview/jobs'
import JobsExplorer from './JobsExplorer'

export const metadata={title:'Ofertas de empleo | Postulá Mejor Preview',description:'Explorador de oportunidades laborales de Postulá Mejor.',robots:{index:false,follow:false}}

export default function JobsPage(){return <main className={styles.page}><PlatformHeader/><section className={styles.detailHero}><div className={styles.detailHeroInner}><span className={styles.eyebrow}>Explorador de oportunidades</span><h1>Encontrá un trabajo que tenga sentido para vos.</h1><p className={styles.heroLead}>Buscá por rol, zona o modalidad. Las coincidencias son orientativas: te mostramos señales claras y vos decidís dónde postularte.</p></div></section><section className={`${styles.section} ${styles.jobsBand}`} style={{paddingTop:34}}><div className={styles.sectionInner}><div className={styles.notice}><b>Etapa inicial de catálogo.</b> Estas ofertas provienen de páginas públicas oficiales de cada empresa y fueron revisadas el 19/08/2026. Se muestran como enlaces externos, sin fingir que Postulá Mejor representa al empleador. Cuando una empresa publique nativamente, la postulación sí podrá completarse dentro de la plataforma.</div><JobsExplorer jobs={previewJobs}/></div></section><PlatformFooter/><MobileNav active="empleos"/></main>}
