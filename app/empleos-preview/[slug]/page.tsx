import Link from 'next/link'
import {notFound} from 'next/navigation'
import styles from '../../postula-preview/platform.module.css'
import {PlatformHeader,PlatformFooter,MobileNav} from '../../postula-preview/PlatformChrome'
import {getJobCatalog} from '../../postula-preview/jobs'
import '../../postula-preview/premium-v5.css'
import '../../postula-preview/premium-v6.css'
import '../../postula-preview/inner-v5.css'

export const revalidate=21600
export const dynamicParams=true

export default async function JobDetail({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params
  const jobs=await getJobCatalog()
  const job=jobs.find(j=>j.slug===slug)
  if(!job)notFound()
  return <main className={`${styles.page} pm-candidate-inner-v5`}><PlatformHeader/><section className={styles.detailHero}><div className={styles.detailHeroInner}><div className={styles.breadcrumbs}><Link href="/empleos-preview">Empleos</Link><span>/</span><span>{job.company}</span></div><span className={styles.eyebrow}>{job.company} · fuente oficial revisada</span><h1>{job.title}</h1><div className={styles.detailMeta}><span>{job.location}</span><span>{job.mode}</span><span>{job.schedule}</span><span>{job.area}</span></div></div></section><div className={styles.detailLayout}><div className={styles.contentCard}><h2>Sobre la oportunidad</h2><p>{job.summary}</p><h2 style={{marginTop:28}}>Lo que conviene revisar antes de postularte</h2><ul>{job.requirements.map(r=><li key={r}>{r}</li>)}</ul><h2 style={{marginTop:28}}>Cómo te ayuda Postulá Mejor</h2><p>Podés preparar un paquete con tu CV, una presentación breve y respuestas clave. Para una oferta externa, la aplicación final se completa en el canal oficial de {job.company}. Si la empresa publica nativamente en Postulá Mejor, el proceso puede resolverse sin salir.</p><div className={styles.aiNote}><b>Match transparente.</b> El match sólo se calcula si iniciás sesión y autorizás datos de tu perfil. La IA explica coincidencias y faltantes; no descarta automáticamente por edad, género, foto u otras características sensibles.</div></div><aside className={styles.sideCard}><span className={styles.miniLabel}>Canal de postulación</span><h2 style={{margin:'7px 0 4px'}}>Prepará todo antes de salir.</h2><p style={{fontSize:13,lineHeight:1.55,color:'#657788'}}>Guardá tu CV elegido, carta breve y respuestas. Después continuás en la fuente oficial.</p><Link href={`/postulacion-preview/${job.slug}`} className={styles.button}>Preparar mi postulación</Link><a href={job.sourceUrl} target="_blank" rel="noopener noreferrer" className={styles.buttonDark}>Ir directo a {job.company}</a><div className={styles.sourceNotice}><b>Fuente:</b> {job.source}<br/><b>Revisada:</b> {job.checkedAt}<br/>No existe afiliación implícita con la empresa. La oferta puede cambiar o cerrar en origen.</div></aside></div><PlatformFooter/><MobileNav active="empleos"/></main>
}
