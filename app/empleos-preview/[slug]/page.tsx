import Link from 'next/link'
import {notFound} from 'next/navigation'
import styles from '../../postula-preview/platform.module.css'
import {PlatformHeader,PlatformFooter,MobileNav} from '../../postula-preview/PlatformChrome'
import {getJobCatalog} from '../../postula-preview/jobs'
import JobQuickActions from './JobQuickActions'
import '../../postula-preview/premium-v5.css'
import '../../postula-preview/premium-v6.css'
import '../../postula-preview/premium-v7.css'
import '../../postula-preview/inner-v5.css'
import '../job-actions-v29.css'

export const revalidate=300
export const dynamicParams=true

export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params
  const jobs=await getJobCatalog()
  const job=jobs.find(j=>j.slug===slug)
  if(!job)return{title:{absolute:'Empleo | Postulá Mejor'},robots:{index:false,follow:true}}
  return{
    title:{absolute:`${job.title} en ${job.company} | Postulá Mejor`},
    description:job.summary.slice(0,155),
    alternates:{canonical:`https://postulamejor.com/empleos/${job.slug}`},
    robots:{index:true,follow:true},
  }
}

export default async function JobDetail({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params
  const jobs=await getJobCatalog()
  const job=jobs.find(j=>j.slug===slug)
  if(!job)notFound()
  return <main className={`${styles.page} pm-candidate-inner-v5 pm7-page`}>
    <PlatformHeader/>
    <section className={styles.detailHero}><div className={styles.detailHeroInner}><div className={styles.breadcrumbs}><Link href="/empleos">Empleos</Link><span>/</span><span>{job.company}</span></div><span className={styles.eyebrow}>{job.external?`${job.company} · fuente oficial revisada`:`${job.company} · publicación en Postulá Mejor`}</span><h1>{job.title}</h1><div className={styles.detailMeta}><span>{job.location}</span><span>{job.mode}</span><span>{job.schedule}</span><span>{job.area}</span>{job.compensation&&<span>{job.compensation}</span>}</div></div></section>
    <div className={styles.detailLayout}><div className={styles.contentCard}><h2>Sobre la oportunidad</h2><p>{job.summary}</p><h2 style={{marginTop:28}}>Lo que conviene revisar antes de postularte</h2><ul>{job.requirements.length?job.requirements.map(r=><li key={r}>{r}</li>):<li>Revisá descripción, horario, zona y modalidad antes de enviar.</li>}</ul><h2 style={{marginTop:28}}>Cómo te ayuda Postulá Mejor</h2><p>{job.external?`Podés preparar tu CV, presentación y respuestas antes de continuar al canal oficial de ${job.company}.`:'Esta empresa recibe postulaciones dentro de Postulá Mejor. Tu seguimiento, mensajes y cambios de estado quedan en tu cuenta.'}</p><div className={styles.aiNote}><b>Match transparente.</b> La IA puede explicar coincidencias y faltantes; no debe descartar automáticamente por edad, género, foto u otras características sensibles.</div></div><aside className={styles.sideCard}><span className={styles.miniLabel}>{job.external?'Canal externo':'POSTULACIÓN EN LA PLATAFORMA'}</span><h2 style={{margin:'7px 0 4px'}}>{job.external?'Prepará todo antes de salir.':'Postulate sin salir de acá.'}</h2><p style={{fontSize:13,lineHeight:1.55,color:'#657788'}}>{job.external?'Guardá tu CV elegido y una presentación breve.':'Usá el CV de tu perfil o adjuntá otro. La empresa puede escribirte por el chat de Postulá Mejor.'}</p><JobQuickActions slug={job.slug} title={job.title} company={job.company} external={job.external}/><Link href={`/postular/${job.slug}`} className={styles.button}>{job.external?'Preparar mi postulación completa':'Revisar postulación completa'}</Link>{job.external&&<a href={job.sourceUrl} target="_blank" rel="noopener noreferrer" className={styles.buttonDark}>Ir directo a {job.company}</a>}<div className={styles.sourceNotice}><b>Fuente:</b> {job.source}<br/><b>Revisada:</b> {job.checkedAt}<br/>{job.external?'No existe afiliación implícita con la empresa. La oferta puede cambiar o cerrar en origen.':'La empresa publicó esta búsqueda en Postulá Mejor. Una validación básica reduce riesgo pero no reemplaza tu propia verificación.'}</div></aside></div>
    <PlatformFooter/><MobileNav active="empleos"/>
  </main>
}
