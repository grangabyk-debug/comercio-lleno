import type { Metadata } from 'next'
import FacturaLlenaPreview from './FacturaLlenaPreview'

export const metadata: Metadata = {
  title: 'Factura Llena | Facturá desde el celular en segundos',
  description: 'Facturación electrónica ARCA simple, rápida y pensada para usar desde el celular. Emití, compartí y cobrá desde un solo lugar.',
  manifest: '/factura-llena/manifest',
  robots: { index: false, follow: false },
}

export default function FacturaLlenaPage(){
  return <FacturaLlenaPreview />
}
