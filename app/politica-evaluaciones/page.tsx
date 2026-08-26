import type {Metadata} from 'next'
import Link from 'next/link'
import {PlatformFooter,PlatformHeader} from '../postula-preview/PlatformChrome'
import '../postula-preview/premium-v7.css'
import styles from '../legal.module.css'

export const metadata:Metadata={
 title:{absolute:'Política de evaluaciones y señales verificadas | Postulá Mejor'},
 description:'Reglas de Postulá Mejor para evaluaciones entre personas y empresas: contratación verificada, plazo de 10 días, réplica, indicador y protección de datos.',
 robots:{index:true,follow:true},
 alternates:{canonical:'https://postulamejor.com/politica-evaluaciones'},
 openGraph:{title:'Política de evaluaciones y señales verificadas | Postulá Mejor',description:'Cómo funcionan las evaluaciones laborales verificadas y qué protecciones existen para ambas partes.',url:'https://postulamejor.com/politica-evaluaciones'},
}

export default function EvaluationPolicy(){return <><PlatformHeader/><main className={styles.page}><div className={styles.shell}><div className={styles.top}><Link className={styles.back} href="/empresas">← Volver a Postulá Mejor Empresas</Link></div><article className={styles.card}>
  <span className={styles.eyebrow}>POSTULÁ MEJOR · CONFIANZA Y EVALUACIONES</span>
  <h1>Cómo funcionan las calificaciones laborales</h1>
  <div className={styles.updated}>Versión vigente desde el 26 de agosto de 2026.</div>
  <p className={styles.notice}>Las evaluaciones aportan contexto sobre experiencias laborales reales. No crean antecedentes privados, listas negras ni una sentencia sobre una persona o empresa. La decisión de contratar o postularse sigue siendo humana.</p>

  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10,margin:'24px 0'}}>
   <div style={{padding:16,borderRadius:16,background:'#f5f6ff',border:'1px solid #e1defe'}}><small style={{fontWeight:900,color:'#6554df'}}>01 · CONTRATACIÓN</small><b style={{display:'block',marginTop:7}}>Primero se confirma el vínculo.</b><p style={{margin:'6px 0 0',fontSize:13,lineHeight:1.45}}>La opción de calificar aparece recién cuando la empresa marca a la persona como contratada.</p></div>
   <div style={{padding:16,borderRadius:16,background:'#f7fafb',border:'1px solid #e2e7ea'}}><small style={{fontWeight:900,color:'#53616d'}}>02 · 10 DÍAS</small><b style={{display:'block',marginTop:7}}>Ambas partes pueden evaluar y responder.</b><p style={{margin:'6px 0 0',fontSize:13,lineHeight:1.45}}>Durante diez días se puede crear o modificar la evaluación y dejar una observación sobre la evaluación recibida.</p></div>
   <div style={{padding:16,borderRadius:16,background:'#efffdf',border:'1px solid #d9efbf'}}><small style={{fontWeight:900,color:'#567b17'}}>03 · CIERRE</small><b style={{display:'block',marginTop:7}}>Al vencer el plazo queda finalizada.</b><p style={{margin:'6px 0 0',fontSize:13,lineHeight:1.45}}>Después de los diez días ya no se puede editar ni responder. Recién entonces la evaluación puede computar en el indicador.</p></div>
  </div>
  <div style={{display:'flex',flexWrap:'wrap',gap:9,alignItems:'center',padding:'14px 16px',borderRadius:16,background:'#111d2b',color:'#fff',margin:'0 0 26px'}}><span style={{fontSize:11,fontWeight:900,color:'#d9ff59'}}>EJEMPLOS DEL INDICADOR</span><span style={{padding:'6px 9px',borderRadius:999,background:'rgba(255,255,255,.1)',fontSize:11,fontWeight:800}}>Indicador en formación · 2/3</span><span style={{padding:'6px 9px',borderRadius:999,background:'#d9ff59',color:'#17220a',fontSize:11,fontWeight:900}}>★ 4,7 · Favorable · 8 experiencias</span></div>

  <h2>1. Principio general</h2>
  <p>Una evaluación representa la experiencia de una de las partes dentro de un vínculo determinado. No certifica la conducta general de una persona o empresa, no sustituye referencias formales y no debe interpretarse como una garantía de desempeño futuro.</p>

  <h2>2. Cuándo se habilita una evaluación</h2>
  <p>En Postulá Mejor la evaluación laboral se habilita cuando una empresa confirma dentro de la plataforma que contrató a un postulante. Ese evento vincula a ambas partes con la misma experiencia y abre el plazo de evaluación.</p>
  <p>Como regla de integridad, cada parte puede emitir una sola evaluación por vínculo, aunque puede modificarla mientras el plazo continúe abierto. Se pueden aplicar controles adicionales para detectar cuentas relacionadas, evaluaciones coordinadas, fraude, presión, incentivos o manipulación.</p>

  <h2>3. Diez días, evaluación bilateral y derecho a réplica</h2>
  <p>Empresa y trabajador disponen de diez días contados desde la confirmación de la contratación. Dentro de ese período cada parte puede calificar de 1 a 5, escribir una observación laboral, modificar su propia evaluación y responder u observar la evaluación que reciba de la contraparte.</p>
  <p>Cuando una parte evalúa o responde, la otra recibe una notificación. Al vencer los diez días la experiencia queda cerrada: las evaluaciones y respuestas existentes ya no pueden modificarse ni agregarse desde el flujo normal.</p>

  <h2>4. Qué criterios se utilizan</h2>
  <p>Las señales se concentran en aspectos relacionados con la experiencia concreta y razonablemente verificables. Para una persona pueden incluir cumplimiento de lo acordado, comunicación, colaboración profesional y organización. Para una empresa pueden incluir claridad de condiciones, cumplimiento de pagos o acuerdos, trato, comunicación y organización.</p>
  <p>No deben utilizarse como criterios de evaluación datos sensibles ni características ajenas al desempeño o a las condiciones de la relación.</p>

  <h2>5. Texto, observaciones y contenido público</h2>
  <p>Las calificaciones, comentarios y respuestas completas quedan disponibles para las partes involucradas en esa experiencia. El indicador público utiliza únicamente el resultado agregado de experiencias finalizadas; no publica automáticamente acusaciones, textos libres ni respuestas personales.</p>
  <p>No se permite utilizar una evaluación para insultos, amenazas, hostigamiento, datos privados, datos sensibles, imputaciones delictivas, acusaciones de ilegalidad o afirmaciones sobre terceros identificables. Los hechos graves deben comunicarse mediante soporte o a las autoridades competentes según corresponda.</p>

  <h2>6. Cómo se forma el indicador</h2>
  <p>Con menos de tres experiencias finalizadas se muestra “Indicador en formación” y el progreso hacia el mínimo, por ejemplo “2/3”. Las evaluaciones que todavía están dentro de los diez días no se computan.</p>
  <p>Desde tres experiencias cerradas, el promedio agregado se traduce en una señal simple: <strong>Favorable</strong> desde 4,0; <strong>Mixto</strong> desde 3,0 y por debajo de 4,0; y <strong>Desfavorable</strong> por debajo de 3,0. La interfaz muestra también la cantidad de experiencias que sostienen esa señal.</p>

  <h2>7. No es una decisión automática de contratación</h2>
  <p>Las señales de experiencia no deben funcionar como única base automática para contratar, rechazar, bloquear o excluir a una persona. Se mantienen separadas del análisis de compatibilidad con una búsqueda y la decisión final corresponde a personas responsables del proceso.</p>
  <p>Postulá Mejor puede restringir usos que transformen la señal en una lista negra, un mecanismo de persecución, una herramienta discriminatoria o un sistema de exclusión contrario a la finalidad informada.</p>

  <h2>8. Revisión, impugnación y corrección</h2>
  <p>Durante los diez días cada parte dispone de la observación o respuesta prevista en el propio flujo. Además, una persona o empresa puede solicitar revisión por soporte cuando considere que una evaluación no corresponde al vínculo, proviene de una cuenta no autorizada, contiene un dato objetivo incorrecto o infringe estas reglas.</p>
  <p>Una revisión por integridad o seguridad es distinta del plazo ordinario de edición. Postulá Mejor puede marcar, limitar temporalmente o dejar de computar una señal cuando existan razones fundadas, incluso después del cierre, sin que eso implique garantizar la eliminación de toda opinión negativa.</p>

  <h2>9. Protección de datos personales</h2>
  <p>Las evaluaciones, los vínculos asociados y los resúmenes que puedan identificar a una persona son datos personales y se tratan conforme a la normativa argentina aplicable y a la <Link href="/privacidad">Política de Privacidad</Link>. Se aplican principios de finalidad, pertinencia, calidad, seguridad y conservación razonable.</p>
  <p>Las personas pueden ejercer los derechos de acceso, actualización, rectificación o supresión que correspondan conforme a la Ley 25.326 y normativa complementaria. Cuando una solicitud requiera verificar identidad o existan razones legales para conservar cierta información, se aplicará el procedimiento correspondiente.</p>

  <h2>10. Dignidad, reputación y no discriminación</h2>
  <p>La plataforma debe operar respetando la dignidad, intimidad, honor, reputación e identidad de las personas. No se admiten evaluaciones basadas en motivos discriminatorios ni criterios relacionados con origen racial o étnico, religión, opiniones políticas o gremiales, salud, vida sexual u otros datos sensibles protegidos.</p>
  <p>La Ley 23.592 y las normas aplicables contra la discriminación continúan plenamente vigentes. Ninguna funcionalidad de Postulá Mejor autoriza prácticas de selección discriminatorias.</p>

  <h2>11. Moderación e integridad</h2>
  <p>Postulá Mejor puede revisar, limitar, ocultar o eliminar señales cuando existan indicios razonables de fraude, suplantación, conflicto de interés, extorsión, pago o beneficio a cambio de una evaluación, presión, contenido abusivo, datos privados, irrelevancia o incumplimiento de esta política y de los Términos.</p>
  <p>Los controles pueden combinar reglas automáticas y revisión humana. Las herramientas automáticas son auxiliares y pueden requerir revisión cuando su resultado afecte materialmente a una persona.</p>

  <h2>12. Alcance de la plataforma</h2>
  <p>Postulá Mejor facilita la recolección y presentación contextual de señales dentro del servicio. No garantiza que una evaluación sea una descripción completa de la relación ni asume como propia la opinión emitida por cada usuario. Sin perjuicio de ello, la plataforma mantiene reglas de integridad, moderación y revisión para reducir abusos y tratar reclamos razonables.</p>

  <h2>13. Cambios de esta política</h2>
  <p>Esta política puede actualizarse cuando cambie la función, la normativa, los criterios o los mecanismos de protección. La versión vigente y su fecha se publicarán en esta página. Los cambios materiales podrán comunicarse además dentro del servicio.</p>

  <div className={styles.footer}>Consultá también los <Link href="/terminos">Términos y Condiciones</Link>, la <Link href="/privacidad">Política de Privacidad</Link> y el <Link href="/legales">Centro legal y de seguridad</Link>.</div>
 </article></div></main><PlatformFooter/></>}
