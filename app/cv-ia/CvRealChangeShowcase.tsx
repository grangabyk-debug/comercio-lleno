'use client'

export default function CvRealChangeShowcase(){
 return <>
  <section className="pmcv-real-hero" aria-labelledby="pmcv-real-title">
   <div className="pmcv-hero-motion" aria-hidden="true">
    <span className="pmcv-hero-orbit pmcv-hero-orbit-a"><i/></span>
    <span className="pmcv-hero-orbit pmcv-hero-orbit-b"><i/></span>
    <span className="pmcv-hero-glow pmcv-hero-glow-violet"/>
    <span className="pmcv-hero-glow pmcv-hero-glow-lime"/>
   </div>
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
  <style>{`
   .pmcv-real-hero{position:relative!important;overflow:hidden!important;isolation:isolate!important}
   .pmcv-real-inner{position:relative!important;z-index:2!important}
   .pmcv-hero-motion{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden}
   .pmcv-hero-orbit{position:absolute;display:block;border-radius:999px;border:1px solid rgba(105,87,255,.18);box-shadow:inset 0 0 72px rgba(105,87,255,.035),0 0 84px rgba(105,87,255,.04)}
   .pmcv-hero-orbit::after{content:'';position:absolute;inset:12%;border:1px dashed rgba(105,87,255,.12);border-radius:inherit}
   .pmcv-hero-orbit i{position:absolute;display:block;width:17px;height:17px;border-radius:50%;background:linear-gradient(135deg,#6957ff,#9f90ff);box-shadow:0 0 0 7px rgba(105,87,255,.10),0 8px 28px rgba(105,87,255,.28)}
   .pmcv-hero-orbit-a{width:560px;height:560px;right:-100px;top:50%;margin-top:-270px;animation:pmcvOrbitFloatA 10s ease-in-out infinite}
   .pmcv-hero-orbit-a i{left:9%;top:23%;animation:pmcvOrbPulse 3.8s ease-in-out infinite}
   .pmcv-hero-orbit-b{width:315px;height:315px;left:-130px;bottom:-95px;border-color:rgba(184,228,77,.20);animation:pmcvOrbitFloatB 13s ease-in-out infinite}
   .pmcv-hero-orbit-b::after{border-color:rgba(184,228,77,.13)}
   .pmcv-hero-orbit-b i{right:14%;top:17%;width:13px;height:13px;background:#d9ff61;box-shadow:0 0 0 7px rgba(217,255,97,.12),0 8px 28px rgba(163,202,57,.25);animation:pmcvOrbPulse 4.4s ease-in-out infinite reverse}
   .pmcv-hero-glow{position:absolute;display:block;border-radius:50%;filter:blur(8px);opacity:.65}
   .pmcv-hero-glow-violet{width:245px;height:245px;right:31%;top:8%;background:radial-gradient(circle,rgba(105,87,255,.20),rgba(105,87,255,0) 68%);animation:pmcvGlowDrift 9s ease-in-out infinite}
   .pmcv-hero-glow-lime{width:195px;height:195px;left:23%;bottom:4%;background:radial-gradient(circle,rgba(217,255,97,.20),rgba(217,255,97,0) 70%);animation:pmcvGlowDrift 12s ease-in-out infinite reverse}
   @keyframes pmcvOrbitFloatA{0%,100%{transform:translate3d(0,-5px,0) rotate(-5deg)}50%{transform:translate3d(-24px,16px,0) rotate(8deg)}}
   @keyframes pmcvOrbitFloatB{0%,100%{transform:translate3d(0,0,0) rotate(7deg)}50%{transform:translate3d(22px,-18px,0) rotate(-8deg)}}
   @keyframes pmcvOrbPulse{0%,100%{transform:scale(.86);opacity:.62}50%{transform:scale(1.22);opacity:1}}
   @keyframes pmcvGlowDrift{0%,100%{transform:translate3d(0,0,0) scale(.96)}50%{transform:translate3d(25px,-17px,0) scale(1.08)}}
   @media(max-width:820px){.pmcv-hero-orbit-a{width:430px;height:430px;right:-230px;top:42%}.pmcv-hero-orbit-b{width:250px;height:250px;left:-150px}.pmcv-hero-glow-violet{right:-20px}.pmcv-hero-glow-lime{left:4%}}
   @media(prefers-reduced-motion:reduce){.pmcv-hero-orbit,.pmcv-hero-orbit i,.pmcv-hero-glow{animation:none!important}}
  `}</style>
 </>
}
