import styles from '../../postula-preview/platform.module.css'
import {PlatformHeader} from '../../postula-preview/PlatformChrome'
import EmployerDashboard from './EmployerDashboard'
export const metadata={title:'Panel de empresa | Postulá Mejor Preview',robots:{index:false,follow:false}}
export default function EmployerPanel(){return <main className={`${styles.page} ${styles.dashboard}`}><PlatformHeader audience="employer"/><EmployerDashboard/></main>}
