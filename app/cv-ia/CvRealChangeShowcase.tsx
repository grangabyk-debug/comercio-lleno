'use client'

export default function CvRealChangeShowcase(){
 return <section className="pmcv-real-hero" aria-labelledby="pmcv-real-title">
  <div className="pmcv-real-inner">
   <div className="pmcv-real-copy">
    <span className="pmcv-real-kicker">MEJORAR CV · IA CON CONTROL FACTUAL</span>
    <h1 id="pmcv-real-title">Detectá qué está flojo y <em>mejoralo sin inventar experiencia.</em></h1>
    <p>Subís tu CV, indicás el puesto y el sistema revisa estructura, claridad, compatibilidad con el aviso y qué tan convincente resulta para selección.</p>
    <ul>
     <li><i>✓</i><span>Detecta frases vagas y puntos difíciles de entender.</span></li>
     <li><i>✓</i><span>Compara tu CV con una oferta si la pegás.</span></li>
     <li><i>✓</i><span>Separa la mirada ATS, recruiter y responsable del área.</span></li>
     <li><i>✓</i><span>No agrega métricas, cargos ni logros que no estén respaldados.</span></li>
    </ul>
    <div className="pmcv-real-actions">
     <button type="button" onClick={()=>document.getElementById('analisis')?.scrollIntoView({behavior:'smooth',block:'center'})}>Analizar mi CV gratis</button>
     <a href="#pmcv-ejemplo">Ver un cambio realista</a>
    </div>
    <small>La vista de la derecha es una demostración del tipo de sugerencia que devuelve el sistema. Tu diagnóstico usa únicamente tu CV y, si lo cargás, el aviso laboral.</small>
   </div>

   <div className="pmcv-real-stage" id="pmcv-ejemplo" aria-label="Ejemplo visual de análisis de CV">
    <div className="pmcv-demo-label">EJEMPLO VISUAL · NO ES UN CV REAL</div>
    <div className="pmcv-scan-status"><span className="pmcv-scan-dot"/><b>Analizando claridad y compatibilidad</b><em>IA</em></div>
    <article className="pmcv-demo-cv">
     <header><div className="pmcv-demo-avatar"><img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=82" alt="" loading="eager"/></div><div><h2>Valeria Gómez</h2><p>Administración · Atención al cliente</p></div></header>
     <div className="pmcv-demo-meta"><span>Buenos Aires</span><span>valeria@ejemplo.com</span></div>
     <section><b>PERFIL</b><p>Experiencia en tareas administrativas y atención al público. Responsable y organizada.</p></section>
     <section><b>EXPERIENCIA</b><h3>Asistente administrativa</h3><small>Empresa ejemplo · 2023 — Actualidad</small><p className="pmcv-demo-highlight">Atención al cliente y manejo de reclamos.</p><p>Gestión de documentación y coordinación con distintas áreas.</p></section>
     <section><b>HABILIDADES</b><div className="pmcv-demo-tags"><span>Excel</span><span>Atención al cliente</span><span>Organización</span></div></section>
     <div className="pmcv-scan-line" aria-hidden="true"/>
    </article>

    <aside className="pmcv-float pmcv-float-rewrite">
     <span>REDACCIÓN</span><b>Frase demasiado genérica</b>
     <p className="pmcv-before">“Atención al cliente y manejo de reclamos.”</p>
     <i>→</i>
     <p className="pmcv-after">“Atendí consultas y reclamos de clientes, realizando seguimiento hasta su resolución.”</p>
    </aside>

    <aside className="pmcv-float pmcv-float-proof">
     <span>CONTROL FACTUAL</span><b>No inventamos una métrica</b>
     <p>Si realmente tenés un dato de volumen, tiempo o resultado, el sistema puede sugerirte agregarlo. Si no existe en tu experiencia, no lo fabrica.</p>
    </aside>

    <aside className="pmcv-float pmcv-float-ats">
     <span>FILTRO ATS</span><b>Comparación con el aviso</b>
     <p>Revisa estructura, legibilidad y términos relevantes del puesto sin rellenar el CV con palabras clave artificiales.</p>
    </aside>
   </div>
  </div>
 </section>
}
