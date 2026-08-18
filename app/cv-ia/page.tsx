import type { Metadata } from 'next'
import CvIaExperience from './CvIaExperience'

export const metadata: Metadata = {
  metadataBase: new URL('https://postulamejor.com'),
  title: 'Postulá Mejor | Mejorá tu CV y prepará cada postulación con IA',
  description: 'Analizá tu CV gratis, comparalo con una búsqueda laboral y prepará una candidatura específica con Triple Filtro IA, control factual y herramientas para entrevistas.',
  applicationName: 'Postulá Mejor',
  alternates: { canonical: 'https://postulamejor.com' },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: '/postula-mejor-favicon.svg', type: 'image/svg+xml', sizes: 'any' }],
    shortcut: '/postula-mejor-favicon.svg',
    apple: '/postula-mejor-favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://postulamejor.com',
    siteName: 'Postulá Mejor',
    title: 'Postulá Mejor | Una candidatura que compita mejor',
    description: 'Diagnóstico gratis de CV, adaptación por puesto, LinkedIn y preparación de entrevistas con control factual.',
  },
  twitter: {
    card: 'summary',
    title: 'Postulá Mejor | Una candidatura que compita mejor',
    description: 'Analizá tu CV gratis y prepará una candidatura específica para el trabajo que querés.',
  },
}

export default function CvIaPage() {
  return <CvIaExperience />
}
