import type { Metadata } from 'next'
import MobileSimpleApp from './MobileSimpleAppV2'
import SaleSearchGuard from './SaleSearchGuard'

export const metadata: Metadata = {
  title: 'Comercio Lleno · Móvil',
  description: 'Experiencia simple de Comercio Lleno para vender desde el celular',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default function MobilePage() {
  return <><SaleSearchGuard /><MobileSimpleApp /></>
}
