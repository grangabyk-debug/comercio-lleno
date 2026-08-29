import type {Metadata} from 'next'
import CvIaPage from '../cv-ia/page'
import CvAccountGate from './CvAccountGate'
import CandidatePlanOnly from './CandidatePlanOnly'

export const metadata:Metadata={
 metadataBase:new URL('https://postulamejor.com'),
 title:{absolute:'Mejorar mi CV | ATS y CV Pro+ · Postulá Mejor'},
 description:'Analizá tu CV gratis, revisá compatibilidad ATS y prepará versiones adaptadas a búsquedas reales sin inventar experiencia.',
 applicationName:'Postulá Mejor',
 alternates:{canonical:'https://postulamejor.com/mejorar-cv'},
 robots:{index:true,follow:true},
 openGraph:{title:'Mejorar mi CV | ATS y CV Pro+ · Postulá Mejor',description:'Analizá tu CV gratis, revisá compatibilidad ATS y prepará versiones adaptadas a búsquedas reales sin inventar experiencia.',url:'https://postulamejor.com/mejorar-cv',siteName:'Postulá Mejor',type:'website',locale:'es_AR'},
 twitter:{card:'summary',title:'Mejorar mi CV | ATS y CV Pro+ · Postulá Mejor',description:'Analizá tu CV gratis, revisá compatibilidad ATS y prepará versiones adaptadas a búsquedas reales sin inventar experiencia.'},
 icons:{icon:[{url:'/postula-mejor-favicon.svg',type:'image/svg+xml',sizes:'any'}],shortcut:'/postula-mejor-favicon.svg',apple:'/postula-mejor-favicon.svg'},
}
export const revalidate=300

export default function MejorarCvPage(){return <><CvAccountGate/><CandidatePlanOnly/><CvIaPage/></>}
