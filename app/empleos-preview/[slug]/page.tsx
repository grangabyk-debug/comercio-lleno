import Link from 'next/link'
import {notFound} from 'next/navigation'
import {unstable_cache} from 'next/cache'
import styles from '../../postula-preview/platform.module.css'
import {PlatformHeader,PlatformFooter,MobileNav} from '../../postula-preview/PlatformChrome'
import {getFullJobCatalog} from '../../postula-preview/jobs'
import {companyProfileHref} from '../../postula-preview/publicCompany'
import {getPublicCompanyReputation,getPublicJobCompanyId} from '../../postula-preview/publicReputation'
import PublicReputationBadge from '../../postula-preview/PublicReputationBadge'
import JobQuickActions from './JobQuickActions'
import '../../postula-preview/premium-v5.css'
import '../../postula-preview/premium-v6.css'
import '../../postula-preview/premium-v7.css'
import '../../postula-preview/inner-v5.css'
import '../job-actions-v29.css'
import '../job-company-v43.css'

export const revalidate=300
export const dynamicParams=true
const getCachedFullJobCatalog=unstable_cache(getFullJobCatalog,['postula-job-detail-catalog-v2'],{revalidate:21600,tags:['postula-empleos-catalog']})

export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params
  const jobs=await getCachedFullJobCatalog()
  const job=jobs.find(j=>j.slug===slug)
  if(!job)return{title:{absolute:'Empleo | Postulá Mejor'},robots:{index:false,follow:true}}
  return{title:{absolute:`${job.title} en ${job.company} | Postulá Mejor`},description:job.summary.slice(0,155),alternates:{canonical:`https://postulamejor.com/empleos/${job.slug}`},robots:{index:true,follow:true}}
}

export default async function JobDetail({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params
  const jobs=await getCachedFullJobCatalog()
  const job=jobs.find(j=>j.slug===slug)
  if(!job)notFound()
  const companyHref=await companyProfileHref(job)
  const companyId=!job.external&&job.internalJobId?await getPublicJobCompanyId(job.internalJobId):null
  const companyReputation=companyId?await getPublicCompanyReputation(companyId):null
  const related=job.confidential?[]:jobs.filter(j=>j.slug!==job.slug&&!j.confidential&&j.company.trim().toLowerCase()===job.company.trim().toLowerCase()).slice(0,4)
  return <main className={`${styles.page} pm-candidate-inner-v5 pm7-page`}>
    <PlatformHeader/>
    <section className={styles.detailHero}><div className={styles.detailHeroInner}><div className={styles.breadcrumbs}><Link href="/empleos">Empleos</Link><span>/</span>{companyHref?<Link href={companyHref}>{job.company}</Link>:<span>{job.company}</span>}</div><span className={styles.eyebrow}>{job.external?`${job.company} · fuente oficial revisada`:`${job.company} · publicación en Postulá Mejor`}</span><h1>{job.title}</h1><div className={styles.detailMeta}><span>{job.location}</span><span>{job.mode}</span><span>{job.schedule}</span><span>{job.area}</span>{job.compensation&&<span>{job.compensation}</span>}</div>{companyReputation&&<div style={{marginTop:13}}><PublicReputationBadge reputation={companyReputation}/></div>}</div></section>
    <div className={styles.detailLayout}><div className={styles.contentCard}><h2>Sobre la oportunidad</h2><p>{job.summary}</p><h2 style={{marginTop:28}}>Lo que conviene revisar antes de postularte</h2><ul>{job.requirements.length?job.requirements.map(r=><li key={r}>{r}</li>):<li>Revisá descripción, horario, zona y modalidad antes de enviar.</li>}</ul><h2 style={{marginTop:28}}>Cómo te ayuda Postulá Mejor</h2><p>{job.external?`Te mostramos la información disponible para que evalúes la oportunidad. Si te interesa, la postulación se realiza directamente en el canal oficial de ${job.company}.`:'Esta empresa recibe postulaciones dentro de Postulá Mejor. Tu seguimiento, mensajes y cambios de estado quedan en tu cuenta.'}</p>{companyReputation&&<div className={styles.aiNote}><b>Indicador laboral.</b> Se construye con experiencias cerradas dentro de Postulá Mejor. Hasta completar tres experiencias aparece como “Indicador en formación”; las evaluaciones que todavía están dentro del plazo de 10 días no cuentan.</div>}<div className={styles.aiNote}><b>Match transparente.</b> La IA puede explicar coincidencias y faltantes; no debe descartar automáticamente por edad, género, foto u otras características sensibles.</div></div><aside className={styles.sideCard}><span className={styles.miniLabel}>{job.external?'CANAL EXTERNO':'POSTULACIÓN EN LA PLATAFORMA'}</span><h2 style={{margin:'7px 0 4px'}}>{job.external?'Postulate en el canal oficial.':'Postulate sin salir de acá.'}</h2><p style={{fontSize:13,lineHeight:1.55,color:'#657788'}}>{job.external?`Esta búsqueda no fue publicada dentro de Postulá Mejor. Para enviar tu CV y completar la postulación, continuá directamente en ${job.company}.`:'Usá el CV de tu perfil o adjuntá otro. La empresa puede escribirte por el chat de Postulá Mejor.'}</p>{companyReputation&&<div style={{margin:'10px 0 4px'}}><PublicReputationBadge reputation={companyReputation} compact/></div>}<JobQuickActions slug={job.slug} title={job.title} company={job.company} external={job.external}/>{!job.external&&<Link href={`/postular/${job.slug}`} className={styles.button}>Postulación completa</Link>}{job.external&&<a href={job.sourceUrl} target="_blank" rel="noopener noreferrer" className={styles.buttonDark}>Ir directo a {job.company}</a>}{companyHref&&<Link href={companyHref} className="pm43-company-side-link">Ver perfil de {job.company} →</Link>}<div className={styles.sourceNotice}><b>Fuente:</b> {job.source}<br/><b>Revisada:</b> {job.checkedAt}<br/>{job.external?'No existe afiliación implícita con la empresa. La oferta puede cambiar o cerrar en origen.':'La empresa publicó esta búsqueda en Postulá Mejor. Una validación básica reduce riesgo pero no reemplaza tu propia verificación.'}</div></aside></div>
    {companyHref&&<section className="pm43-job-company"><div className="pm43-job-company-intro"><div className="pm43-job-company-brand">{job.logoUrl?<img src={job.logoUrl} alt=""/>:<span>{job.company.slice(0,2).toUpperCase()}</span>}<div><small>PERFIL DE EMPRESA</small><h2>{job.company}</h2>{companyReputation&&<PublicReputationBadge reputation={companyReputation} compact/>}<p>Antes de postularte también podés conocer la información pública de la empresa y revisar sus otras oportunidades.</p></div></div><Link href={companyHref}>Conocer la empresa <span>→</span></Link></div><div className="pm43-related-jobs"><div className="pm43-related-head"><div><small>OTRAS OPORTUNIDADES</small><h3>Más publicaciones de {job.company}</h3></div><span>{related.length} {related.length===1?'búsqueda':'búsquedas'}</span></div>{related.length?<div className="pm43-related-grid">{related.map(other=><Link href={`/empleos/${other.slug}`} key={other.slug}><small>{other.area}</small><b>{other.title}</b><span>{other.location} · {other.mode}</span><i>Ver empleo →</i></Link>)}</div>:<div className="pm43-related-empty">Por ahora no hay otras búsquedas activas de esta empresa.</div>}</div></section>}
    <PlatformFooter/><MobileNav active="empleos"/>
  </main>
}
