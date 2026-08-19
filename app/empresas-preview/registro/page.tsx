import styles from '../../postula-preview/platform.module.css'
import {PlatformHeader,PlatformFooter} from '../../postula-preview/PlatformChrome'
import EmployerRegistration from './EmployerRegistration'
import '../../postula-preview/premium-v6.css'
export const metadata={title:'Crear empresa | Postulá Mejor Preview',robots:{index:false,follow:false}}
export default function EmployerRegister(){return <main className={styles.page}><PlatformHeader audience="employer"/><EmployerRegistration/><PlatformFooter/></main>}
