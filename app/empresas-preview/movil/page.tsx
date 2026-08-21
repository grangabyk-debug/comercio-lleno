import NexoAccessGate from './NexoAccessGate'
import SupportHelp from '../../postula-preview/SupportHelp'
import '../../postula-preview/premium-v3.css'
import '../../postula-preview/premium-v6.css'
import '../../postula-preview/support-help-v21.css'
import './mobile-hub.css'
import './nexo-gate.css'
export const metadata={title:{absolute:'Nexo móvil | Postulá Mejor Empresas'},description:'Panel móvil y asistente Nexo para selección y equipo.',robots:{index:false,follow:false},alternates:{canonical:'https://postulamejor.com/empresas/movil'}}
export default function EmployerMobilePage(){return <><NexoAccessGate/><SupportHelp audience="employer"/></>}
