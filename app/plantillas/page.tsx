import type {Metadata} from 'next'
import TemplateGallery from './TemplateGallery'
import {PlatformFooter,PlatformHeader,MobileNav} from '../postula-preview/PlatformChrome'
import './template-gallery.css'
import './template-gallery-v3.css'

export const metadata:Metadata={
 metadataBase:new URL('https://postulamejor.com'),
 title:{absolute:'36 plantillas de CV gratis y CV Pro+ | Postulá Mejor'},
 description:'36 plantillas de currículum originales. Doce gratuitas y 24 incluidas con CV Pro+. Descargá Word editable y volvé a analizarlo sin perder el modelo.',
 alternates:{canonical:'https://postulamejor.com/plantillas'},
 robots:{index:true,follow:true},
 openGraph:{title:'36 plantillas de CV | Postulá Mejor',description:'12 modelos gratuitos y 24 diseños CV Pro+ para descargar y editar en Word.',url:'https://postulamejor.com/plantillas',siteName:'Postulá Mejor',type:'website',locale:'es_AR'},
 twitter:{card:'summary',title:'36 plantillas de CV | Postulá Mejor',description:'12 modelos gratis y 24 diseños incluidos con CV Pro+.'},
 icons:{icon:[{url:'/postula-mejor-favicon.svg',type:'image/svg+xml',sizes:'any'}],shortcut:'/postula-mejor-favicon.svg',apple:'/postula-mejor-favicon.svg'},
}

export default function PlantillasPage(){return <main className="pmt-page"><PlatformHeader/><TemplateGallery/><PlatformFooter/><MobileNav active="cv"/></main>}
