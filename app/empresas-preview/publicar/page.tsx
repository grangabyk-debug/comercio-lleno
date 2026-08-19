import styles from '../../postula-preview/platform.module.css'
import {PlatformHeader,PlatformFooter} from '../../postula-preview/PlatformChrome'
import EmployerPublishWizard from './EmployerPublishWizard'
import '../../postula-preview/premium-v6.css'
export const metadata={title:'Publicar búsqueda | Postulá Mejor Empresas Preview',robots:{index:false,follow:false}}
export default function PublishPage(){return <main className={styles.page}><PlatformHeader audience="employer"/><div className={styles.wizard}><EmployerPublishWizard/></div><PlatformFooter/></main>}
