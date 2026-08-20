import {PlatformHeader,PlatformFooter} from '../../postula-preview/PlatformChrome'
import CompanySettings from './CompanySettings'
import '../../postula-preview/premium-v7.css'
import './settings.css'
export const metadata={title:{absolute:'Configuración de empresa | Postulá Mejor'},robots:{index:false,follow:false},alternates:{canonical:'https://postulamejor.com/empresas/configuracion'}}
export default function SettingsPage(){return <main className="pm7-page pm7-employer"><PlatformHeader audience="employer"/><CompanySettings/><PlatformFooter/></main>}
