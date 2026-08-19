import styles from '../postula-preview/platform.module.css'
import {PlatformHeader,MobileNav} from '../postula-preview/PlatformChrome'
import CandidateDashboard from './CandidateDashboard'
export const metadata={title:'Mi búsqueda | Postulá Mejor Preview',robots:{index:false,follow:false}}
export default function CandidatePage(){return <main className={`${styles.page} ${styles.dashboard}`}><PlatformHeader/><CandidateDashboard/><MobileNav active="cuenta"/></main>}
