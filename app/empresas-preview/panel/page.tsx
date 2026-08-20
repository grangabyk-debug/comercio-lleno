import styles from '../../postula-preview/platform.module.css'
import {PlatformHeader,PlatformFooter} from '../../postula-preview/PlatformChrome'
import EmployerDashboard from './EmployerDashboard'
import '../../postula-preview/premium-v5.css'
import '../../postula-preview/premium-v6.css'
import '../../postula-preview/premium-v7.css'
import '../../postula-preview/inner-v5.css'
export const metadata={title:'Panel de empresa | Postulá Mejor Preview',robots:{index:false,follow:false}}
export default function EmployerPanel(){return <main className={`${styles.page} ${styles.dashboard} pmv5-employer pm-employer-dashboard-v5 pm7-page pm7-employer`}><PlatformHeader audience="employer"/><EmployerDashboard/><PlatformFooter/></main>}
