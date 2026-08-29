import EmployerMobileHub from './EmployerMobileHub'
import SupportHelp from '../../postula-preview/SupportHelp'
import '../../postula-preview/premium-v3.css'
import '../../postula-preview/premium-v6.css'
import '../../postula-preview/support-help-v21.css'
import '../../postula-preview/support-help-mobile-v46.css'
import './mobile-hub.css'
import './mobile-hub-v46.css'

export const metadata={title:{absolute:'Panel móvil | Postulá Mejor Empresas'},description:'Panel móvil de Postulá Mejor para revisar búsquedas, postulaciones y equipo.',robots:{index:false,follow:false},alternates:{canonical:'https://postulamejor.com/empresas/movil'}}
export default function EmployerMobilePage(){return <><EmployerMobileHub/><SupportHelp audience="employer"/></>}
