import styles from '../postula-preview/platform.module.css'
import {MobileNav,PlatformFooter,PlatformHeader} from '../postula-preview/PlatformChrome'
import CalendarHub from '../postula-preview/CalendarHub'

export const metadata={title:{absolute:'Calendario | Postulá Mejor'},robots:{index:false,follow:false},alternates:{canonical:'https://postulamejor.com/calendario'}}
export default function CandidateCalendarPage(){return <main className={`${styles.page} pm7-page pm7-candidate`}><PlatformHeader/><CalendarHub audience="candidate"/><PlatformFooter/><MobileNav active="cuenta"/></main>}
