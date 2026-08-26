import Link from 'next/link'

const employeeSignals=[
  ['Cumplimiento de lo acordado','Consistente'],
  ['Comunicación','Muy buena señal'],
  ['Colaboración profesional','Consistente'],
  ['Organización','Buena señal'],
]

const employerSignals=[
  ['Claridad de condiciones','Muy buena señal'],
  ['Cumplimiento de pago y acuerdos','Consistente'],
  ['Trato y comunicación','Muy buena señal'],
  ['Organización','Buena señal'],
]

function SignalRows({items}:{items:string[][]}){
  return <div className="pm40-signal-list">{items.map(([label,value],index)=><div key={label}>
    <span>{label}</span>
    <div className="pm40-signal-track" aria-hidden="true"><i style={{width:`${[92,86,89,78][index]}%`}}/></div>
    <b>{value}</b>
  </div>)}</div>
}

export default function EmployerReputationShowcase(){
 return <section className="pm7-employer-section dark pm40-trust-section">
   <div className="pm40-orb one" aria-hidden="true"/><div className="pm40-orb two" aria-hidden="true"/>
   <div className="pm7-employer-section-inner pm40-trust-inner">
    <div className="pm40-trust-head">
      <div>
        <span className="pm7-eyebrow lime">CONFIANZA CON CONTEXTO · DE LOS DOS LADOS</span>
        <h2>Experiencias verificadas.<br/><em>No etiquetas.</em></h2>
      </div>
      <div className="pm40-head-copy">
        <p>La idea no es crear una “lista negra” ni un puntaje que decida quién merece un trabajo. Las señales aparecen únicamente vinculadas a experiencias laborales verificadas y siempre con contexto.</p>
        <div className="pm40-head-pills"><span>Sin ranking secreto</span><span>Sin datos sensibles</span><span>Con revisión</span></div>
      </div>
    </div>

    <div className="pm40-how">
      <article><span>01</span><div><b>Se verifica el vínculo</b><p>La evaluación se habilita cuando existe una relación laboral que la plataforma puede vincular con ambas partes.</p></div></article>
      <article><span>02</span><div><b>Cada parte responde</b><p>Empresa y trabajador usan criterios estructurados. La respuesta de la otra parte no se muestra mientras todavía puede influir en la propia.</p></div></article>
      <article><span>03</span><div><b>Se muestra contexto, no sentencia</b><p>Con suficiente historial se presenta un resumen explicable. Nunca reemplaza una entrevista ni una decisión humana.</p></div></article>
    </div>

    <div className="pm40-review-grid">
      <article className="pm40-review-card employee">
        <header><div className="pm40-review-icon">E→P</div><div><span>EMPRESA → PERSONA</span><h3>La empresa cuenta cómo fue trabajar con esa persona.</h3></div></header>
        <SignalRows items={employeeSignals}/>
        <footer><b>Lo visible es estructurado.</b><p>No usamos un campo abierto para publicar acusaciones, insultos o datos privados sobre una persona.</p></footer>
      </article>

      <article className="pm40-summary-card">
        <div className="pm40-summary-glow" aria-hidden="true"/>
        <header><span>RESUMEN DE EJEMPLO</span><b>Señales verificadas</b><small>Basadas en experiencias laborales confirmadas</small></header>
        <div className="pm40-summary-state"><div className="pm40-shield" aria-hidden="true">✓</div><div><span>HISTORIAL SUFICIENTE</span><strong>Resumen disponible</strong><small>12 evaluaciones · 4 vínculos verificados</small></div></div>
        <div className="pm40-summary-signals"><span><i/>Cumplimiento consistente</span><span><i/>Comunicación destacada</span><span><i/>Organización consistente</span></div>
        <div className="pm40-summary-context"><b>No es un antecedente laboral.</b><p>No certifica hechos externos, no define aptitud general y no se usa como único motivo automático para ordenar o excluir candidatos.</p></div>
      </article>

      <article className="pm40-review-card employer">
        <header><div className="pm40-review-icon">P→E</div><div><span>PERSONA → EMPRESA</span><h3>La persona también cuenta cómo fue trabajar con esa empresa.</h3></div></header>
        <SignalRows items={employerSignals}/>
        <footer><b>La regla es simétrica.</b><p>La empresa también construye señales con experiencias verificadas y puede pedir revisión si detecta un dato incorrecto.</p></footer>
      </article>
    </div>

    <div className="pm40-states" aria-label="Cómo cambia la señal según la cantidad de evaluaciones">
      <article><span>0–2</span><div><b>Señal en formación</b><p>No mostramos un promedio fuerte con una muestra demasiado chica.</p></div></article>
      <article><span>3+</span><div><b>Resumen con contexto</b><p>Se informa cantidad de evaluaciones y criterios, no sólo un número aislado.</p></div></article>
      <article><span>!</span><div><b>En revisión</b><p>Si una señal es cuestionada, puede marcarse y revisarse antes de seguir utilizándola.</p></div></article>
    </div>

    <div className="pm40-guardrails">
      <div className="pm40-guardrail-title"><span>REGLAS DE DISEÑO</span><h3>La confianza sirve sólo si no se transforma en castigo automático.</h3></div>
      <div className="pm40-guardrail-grid">
        <article><i>01</i><b>Una experiencia, una evaluación por parte.</b><p>Reduce duplicados, campañas coordinadas y manipulación del historial.</p></article>
        <article><i>02</i><b>Publicación diferida.</b><p>Las respuestas se revelan cuando ambos evaluaron o vence el plazo, para reducir represalias.</p></article>
        <article><i>03</i><b>Derecho a acceso y revisión.</b><p>La persona o empresa puede conocer qué señal le corresponde y pedir corrección cuando exista un error.</p></article>
        <article><i>04</i><b>Incidentes graves van por otro canal.</b><p>Denuncias, delitos, discriminación o conflictos legales no se resuelven con una estrella: requieren soporte y revisión.</p></article>
      </div>
    </div>

    <div className="pm40-legal-callout">
      <div><span>PRIVACIDAD + REPUTACIÓN</span><b>Diseñado para aportar contexto sin convertir una opinión en una condena digital.</b><p>La política específica explica qué se muestra, qué no, cómo se modera y cómo pedir acceso, rectificación, supresión o revisión según corresponda.</p></div>
      <Link href="/politica-evaluaciones">Ver política de evaluaciones <span>→</span></Link>
    </div>
   </div>
 </section>
}
