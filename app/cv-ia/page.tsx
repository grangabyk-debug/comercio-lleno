import type { Metadata } from 'next'
import CvIaExperience from './CvIaExperience'
import OwnerTestBridge from './OwnerTestBridge'
import ConsentBridge from './ConsentBridge'
import OrientationBridge from './OrientationBridge'
import AuthStatusLink from './AuthStatusLink'
import './postula-mejor-polish.css'
import './postula-flow-v2.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://postulamejor.com'),
  title: { absolute: 'Postulá Mejor | Mejorá tu CV y prepará cada postulación con IA' },
  description: 'Analizá tu CV gratis, recibí orientación laboral o comparalo con una búsqueda concreta y prepará una candidatura específica con control factual.',
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
    description: 'Diagnóstico gratis, orientación laboral, adaptación por puesto, LinkedIn y preparación de entrevistas con control factual.',
  },
  twitter: {
    card: 'summary',
    title: 'Postulá Mejor | Una candidatura que compita mejor',
    description: 'Analizá tu CV gratis, descubrí a qué puestos te conviene apuntar y prepará candidaturas específicas.',
  },
}

export default function CvIaPage() {
  return (
    <div className="postulaMejorShell">
      <div className="postulaBrandBar" aria-label="Postulá Mejor">
        <a className="postulaWordmark" href="#inicio" aria-label="Ir al inicio de Postulá Mejor">
          <span>postula</span><strong>mejor</strong><span>.com</span>
        </a>
        <AuthStatusLink />
      </div>
      <CvIaExperience />
      <ConsentBridge />
      <OrientationBridge />
      <OwnerTestBridge />
    </div>
  )
}
