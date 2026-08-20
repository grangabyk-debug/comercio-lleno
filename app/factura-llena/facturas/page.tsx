import type { Metadata } from 'next'
import FacturasHistory from './FacturasHistory'
import '../app-mobile-fix.css'

export const metadata:Metadata={
  title:'Mis facturas | FacturaLlena',
  robots:{index:false,follow:false},
}

export default function FacturasPage(){return <FacturasHistory/>}
