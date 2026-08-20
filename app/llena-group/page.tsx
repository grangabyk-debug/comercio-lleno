import type { Metadata } from 'next'
import { LlenaGroupMobile } from './mobile'

export const metadata:Metadata={
  title:'Llena Group',
  description:'Canal privado con Nexo y control esencial de Llena Group.',
  robots:{index:false,follow:false},
  themeColor:'#05070b',
}

export default function LlenaGroupPage(){return <LlenaGroupMobile/>}
