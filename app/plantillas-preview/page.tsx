import type {Metadata} from 'next'
import TemplateGallery from '../plantillas/TemplateGallery'
import {PlatformFooter,PlatformHeader,MobileNav} from '../postula-preview/PlatformChrome'
import '../plantillas/template-gallery.css'
import '../plantillas/template-gallery-v3.css'

export const metadata:Metadata={
 metadataBase:new URL('https://postulamejor.com'),
 title:{absolute:'Plantillas de CV gratis y CV Pro+ | Postulá Mejor'},
 description:'30 plantillas de currículum originales y rediseñadas. Seis gratuitas y 24 incluidas con CV Pro+. Descargá Word editable y volvé a analizarlo sin perder el modelo.',
 alternates:{canonical:'https://postulamejor.com/plantillas'},
 robots:{index:true,follow:true},
 openGraph:{title:'30 plantillas de CV atractivas | Postulá Mejor',description:'Seis modelos gratis y 24 diseños CV Pro+ para descargar y editar en Word.',url:'https://postulamejor.com/plantillas',siteName:'Postulá Mejor',type:'website',locale:'es_AR'},
 twitter:{card:'summary',title:'30 plantillas de CV | Postulá Mejor',description:'Seis modelos gratis y 24 diseños incluidos con CV Pro+.'},
 icons:{icon:[{url:'/postula-mejor-favicon.svg',type:'image/svg+xml',sizes:'any'}],shortcut:'/postula-mejor-favicon.svg',apple:'/postula-mejor-favicon.svg'},
}

export default function TemplatesPage(){return <main className="pmt-page"><PlatformHeader/><TemplateGallery/><PlatformFooter/><MobileNav active="cv"/></main>}
