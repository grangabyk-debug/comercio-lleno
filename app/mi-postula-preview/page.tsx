import styles from '../postula-preview/platform.module.css'
import {PlatformHeader,MobileNav} from '../postula-preview/PlatformChrome'
import {getJobCatalog} from '../postula-preview/jobs'
import CandidateDashboard from './CandidateDashboard'
export const metadata={title:'Mi búsqueda | Postulá Mejor Preview',robots:{index:false,follow:false}}
export const revalidate=21600
export default async function CandidatePage(){const jobs=await getJobCatalog();return <main className={`${styles.page} ${styles.dashboard}`}><PlatformHeader/><CandidateDashboard jobCount={jobs.length}/><MobileNav active="cuenta"/></main>}
