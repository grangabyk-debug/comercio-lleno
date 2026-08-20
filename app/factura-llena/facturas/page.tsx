import type { Metadata } from 'next'
import FacturasHistory from './FacturasHistory'

export const metadata:Metadata={
  title:'Mis facturas | FacturaLlena',
  robots:{index:false,follow:false},
}

export default function FacturasPage(){return <FacturasHistory/>}
