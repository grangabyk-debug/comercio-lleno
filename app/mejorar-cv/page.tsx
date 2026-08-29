import type {Metadata} from 'next'
import CvIaPage from '../cv-ia/page'
import CvAccountGate from './CvAccountGate'

export const metadata:Metadata={
 metadataBase:new URL('https://postulamejor.com'),
 title:{absolute:'Mejorar CV gratis | Analizador ATS y CV con IA · Postulá Mejor'},
 description:'Subí tu currículum, analizalo gratis, revisá compatibilidad ATS y detectá mejoras concretas para postularte mejor sin inventar experiencia.',
 keywords:['mejorar cv','mejorar curriculum','analizar cv','revisar cv','cv ats','curriculum ats','cv con ia','curriculum con ia','optimizar cv','mejorar cv gratis'],
 applicationName:'Postulá Mejor',
 alternates:{canonical:'https://postulamejor.com/mejorar-cv'},
 robots:{index:true,follow:true},
 openGraph:{title:'Mejorar CV gratis | Analizador ATS y CV con IA · Postulá Mejor',description:'Analizá tu CV gratis, revisá compatibilidad ATS y detectá mejoras concretas antes de postularte.',url:'https://postulamejor.com/mejorar-cv',siteName:'Postulá Mejor',type:'website',locale:'es_AR'},
 twitter:{card:'summary',title:'Mejorar CV gratis | Postulá Mejor',description:'Analizá tu currículum, revisá ATS y detectá mejoras concretas antes de postularte.'},
 icons:{icon:[{url:'/postula-mejor-favicon.svg',type:'image/svg+xml',sizes:'any'}],shortcut:'/postula-mejor-favicon.svg',apple:'/postula-mejor-favicon.svg'},
}
export const revalidate=300
export default function MejorarCvPage(){return <><CvAccountGate/><CvIaPage/></>}
