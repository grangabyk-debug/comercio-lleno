import Link from 'next/link'
import styles from './templates.module.css'
import platform from '../postula-preview/platform.module.css'
import {PlatformHeader,PlatformFooter,MobileNav} from '../postula-preview/PlatformChrome'
import TemplatesClient from './TemplatesClient'
import '../postula-preview/premium-v6.css'
import '../postula-preview/premium-v7.css'

export const metadata={
 title:{absolute:'Plantillas de CV | Postulá Mejor'},
 description:'Elegí plantillas de CV gratuitas y diseños Pro+ visibles antes de pagar. Editá, personalizá y prepará un CV claro para tu búsqueda laboral.',
 robots:{index:true,follow:true},
 alternates:{canonical:'https://postulamejor.com/plantillas'},
 openGraph:{title:'Plantillas de CV | Postulá Mejor',description:'Plantillas gratuitas y Pro+ visibles antes de pagar para preparar un CV claro y profesional.',url:'https://postulamejor.com/plantillas'},
 twitter:{card:'summary',title:'Plantillas de CV | Postulá Mejor',description:'Plantillas gratuitas y Pro+ visibles antes de pagar para preparar un CV claro y profesional.'},
}

export default function TemplatesPage(){return <main className={`${platform.page} ${styles.page} pm7-page`}><PlatformHeader/><div className={styles.wrap}><Link className={styles.back} href="/mi-cuenta">Volver a mi cuenta</Link><div className={styles.head}><div><span className={styles.label}>Biblioteca de CV</span><h1>Diseños que se ven bien antes de pedirte pagar.</h1></div><p>Tenés tres plantillas gratuitas completas, editables y descargables. Las Pro+ se muestran sin blur ni tapas para que puedas elegir con criterio, pero la edición y exportación premium sólo se habilitan con un plan válido.</p></div><TemplatesClient/></div><PlatformFooter/><MobileNav active="cv"/></main>}
