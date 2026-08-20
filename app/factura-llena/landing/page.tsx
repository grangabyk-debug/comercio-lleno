import type { Metadata } from 'next'
import FacturaLlenaLanding from '../FacturaLlenaLanding'

export const metadata: Metadata = {
  title: 'FacturaLlena | Facturá desde el celular',
  description: 'Conocé FacturaLlena: facturación electrónica ARCA simple, rápida y pensada para usar desde el celular.',
  robots: { index: false, follow: false },
}

export default function FacturaLlenaLandingPage(){
  return <FacturaLlenaLanding/>
}
