import type { Metadata } from 'next'
import VocationalTestClient from './VocationalTestClient'

export const metadata:Metadata={
  title:{absolute:'Test de intereses vocacionales y laborales gratis | Postulá Mejor'},
  description:'Descubrí áreas de trabajo que pueden encajar con tus intereses con un test gratuito basado en el modelo RIASEC. Resultado inmediato y conexión con tu primer CV.',
  alternates:{canonical:'https://postulamejor.com/test-vocacional'},
}

export default function VocationalTestPage(){return <VocationalTestClient/>}
