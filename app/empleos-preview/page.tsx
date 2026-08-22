import Link from 'next/link'
import styles from '../postula-preview/platform.module.css'
import {PlatformFooter,PlatformHeader,MobileNav} from '../postula-preview/PlatformChrome'
import {getJobCatalog} from '../postula-preview/jobs'
import JobsExplorer from './JobsExplorer'
import './jobs-premium.css'
import './jobs-mobile-fix.css'
import './jobs-polish-v36.css'
import '../postula-preview/premium-v5.css'
import '../postula-preview/premium-v6.css'
import '../postula-preview/premium-v7.css'

export const metadata={title:{absolute:'Empleos | Postulá Mejor'},description:'Descubrí oportunidades laborales con una experiencia más cercana, visual y simple.',robots:{index:true,follow:true},alternates:{canonical:'https://postulamejor.com/empleos'}}
export const revalidate=21600

type JobsPageProps={searchParams?:Promise<{empresa?:string|string[]}>}

export default async function JobsPage({searchParams}:JobsPageProps){
 const params=searchParams?await searchParams:{}
 const rawCompany=Array.isArray(params.empresa)?params.empresa[0]:params.empresa
 const companyFilter=String(rawCompany||'').trim()
 const allJobs=await getJobCatalog()
 const companyNeedle=companyFilter.toLocaleLowerCase('es')
 const jobs=companyFilter?allJobs.filter(j=>{const company=j.company.toLocaleLowerCase('es');return company.includes(companyNeedle)||companyNeedle.includes(company)}):allJobs
 const ba=jobs.filter(j=>/buenos aires|caba|capital federal/i.test(j.location)).length
 const areas=new Set(jobs.map(j=>j.area)).size
 return <main className={`${styles.page} pm-jobs-page-v5 pm-jobs-page-v7 pm7-page`}>
  <PlatformHeader/>
  <section className="pm7-jobs-hero"><div className="pm7-jobs-hero-inner"><div><span className="pm7-eyebrow coral">TU FEED DE TRABAJO</span><h1>Buscá menos.<br/><em>Descubrí mejor.</em></h1><p>Filtrá por rubro, provincia y ciudad. Si completás tu perfil, también podés ordenar las oportunidades según tus habilidades, zona, modalidad y disponibilidad.</p><div className="pm7-hero-actions"><Link href="/trabajos-flex" className="pm7-btn-black">Ver trabajos flex para hoy</Link><Link href="/mi-cuenta" className="pm7-btn-white">Completar mi perfil</Link></div></div><div className="pm7-jobs-pulse"><div><b>{jobs.length}+</b><span>{companyFilter?`en ${companyFilter}`:'oportunidades visibles'}</span></div><div><b>{ba}</b><span>en Buenos Aires</span></div><div><b>{areas}</b><span>rubros distintos</span></div><div><b>6 h</b><span>ciclo de actualización</span></div></div></div></section>
  <section className={`${styles.section} ${styles.jobsBand}`} style={{paddingTop:22}}><div className={styles.sectionInner}><div className="pm-catalog-note"><div><b>{companyFilter?`Oportunidades de ${companyFilter}`:'Trabajo real y fuente visible.'}</b> {companyFilter?'Mostramos solamente los avisos públicos de esta empresa que están disponibles en el catálogo.':'Priorizamos canales públicos trazables y te mostramos siempre de dónde sale cada oportunidad.'}</div>{companyFilter?<Link href="/empleos">Ver todas las empresas</Link>:<span>Postularse sigue siendo gratis</span>}</div><div className="pm-jobs-v7"><JobsExplorer jobs={jobs}/></div></div></section>
  <PlatformFooter/><MobileNav active="empleos"/>
 </main>
}
