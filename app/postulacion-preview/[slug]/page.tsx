import {notFound} from 'next/navigation'
import styles from '../../postula-preview/platform.module.css'
import {PlatformHeader,MobileNav} from '../../postula-preview/PlatformChrome'
import {getJobCatalog} from '../../postula-preview/jobs'
import ApplicationWizard from './ApplicationWizard'

export const revalidate=21600
export const dynamicParams=true

export default async function ApplyPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params
  const jobs=await getJobCatalog()
  const job=jobs.find(j=>j.slug===slug)
  if(!job)notFound()
  return <main className={styles.page}><PlatformHeader/><div className={styles.wizard}><div className={styles.wizardGrid}><aside className={styles.steps}><div className={`${styles.step} ${styles.stepActive}`}>1 · Datos y CV</div><div className={styles.step}>2 · Presentación</div><div className={styles.step}>3 · Consentimiento</div><div className={styles.step}>4 · Canal oficial</div></aside><ApplicationWizard job={job}/></div></div><MobileNav active="empleos"/></main>
}
