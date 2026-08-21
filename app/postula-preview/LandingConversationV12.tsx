'use client'

import {useEffect,useState} from 'react'
import {createPortal} from 'react-dom'

export default function LandingConversationV12(){
 const [host,setHost]=useState<HTMLElement|null>(null)
 useEffect(()=>{
  if(window.location.pathname!=='/')return

  // Mantener intacto el diseño de las tarjetas de oportunidades y quitar sólo el prefijo “EJEMPLO ·”.
  const cleanExampleLabels=()=>{
   document.querySelectorAll<HTMLElement>('body *').forEach(el=>{
    if(el.children.length===0&&/^EJEMPLO\s*·\s*/i.test(el.textContent||'')){
      el.textContent=(el.textContent||'').replace(/^EJEMPLO\s*·\s*/i,'')
    }
   })
  }
  cleanExampleLabels()
  const observer=new MutationObserver(cleanExampleLabels)
  observer.observe(document.body,{childList:true,subtree:true})

  const old=document.querySelector<HTMLElement>('.pm7-social-proof')
  if(!old){return()=>observer.disconnect()}
  const mount=document.createElement('div')
  mount.dataset.pm12ContactHost='1'
  old.insertAdjacentElement('beforebegin',mount)
  const previous=old.style.display
  old.style.display='none'
  setHost(mount)
  return()=>{observer.disconnect();old.style.display=previous;mount.remove()}
 },[])
 if(!host)return null
 return createPortal(
  <section className="pm12-contact" aria-label="Ejemplos de contacto laboral">
   <div className="pm12-contact-head">
    <div>
     <span className="pm12-contact-kicker">DEL MATCH A LA CONVERSACIÓN</span>
     <h2>Cuando aparece una oportunidad, <em>hablar es más fácil.</em></h2>
    </div>
    <p>Una empresa puede contactarte, coordinar una entrevista y confirmar horario sin que todo se sienta como un trámite. Y en Trabajos Flex, una tarea puntual también puede cerrarse conversando.</p>
   </div>

   <div className="pm12-contact-stage">
    <article className="pm12-person employer" style={{backgroundImage:"url('https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=900')"}}>
     <div className="pm12-person-info"><span>EMPRESA</span><b>Carla · Selección</b><small>Comercio · Palermo</small></div>
    </article>

    <article className="pm12-thread">
     <div className="pm12-thread-top">
      <div className="pm12-thread-person"><span className="pm12-avatar" style={{backgroundImage:"url('https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=300')"}}/><div><b>Carla · Selección</b><small>Vendedora/or · Palermo</small></div></div>
      <span className="pm12-online">en línea</span>
     </div>
     <div className="pm12-chat">
      <div className="pm12-msg from-employer">Hola, vimos tu postulación. ¿Tenés disponibilidad para una entrevista hoy?<small>14:08</small></div>
      <div className="pm12-msg from-candidate">Sí, puedo después de las 17. ¿Les sirve?<small>14:09</small></div>
      <div className="pm12-msg from-employer">Perfecto. ¿Te queda bien 17:30 en Palermo? Dura unos 25 minutos.<small>14:10</small></div>
      <div className="pm12-msg from-candidate">Sí, confirmo. ¡Gracias!<small>14:11</small></div>
      <div className="pm12-confirm"><i>✓</i><div><b>Entrevista confirmada · 17:30</b><small>La fecha y el lugar quedan visibles en la conversación.</small></div></div>
     </div>
    </article>

    <article className="pm12-person candidate" style={{backgroundImage:"url('https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=900')"}}>
     <div className="pm12-person-info"><span>CANDIDATA</span><b>Sofía · Ventas</b><small>Disponible por la tarde</small></div>
    </article>

    <div className="pm12-float-question q1">¿Podés venir hoy a las 17:30?</div>
    <div className="pm12-float-question q2">¿Tenés experiencia atendiendo público?</div>
    <div className="pm12-float-question q3">Entrevista confirmada ✓</div>

    <article className="pm12-flex-card">
     <div className="pm12-flex-photo" style={{backgroundImage:"url('https://images.pexels.com/photos/7210754/pexels-photo-7210754.jpeg?auto=compress&cs=tinysrgb&w=900')"}}><span>TRABAJO FLEX</span></div>
     <div className="pm12-flex-copy"><small>OTRA FORMA DE CONECTAR</small><h3>“¿Podés pasear a Milo mañana?”</h3><p>Una tarea puntual puede resolverse rápido: disponibilidad, horario, zona y pago quedan claros antes de aceptar.</p></div>
     <div className="pm12-flex-chat"><span>Hola, necesito un paseo mañana de 11 a 12 por Belgrano. ¿Podés?</span><span>Sí, estoy disponible. ¿Nos encontramos en la plaza?</span><b>✓ Disponibilidad coordinada</b></div>
    </article>
   </div>
  </section>,host)
}
