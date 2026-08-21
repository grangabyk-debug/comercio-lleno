import styles from '../../postula-preview/platform.module.css'
import {PlatformHeader,PlatformFooter} from '../../postula-preview/PlatformChrome'
import EmployerPublishWizard from './EmployerPublishWizard'
import '../../postula-preview/premium-v6.css'
import '../../postula-preview/premium-v7.css'
import './employer-confidential-v21.css'
export const metadata={title:{absolute:'Publicar búsqueda | Postulá Mejor Empresas'},robots:{index:false,follow:false},alternates:{canonical:'https://postulamejor.com/empresas/publicar'}}
export default function PublishPage(){return <main className={`${styles.page} pm7-page pm7-employer`}><PlatformHeader audience="employer"/><div className={styles.wizard}><EmployerPublishWizard/></div><PlatformFooter/></main>}
