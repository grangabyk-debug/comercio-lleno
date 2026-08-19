import styles from '../../postula-preview/platform.module.css'
import {PlatformHeader} from '../../postula-preview/PlatformChrome'
import EmployerRegistration from './EmployerRegistration'
export const metadata={title:'Crear empresa | Postulá Mejor Preview',robots:{index:false,follow:false}}
export default function EmployerRegister(){return <main className={styles.page}><PlatformHeader audience="employer"/><EmployerRegistration/></main>}
