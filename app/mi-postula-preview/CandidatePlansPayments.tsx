'use client'

import Link from 'next/link'
import FlexCredits from '../changas-preview/FlexCredits'

export default function CandidatePlansPayments(){
 return <div className="pm42-payments-stack">
  <section className="pm42-panel pm42-products">
   <div className="pm42-section-head"><div><span>PLANES Y HERRAMIENTAS</span><h2>Pagos personales, separados de tu perfil.</h2><p>Elegí solamente lo que te sirva. Tu cuenta básica, tus postulaciones y tus mensajes siguen funcionando sin contratar un plan.</p></div></div>
   <div className="pm42-product-grid">
    <article><small>CV PRO+</small><h3>Mejorá tu CV con IA</h3><p>Una herramienta para revisar y mejorar el currículum antes de postularte.</p><strong>$5.990</strong><span>30 días</span><Link href="/mejorar-cv">Ver y contratar</Link></article>
   </div>
  </section>
  <section className="pm42-panel"><div className="pm42-section-head"><div><span>SERVICIOS FLEX</span><h2>Créditos para publicar servicios.</h2><p>Si ofrecés o necesitás publicar un Servicio Flex, el saldo personal se administra acá. Los créditos comprados son pagos únicos.</p></div></div><FlexCredits companyId={null} onCompanyChange={()=>{}} personalOnly/></section>
  <section className="pm42-panel pm42-payment-help"><div><span>HISTORIAL Y COMPROBANTES</span><h2>Todo pago queda asociado a tu cuenta.</h2><p>CV Pro+ y los créditos Flex utilizan Mercado Pago. Si un pago queda pendiente, la acreditación se actualiza cuando Mercado Pago confirma el estado.</p></div><Link href="/soporte">Necesito ayuda con un pago</Link></section>
 </div>
}
