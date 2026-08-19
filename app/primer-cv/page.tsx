import type { Metadata } from 'next'
import FirstCvClient from './FirstCvClient'

export const metadata:Metadata={
  title:{absolute:'Armar mi primer CV gratis | Postulá Mejor'},
  description:'Creá tu primer currículum paso a paso, incluso si todavía no tenés experiencia formal. Gratis y listo para analizar en Postulá Mejor.',
  alternates:{canonical:'https://postulamejor.com/primer-cv'},
}
export default function FirstCvPage(){return <FirstCvClient/>}
