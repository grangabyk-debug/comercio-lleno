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
export const metadata={title:{absolute:'Cuenta empresa | Postulá Mejor'},robots:{index:false,follow:false},alternates:{canonical:'https://postulamejor.com/empresas/configuracion'}}
export default function SettingsPage(){return <main className="pm7-page pm7-employer"><PlatformHeader audience="employer"/><CompanySettings/><CompanyBranding/><NotificationSettings audience="employer"/><PlatformFooter/><SupportHelp audience="employer"/></main>}
