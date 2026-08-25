import {PlatformHeader,PlatformFooter} from '../../postula-preview/PlatformChrome'
import NotificationSettings from '../../postula-preview/NotificationSettings'
import SupportHelp from '../../postula-preview/SupportHelp'
import CompanySettings from './CompanySettings'
import CompanyBranding from './CompanyBranding'
import '../../postula-preview/premium-v7.css'
import '../../postula-preview/notifications-v16.css'
import '../../postula-preview/support-help-v21.css'
import './settings.css'
import './branding-v31.css'
import './notifications-accordion.css'
export const metadata={title:{absolute:'Cuenta empresa | Postulá Mejor'},robots:{index:false,follow:false},alternates:{canonical:'https://postulamejor.com/empresas/configuracion'}}
export default function SettingsPage(){return <main className="pm7-page pm7-employer"><PlatformHeader audience="employer"/><CompanySettings/><CompanyBranding/><section className="pmset-preferences" aria-label="Configuración de la cuenta"><details className="pmset-notifications-accordion"><summary><span className="pmset-notifications-icon" aria-hidden="true">◎</span><span className="pmset-notifications-copy"><small>CONFIGURACIÓN</small><b>Notificaciones</b><em>Elegí qué avisos querés recibir y administrá los permisos de este dispositivo.</em></span><span className="pmset-notifications-open">Administrar <i aria-hidden="true"/></span></summary><div className="pmset-notifications-body"><NotificationSettings audience="employer"/></div></details></section><PlatformFooter/><SupportHelp audience="employer"/></main>}
