import {notFound,redirect} from 'next/navigation'
import styles from '../../postula-preview/platform.module.css'
import {PlatformHeader,PlatformFooter,MobileNav} from '../../postula-preview/PlatformChrome'
import {getJobCatalog} from '../../postula-preview/jobs'
import ApplicationWizard from './ApplicationWizard'
import ApplicationStepSync from './ApplicationStepSync'
import '../../postula-preview/premium-v5.css'
import '../../postula-preview/premium-v6.css'
import '../../postula-preview/premium-v7.css'
import '../../postula-preview/inner-v5.css'

export const revalidate=21600
export const dynamicParams=true

export default async function ApplyPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params
  const jobs=await getJobCatalog()
  const job=jobs.find(j=>j.slug===slug)
  if(!job)notFound()
  if(job.external)redirect(`/empleos/${job.slug}`)
  return <main className={`${styles.page} pm-candidate-inner-v5 pm7-page`}><PlatformHeader/><div className={styles.wizard}><div className={styles.wizardGrid} data-pm-apply-flow><aside className={styles.steps} aria-label="Pasos de la postulación"><div className={`${styles.step} ${styles.stepActive}`} data-pm-apply-step="1" aria-current="step">1 · Datos y CV</div><div className={styles.step} data-pm-apply-step="2">2 · Presentación</div><div className={styles.step} data-pm-apply-step="3">3 · Consentimiento</div><div className={styles.step} data-pm-apply-step="4">4 · Enviar postulación</div></aside><ApplicationStepSync activeClass={styles.stepActive}/><ApplicationWizard job={job}/></div></div><PlatformFooter/><MobileNav active="empleos"/></main>
}
