import {PlatformHeader,PlatformFooter} from '../../postula-preview/PlatformChrome'
import SupportHelp from '../../postula-preview/SupportHelp'
import CompanySettings from './CompanySettings'
import '../../postula-preview/premium-v7.css'
import '../../postula-preview/support-help-v21.css'
import './settings.css'
export const metadata={title:{absolute:'Configuración de empresa | Postulá Mejor'},robots:{index:false,follow:false},alternates:{canonical:'https://postulamejor.com/empresas/configuracion'}}
export default function SettingsPage(){return <main className="pm7-page pm7-employer"><PlatformHeader audience="employer"/><CompanySettings/><PlatformFooter/><SupportHelp audience="employer"/></main>}
