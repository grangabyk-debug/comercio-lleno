import type { Metadata } from 'next'
import FacturasHistoryMobile from './FacturasHistoryMobile'

export const metadata:Metadata={
  title:'Mis facturas | FacturaLlena',
  robots:{index:false,follow:false},
}

export default function FacturasPage(){return <FacturasHistoryMobile/>}
