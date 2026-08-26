import Link from 'next/link'
import './employer-reputation-v41.css'

const ticker=['Vínculo verificado','Cumplimiento consistente','Comunicación destacada','Sin datos sensibles','Revisión disponible','Vínculo verificado','Cumplimiento consistente','Comunicación destacada','Sin datos sensibles','Revisión disponible']

const employerEvidence=[
  {title:'Cumplimiento de lo acordado',state:'Consistente',copy:'La señal resume experiencias verificadas y nunca reemplaza la validación durante la entrevista.'},
  {title:'Comunicación profesional',state:'Destacada',copy:'Se muestra contexto útil para preparar mejores preguntas y reducir incertidumbre antes de avanzar.'},
  {title:'Organización',state:'Buena señal',copy:'El historial aporta una referencia adicional, separada del porcentaje de ajuste al puesto.'},
]

const fairness=[
  {title:'Publicación diferida',copy:'Una parte no ve la evaluación de la otra mientras todavía puede condicionar su respuesta.'},
  {title:'Derecho a revisión',copy:'Persona y empresa pueden pedir revisión si detectan un vínculo incorrecto, fraude o un dato objetivo erróneo.'},
  {title:'Sin acusaciones públicas',copy:'Los incidentes graves van por soporte y moderación; no se convierten en una estrella o comentario abierto.'},
]

export default function EmployerReputationShowcase(){
 return <section className="pm7-employer-section dark pm41-trust-section">
   <div className="pm41-light one" aria-hidden="true"/><div className="pm41-light two" aria-hidden="true"/>
   <div className="pm7-employer-section-inner pm41-inner">
    <div className="pm41-hero">
      <div className="pm41-hero-copy">
        <span className="pm41-kicker">SEÑALES LABORALES VERIFICADAS · PARA DECIDIR MEJOR</span>
        <h2>Menos intuición a ciegas.<br/><em>Más contexto para contratar.</em></h2>
        <p>Cuando llega un buen CV, el problema no siempre es encontrar información: es saber <strong>qué conviene validar antes de tomar una decisión</strong>. Las señales verificadas suman contexto sobre experiencias reales sin convertir a nadie en una etiqueta.</p>
        <div className="pm41-benefits"><span>Vínculos verificables</span><span>Señales explicables</span><span>Decisión siempre humana</span></div>
        <Link className="pm41-policy-link" href="/politica-evaluaciones"><b>Protecciones para ambas partes</b><span>→</span></Link>
      </div>

      <div className="pm41-stage" aria-label="Ejemplo ilustrativo de cómo un empleador puede ver señales verificadas">
        <div className="pm41-stage-top"><span>VISTA DE EMPRESA · EJEMPLO</span><span className="pm41-live">CONTEXTO ACTIVO</span></div>
        <div className="pm41-person">
          <div className="pm41-person-photo" aria-hidden="true"/>
          <div className="pm41-person-info"><span>PERFIL ILUSTRATIVO</span><h3>Perfil A</h3><p>Ventas · caja · retail</p><div className="pm41-match"><strong>94%</strong><span>ajuste con este aviso</span></div></div>
        </div>
        <div className="pm41-insight"><span>NEXO · QUÉ CONVIENE VALIDAR</span><b>Buen ajuste y señales consistentes.</b><p>La experiencia previa aporta contexto positivo. Antes de avanzar, conviene confirmar disponibilidad de sábados y tareas de cierre de caja.</p></div>
        <div className="pm41-ticker" aria-hidden="true"><div className="pm41-ticker-track">{ticker.map((item,index)=><span key={`${item}-${index}`}><i/>{item}</span>)}</div></div>
      </div>
    </div>

    <div className="pm41-flow">
      <article><small>01 · VERIFICAR</small><b>Primero tiene que existir un vínculo.</b><p>La señal se habilita sólo cuando la plataforma puede asociar a ambas partes con una experiencia laboral determinada.</p></article>
      <article><small>02 · RESPONDER</small><b>Las dos partes tienen voz.</b><p>Empresa y persona responden criterios estructurados. Las respuestas pueden permanecer ocultas hasta que ambos evalúen o venza el plazo.</p></article>
      <article><small>03 · DECIDIR</small><b>El empleador recibe contexto, no una sentencia.</b><p>La señal ayuda a preparar preguntas y priorizar validaciones. No reemplaza entrevista, referencias ni criterio humano.</p></article>
    </div>

    <div className="pm41-market-grid">
      <article className="pm41-employer-panel">
        <div className="pm41-panel-head"><div><span>LO QUE LE APORTA A LA EMPRESA</span><h3>Una lectura más rápida de lo que vale la pena preguntar.</h3></div><div className="pm41-panel-badge">DECISIÓN ASISTIDA</div></div>
        <div className="pm41-evidence">{employerEvidence.map(item=><article key={item.title}><span>{item.title}</span><b>{item.state}</b><p>{item.copy}</p></article>)}</div>
        <div className="pm41-employer-note"><strong>Importante:</strong> el porcentaje de coincidencia con el aviso y las señales de experiencia son capas distintas. Una señal nunca debe ser el único motivo automático para ordenar, bloquear o excluir candidatos.</div>
      </article>

      <article className="pm41-fairness-panel">
        <span>PROTECCIÓN BILATERAL</span><h3>La confianza también tiene que cuidar a la otra parte.</h3><p>Para que una señal sea útil para quien contrata, tiene que ser difícil de manipular y razonablemente justa para quien está siendo evaluado.</p>
        <div className="pm41-fairness-list">{fairness.map(item=><div key={item.title}><b>{item.title}</b><small>{item.copy}</small></div>)}</div>
        <div className="pm41-fairness-footer"><strong>La empresa también puede ser evaluada.</strong> Claridad de condiciones, cumplimiento de acuerdos, trato y organización siguen la misma lógica de vínculo verificable y revisión.</div>
      </article>
    </div>

    <div className="pm41-summary">
      <div className="pm41-score"><span>HISTORIAL SUFICIENTE</span><strong>Resumen disponible</strong><small>12 evaluaciones · 4 vínculos verificados. Ejemplo ilustrativo, no antecedente laboral.</small></div>
      <div className="pm41-summary-copy"><span>RESUMEN QUE PODRÍA VER UN EMPLEADOR</span><h3>Contexto útil sin reducir una persona a un número.</h3><p>En lugar de una gran estrella o un “4,7/5”, la interfaz prioriza señales comprensibles, cantidad de experiencias verificadas y alertas de revisión cuando corresponde.</p><div className="pm41-summary-tags"><span>✓ Cumplimiento consistente</span><span>✓ Comunicación destacada</span><span>✓ Organización consistente</span><span>4 vínculos verificados</span></div></div>
    </div>

    <div className="pm41-guardrails">
      <div className="pm41-guardrail-title"><span>REGLAS QUE SOSTIENEN EL SISTEMA</span><h3>Más valor para contratar, sin convertir reputación en castigo automático.</h3></div>
      <div className="pm41-guardrail-list">
        <article><b>Una evaluación por parte y por vínculo.</b><p>Reduce duplicados, campañas coordinadas e intentos de inflar o destruir una señal.</p></article>
        <article><b>Muestra chica = señal en formación.</b><p>Con poco historial no se destaca un promedio fuerte ni una conclusión definitiva.</p></article>
        <article><b>Revisión e impugnación.</b><p>Una señal cuestionada puede marcarse, limitarse o dejar de computarse mientras se revisa.</p></article>
        <article><b>Datos sensibles fuera del sistema.</b><p>Salud, religión, origen, opiniones políticas, vida sexual y demás categorías protegidas no forman parte de los criterios.</p></article>
      </div>
    </div>

    <div className="pm41-legal"><div><span>PRIVACIDAD + REPUTACIÓN</span><b>La utilidad comercial no cambia las reglas de protección.</b><p>La política específica explica vínculo verificable, moderación, publicación diferida, acceso, rectificación, supresión y revisión.</p></div><Link href="/politica-evaluaciones">Ver política <span>→</span></Link></div>
   </div>
 </section>
}
