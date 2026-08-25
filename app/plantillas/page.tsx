import type {Metadata} from 'next'
import TemplateGallery from './TemplateGallery'
import {PlatformFooter,PlatformHeader,MobileNav} from '../postula-preview/PlatformChrome'
import './template-gallery.css'

export const metadata:Metadata={
 metadataBase:new URL('https://postulamejor.com'),
 title:{absolute:'Plantillas de CV gratis y CV Pro+ | Postulá Mejor'},
 description:'30 plantillas de currículum originales. Seis gratuitas y 24 incluidas con CV Pro+. Descargá Word editable y volvé a analizarlo sin perder el modelo.',
 alternates:{canonical:'https://postulamejor.com/plantillas'},
 robots:{index:true,follow:true},
 openGraph:{title:'30 plantillas de CV | Postulá Mejor',description:'Modelos gratuitos y diseños CV Pro+ para descargar y editar en Word.',url:'https://postulamejor.com/plantillas',siteName:'Postulá Mejor',type:'website',locale:'es_AR'},
 icons:{icon:[{url:'/postula-mejor-favicon.svg',type:'image/svg+xml',sizes:'any'}],shortcut:'/postula-mejor-favicon.svg',apple:'/postula-mejor-favicon.svg'},
}

export default function PlantillasPage(){return <main className="pmt-page"><PlatformHeader/><TemplateGallery/><PlatformFooter/><MobileNav active="cv"/></main>}
