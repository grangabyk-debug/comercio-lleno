import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata={
  title:'Comercio Lleno · Móvil',
  description:'Comercio Lleno adaptado para celular',
  robots:{index:false,follow:false},
}
export const dynamic='force-dynamic'

/**
 * /movil used to mount a preview-only POS that showed totals locally without
 * persisting the sale. Never expose that preview to production tenants again.
 * The real /redesign app is responsive and now also mounts the mobile scanner.
 */
export default function MobilePage(){
  redirect('/redesign')
}
