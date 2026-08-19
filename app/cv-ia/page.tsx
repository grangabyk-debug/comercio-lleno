import type { Metadata } from 'next'
import CvIaExperience from './CvIaExperience'
import OwnerTestBridge from './OwnerTestBridge'
import ConsentBridge from './ConsentBridge'
import OrientationBridge from './OrientationBridge'
import CheckoutBridge from './CheckoutBridge'
import AuthStatusLink from './AuthStatusLink'
import FunnelBridge from './FunnelBridge'
import PhotoPreserveBridge from './PhotoPreserveBridge'
import FreeCareerTools from './FreeCareerTools'
import FirstCvBridge from './FirstCvBridge'
import PriceBridge from './PriceBridge'
import CommentPolicyBridge from './CommentPolicyBridge'
import AtsBridge from './AtsBridge'
import './postula-mejor-polish.css'
import './postula-flow-v2.css'
import './ats-offer.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://postulamejor.com'),
  title: { absolute: 'Postulá Mejor | CV ATS, CV Pro y postulaciones con IA' },
  description: 'Analizá tu CV gratis, revisá compatibilidad ATS, recibí orientación laboral y prepará un CV Pro optimizado para sistemas de selección sin inventar experiencia.',
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
    title: 'Postulá Mejor | CV ATS y candidaturas que compiten mejor',
    description: 'Diagnóstico gratis, análisis ATS, test de intereses, primer CV guiado y CV Pro optimizado con control factual.',
  },
  twitter: {
    card: 'summary',
    title: 'Postulá Mejor | CV ATS y candidaturas con IA',
    description: 'Analizá tu CV gratis y optimizalo para sistemas ATS sin inventar experiencia.',
  },
}

export default function CvIaPage() {
  return (
    <div className="postulaMejorShell">
      <div className="postulaBrandBar" aria-label="Postulá Mejor">
        <a className="postulaWordmark" href="#inicio" aria-label="Ir al inicio de Postulá Mejor">
          <span>postula</span><strong>mejor</strong><span>.com</span>
        </a>
        <nav className="postulaTopTools" aria-label="Herramientas gratuitas">
          <a href="/test-vocacional">Test vocacional <b>gratis</b></a>
          <a href="/primer-cv">Primer CV <b>gratis</b></a>
        </nav>
        <AuthStatusLink />
      </div>
      <CvIaExperience />
      <FreeCareerTools />
      <ConsentBridge />
      <OrientationBridge />
      <CheckoutBridge />
      <PhotoPreserveBridge />
      <FirstCvBridge />
      <PriceBridge />
      <FunnelBridge />
      <CommentPolicyBridge />
      <AtsBridge />
      <OwnerTestBridge />
    </div>
  )
}
