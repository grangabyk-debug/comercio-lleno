export default function EmployerReputationShowcase(){
 const employeeMetrics=['Cumplimiento de tareas','Puntualidad y asistencia','Comunicación','Volvería a contratar']
 const employerMetrics=['Pago y condiciones','Respeto de horarios','Trato y comunicación','Volvería a trabajar ahí']
 const scoreDots=(active:number)=><span className="pm37-score-dots" aria-hidden="true">{[1,2,3,4,5].map(n=><i key={n} data-on={n<=active}/>)}</span>
 return <section className="pm7-employer-section dark pm37-reputation-section">
   <div className="pm7-employer-section-inner">
    <div className="pm37-reputation-head">
      <div><span className="pm7-eyebrow lime">REPUTACIÓN LABORAL · DE LOS DOS LADOS</span><h2>Una señal útil, sin convertir a nadie en una etiqueta.</h2></div>
      <p>Empleado y empleador pueden calificarse solamente después de una relación laboral verificada. El resultado aparece separado del match con el puesto y nunca define por sí solo a quién contratar.</p>
    </div>

    <div className="pm37-reputation-grid">
      <article className="pm37-profile-preview">
        <div className="pm37-profile-top"><div className="pm37-profile-avatar">PM</div><div><span>PERFIL DE EJEMPLO</span><b>Reputación laboral</b><small>Visible para la persona y para empresas autorizadas</small></div><em>VERIFICADA</em></div>
        <div className="pm37-profile-score"><div><strong>4,7</strong><span>/ 5</span></div><p><b>12 evaluaciones verificadas</b><small>4 relaciones laborales confirmadas</small></p></div>
        <div className="pm37-profile-breakdown"><div><span>Cumplimiento</span>{scoreDots(5)}</div><div><span>Puntualidad</span>{scoreDots(4)}</div><div><span>Comunicación</span>{scoreDots(5)}</div></div>
        <div className="pm37-reputation-note"><b>Esto no es el match.</b><span>El porcentaje de compatibilidad con una búsqueda se calcula aparte, según experiencia, requisitos, zona y disponibilidad.</span></div>
      </article>

      <div className="pm37-rating-flows">
        <article className="pm37-rating-card worker"><header><span>01</span><div><small>AL CERRAR UNA RELACIÓN VERIFICADA</small><b>El empleador califica al trabajador</b></div></header><div className="pm37-rating-list">{employeeMetrics.map((m,i)=><div key={m}><span>{m}</span>{scoreDots([5,4,5,5][i])}</div>)}</div><footer><b>Sin texto libre público.</b><span>Se usan preguntas estructuradas para reducir insultos, represalias y acusaciones difíciles de verificar.</span></footer></article>
        <article className="pm37-rating-card company"><header><span>02</span><div><small>EL MISMO DERECHO PARA LA OTRA PARTE</small><b>El trabajador califica al empleador</b></div></header><div className="pm37-rating-list">{employerMetrics.map((m,i)=><div key={m}><span>{m}</span>{scoreDots([5,4,5,4][i])}</div>)}</div><footer><b>La empresa también construye reputación.</b><span>Una persona puede saber si otras experiencias laborales verificadas fueron claras y respetuosas.</span></footer></article>
      </div>
    </div>

    <div className="pm37-reputation-states">
      <article className="empty"><span>0 evaluaciones</span><b>Sin datos</b><p>Si nunca recibió una calificación verificada, no se inventa una señal ni se muestra un cero.</p></article>
      <article className="forming"><span>1–2 evaluaciones</span><b>Señal inicial</b><p>Se informa cuántas experiencias hay, pero la reputación todavía se muestra como “en formación”.</p></article>
      <article className="ready"><span>3+ evaluaciones</span><b>Reputación visible</b><p>Se muestra promedio, cantidad de evaluaciones y desglose por criterios, siempre con contexto.</p></article>
    </div>

    <div className="pm37-reputation-rules">
      <div><b>Una relación, una evaluación por parte.</b><span>No se puede puntuar repetidas veces el mismo vínculo.</span></div>
      <div><b>Sin represalia inmediata.</b><span>La calificación de la otra parte se revela cuando ambos enviaron la suya o vence el plazo.</span></div>
      <div><b>Derecho a revisión.</b><span>Si el vínculo no corresponde o hay un dato incorrecto, se puede pedir revisión.</span></div>
      <div><b>No ordena candidatos.</b><span>La reputación aporta contexto; no reemplaza experiencia, requisitos ni decisión humana.</span></div>
    </div>
   </div>
 </section>
}
