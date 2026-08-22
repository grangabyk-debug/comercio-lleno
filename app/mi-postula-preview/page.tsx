import styles from '../postula-preview/platform.module.css'
import {PlatformHeader,PlatformFooter,MobileNav} from '../postula-preview/PlatformChrome'
import {getJobCatalog} from '../postula-preview/jobs'
import CandidateActivationGate from './CandidateActivationGate'
import '../postula-preview/premium-v5.css'
import '../postula-preview/premium-v6.css'
import '../postula-preview/premium-v7.css'
import '../postula-preview/premium-v7-account.css'
import '../postula-preview/inner-v5.css'
import './account-v8.css'
import './native-apps.css'
import './account-media-v33.css'
import './account-social-v34.css'
export const metadata={title:{absolute:'Mi perfil | Postulá Mejor'},robots:{index:false,follow:false},alternates:{canonical:'https://postulamejor.com/mi-cuenta'}}
export const revalidate=300
export default async function CandidatePage(){const jobs=await getJobCatalog();return <main className={`${styles.page} pm7-page`}><PlatformHeader/><CandidateActivationGate jobCount={jobs.length}/><PlatformFooter/><MobileNav active="cuenta"/></main>}
