import styles from '../postula-preview/platform.module.css'
import {PlatformHeader,PlatformFooter,MobileNav} from '../postula-preview/PlatformChrome'
import {getJobCatalog} from '../postula-preview/jobs'
import CandidateDashboard from './CandidateDashboard'
import '../postula-preview/premium-v5.css'
import '../postula-preview/premium-v6.css'
import '../postula-preview/inner-v5.css'
export const metadata={title:'Mi búsqueda | Postulá Mejor Preview',robots:{index:false,follow:false}}
export const revalidate=21600
export default async function CandidatePage(){const jobs=await getJobCatalog();return <main className={`${styles.page} ${styles.dashboard} pm-candidate-dashboard-v5`}><PlatformHeader/><CandidateDashboard jobCount={jobs.length}/><PlatformFooter/><MobileNav active="cuenta"/></main>}
