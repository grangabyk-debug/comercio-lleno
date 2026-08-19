import EmployerPocket from './EmployerPocket'
import '../../postula-preview/premium-v3.css'
import '../../postula-preview/premium-v6.css'

export const metadata={title:'Nexo móvil | Postulá Mejor Empresas',description:'Asistente móvil de selección para dueños y responsables.',robots:{index:false,follow:false}}

export default function EmployerMobilePage(){return <><EmployerPocket/><div className="pm-pocket-copyright">© 2026 Postulá Mejor · Gabriel Alejandro Granvillano · CUIT 20-38422407-6</div></>}
