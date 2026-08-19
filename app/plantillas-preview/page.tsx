import styles from './templates.module.css'
import platform from '../postula-preview/platform.module.css'
import {PlatformHeader,PlatformFooter,MobileNav} from '../postula-preview/PlatformChrome'
import TemplatesClient from './TemplatesClient'
export const metadata={title:'Plantillas de CV | Postulá Mejor Preview',robots:{index:false,follow:false}}
export default function TemplatesPage(){return <main className={`${platform.page} ${styles.page}`}><PlatformHeader/><div className={styles.wrap}><div className={styles.head}><div><span className={styles.label}>Biblioteca original</span><h1>Tu CV puede ser sobrio o visual. La elección es tuya.</h1></div><p>No copiamos plantillas de terceros. La biblioteca combina opciones simples, compatibles con lectura automatizada, y diseños más expresivos. Las plantillas avanzadas están previstas dentro de CV Pro+ y Búsqueda Activa.</p></div><TemplatesClient/></div><PlatformFooter/><MobileNav active="cv"/></main>}
