import styles from '../../postula-preview/platform.module.css'
import {PlatformHeader,PlatformFooter} from '../../postula-preview/PlatformChrome'
import EmployerAccessForm from '../EmployerAccessForm'
import '../employer-access-v23.css'
import '../../postula-preview/premium-v6.css'
import '../../postula-preview/premium-v7.css'

export const metadata={title:{absolute:'Ingresar a empresa | Postulá Mejor'},robots:{index:false,follow:false},alternates:{canonical:'https://postulamejor.com/empresas/login'}}
export default function EmployerLogin(){return <main className={`${styles.page} pm7-page pm7-employer`}><PlatformHeader audience="employer"/><div className={styles.authGrid}><section className={styles.authVisual}><span className={styles.eyebrow}>Acceso empresa</span><h1>Entrá directo a tu espacio de contratación.</h1><p>Propietarios, RRHH y miembros invitados usan su propio email. Los permisos dependen del rol asignado dentro de la empresa.</p><div className={styles.heroMicro}><span><i/>Acceso protegido</span><span><i/>Roles separados</span><span><i/>Una sola cuenta empresa</span></div></section><section className={styles.authCardWrap}><EmployerAccessForm mode="login"/></section></div><PlatformFooter/></main>}
