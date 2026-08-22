import {Suspense} from 'react'
import styles from '../postula-preview/platform.module.css'
import {PlatformHeader,PlatformFooter} from '../postula-preview/PlatformChrome'
import PersonalAccessForm from '../postula-preview/PersonalAccessForm'
import '../empresas-preview/employer-access-v23.css'

export const metadata={title:{absolute:'Crear cuenta | Postulá Mejor'},robots:{index:false,follow:false},alternates:{canonical:'https://postulamejor.com/registro'}}
export default function RegisterPage(){return <main className={`${styles.page} pm7-page`}><PlatformHeader/><div className={styles.authGrid}><section className={styles.authVisual}><span className={styles.eyebrow}>Tu cuenta personal</span><h1>Buscá trabajo, mejorá tu CV y usá Trabajo Flex con una sola cuenta.</h1><p>La misma cuenta te acompaña en postulaciones, mensajes, CV y oportunidades Flex. No necesitás registrarte de nuevo para cada función.</p><div className={styles.heroMicro}><span><i/>Cuenta gratuita</span><span><i/>Email verificado</span><span><i/>Una sola identidad</span></div></section><section className={styles.authCardWrap}><Suspense fallback={<div className={styles.empty}>Preparando registro…</div>}><PersonalAccessForm mode="signup"/></Suspense></section></div><PlatformFooter/></main>}
