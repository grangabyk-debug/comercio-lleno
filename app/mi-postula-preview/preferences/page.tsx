import styles from '../../postula-preview/platform.module.css'
import {PlatformHeader,PlatformFooter,MobileNav} from '../../postula-preview/PlatformChrome'
import NotificationSettings from '../../postula-preview/NotificationSettings'
import CandidatePrivacyPanel from '../CandidatePrivacyPanel'
import '../privacy-v31.css'
import '../../postula-preview/notifications-v16.css'
import './preferences.css'

export const metadata={title:{absolute:'Preferencias | Postulá Mejor'},robots:{index:false,follow:false}}

export default function CandidatePreferences(){return <main className={`${styles.page} pm7-page`}><PlatformHeader/><div className="pm35-prefs-shell"><div className="pm35-prefs-head"><div><span>MI CUENTA · PREFERENCIAS</span><h1>Privacidad y notificaciones.</h1><p>Acá queda todo lo que es configuración. Tu perfil principal vuelve a estar enfocado en vos, tu CV, tus postulaciones y tu búsqueda.</p></div><a href="/mi-cuenta">← Volver a mi perfil</a></div><CandidatePrivacyPanel/><NotificationSettings audience="candidate"/></div><PlatformFooter/><MobileNav active="cuenta"/></main>}
