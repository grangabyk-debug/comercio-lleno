import styles from '../../postula-preview/platform.module.css'
import {PlatformHeader,PlatformFooter} from '../../postula-preview/PlatformChrome'
import EmployerRegistration from './EmployerRegistration'
import '../../postula-preview/premium-v6.css'
import '../../postula-preview/premium-v7.css'
export const metadata={title:{absolute:'Crear empresa | Postulá Mejor'},robots:{index:false,follow:false},alternates:{canonical:'https://postulamejor.com/empresas/registro'}}
export default function EmployerRegister(){return <main className={`${styles.page} pm7-page pm7-employer`}><PlatformHeader audience="employer"/><EmployerRegistration/><PlatformFooter/></main>}
