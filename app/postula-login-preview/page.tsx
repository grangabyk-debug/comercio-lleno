import {Suspense} from 'react'
import styles from '../postula-preview/platform.module.css'
import {PlatformHeader,PlatformFooter} from '../postula-preview/PlatformChrome'
import PersonalAccessForm from '../postula-preview/PersonalAccessForm'
import '../empresas-preview/employer-access-v23.css'

export const metadata={title:{absolute:'Ingresar | Postulá Mejor'},robots:{index:false,follow:false},alternates:{canonical:'https://postulamejor.com/login'}}
export default function LoginPage(){return <main className={`${styles.page} pm7-page`}><PlatformHeader/><div className={styles.authGrid}><section className={styles.authVisual}><span className={styles.eyebrow}>Volver a Postulá Mejor</span><h1>Entrá a tu cuenta y seguí donde dejaste.</h1><p>Postulaciones, mensajes, CV, recomendaciones y Trabajo Flex quedan asociados a tu misma cuenta personal.</p><div className={styles.heroMicro}><span><i/>Acceso protegido</span><span><i/>Mensajes guardados</span><span><i/>Sin cuentas duplicadas</span></div></section><section className={styles.authCardWrap}><Suspense fallback={<div className={styles.empty}>Preparando acceso…</div>}><PersonalAccessForm mode="login"/></Suspense></section></div><PlatformFooter/></main>}
