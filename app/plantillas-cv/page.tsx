import type {Metadata} from 'next'
import TemplatesGallery from './TemplatesGallery'
import styles from './templates.module.css'

export const metadata:Metadata={
 metadataBase:new URL('https://postulamejor.com'),
 title:{absolute:'Plantillas de CV editables | Postulá Mejor'},
 description:'Plantillas de CV editables: 3 gratuitas y 7 diseños incluidos en CV Pro+.',
 applicationName:'Postulá Mejor',
 robots:{index:false,follow:false},
 icons:{icon:[{url:'/postula-mejor-favicon.svg',type:'image/svg+xml',sizes:'any'}],shortcut:'/postula-mejor-favicon.svg',apple:'/postula-mejor-favicon.svg'},
}

export default function PlantillasCvPage(){return <main className={styles.page}><header className={styles.top}><a className={styles.back} href="/">← Inicio</a><a className={styles.brand} href="/"><span>postula</span><strong>mejor</strong><span>.com</span></a><a className={styles.cta} href="/#analisis">Analizar mi CV gratis</a></header><section className={styles.main}><TemplatesGallery/></section></main>}
