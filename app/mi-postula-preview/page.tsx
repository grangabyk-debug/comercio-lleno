import styles from '../postula-preview/platform.module.css'
import {PlatformHeader,PlatformFooter,MobileNav} from '../postula-preview/PlatformChrome'
import {getJobCatalog} from '../postula-preview/jobs'
import CandidateDashboard from './CandidateDashboard'
import '../postula-preview/premium-v5.css'
import '../postula-preview/premium-v6.css'
import '../postula-preview/premium-v7.css'
import '../postula-preview/premium-v7-account.css'
import '../postula-preview/inner-v5.css'
export const metadata={title:'Mi perfil | Postulá Mejor Preview',robots:{index:false,follow:false}}
export const revalidate=21600
export default async function CandidatePage(){const jobs=await getJobCatalog();return <main className={`${styles.page} pm7-page`}><PlatformHeader/><CandidateDashboard jobCount={jobs.length}/><PlatformFooter/><MobileNav active="cuenta"/></main>}
