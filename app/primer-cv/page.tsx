import type { Metadata } from 'next'
import FirstCvClient from './FirstCvClient'

export const metadata:Metadata={
  metadataBase:new URL('https://postulamejor.com'),
  title:{absolute:'Armar mi primer CV gratis | Postulá Mejor'},
  description:'Creá tu primer currículum paso a paso, incluso si todavía no tenés experiencia formal. Gratis y listo para analizar en Postulá Mejor.',
  applicationName:'Postulá Mejor',
  alternates:{canonical:'https://postulamejor.com/primer-cv'},
  icons:{icon:[{url:'/postula-mejor-favicon.svg',type:'image/svg+xml',sizes:'any'}],shortcut:'/postula-mejor-favicon.svg',apple:'/postula-mejor-favicon.svg'},
  openGraph:{siteName:'Postulá Mejor',type:'website',locale:'es_AR',url:'https://postulamejor.com/primer-cv',title:'Armar mi primer CV gratis | Postulá Mejor',description:'Una guía paso a paso para crear un CV honesto incluso sin experiencia formal y llevarlo directo al analizador.'},
}
export default function FirstCvPage(){return <FirstCvClient/>}
