import styles from '../../postula-preview/platform.module.css'
import {PlatformHeader,PlatformFooter} from '../../postula-preview/PlatformChrome'
import NotificationSettings from '../../postula-preview/NotificationSettings'
import EmployerDashboardLive from './EmployerDashboardLive'
import '../../postula-preview/premium-v5.css'
import '../../postula-preview/premium-v6.css'
import '../../postula-preview/premium-v7.css'
import '../../postula-preview/premium-v7-employer-dashboard.css'
import '../../postula-preview/inner-v5.css'
import '../../postula-preview/notifications-v16.css'
import './dashboard-live.css'
export const metadata={title:{absolute:'Panel de empresa | Postulá Mejor'},robots:{index:false,follow:false},alternates:{canonical:'https://postulamejor.com/empresas/panel'}}
export default function EmployerPanel(){return <main className={`${styles.page} pm7-page pm7-employer`}><PlatformHeader audience="employer"/><EmployerDashboardLive/><NotificationSettings audience="employer"/><PlatformFooter/></main>}
