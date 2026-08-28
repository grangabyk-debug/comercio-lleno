import styles from '../../postula-preview/platform.module.css'
import {MobileNav,PlatformFooter,PlatformHeader} from '../../postula-preview/PlatformChrome'
import CalendarHub from '../../postula-preview/CalendarHub'
import SupportHelp from '../../postula-preview/SupportHelp'

export const metadata={title:{absolute:'Calendario empresa | Postulá Mejor'},robots:{index:false,follow:false},alternates:{canonical:'https://postulamejor.com/empresas/calendario'}}
export default function EmployerCalendarPage(){return <main className={`${styles.page} pm7-page pm7-employer`}><PlatformHeader audience="employer"/><CalendarHub audience="employer"/><PlatformFooter/><MobileNav active="cuenta"/><SupportHelp audience="employer"/></main>}
