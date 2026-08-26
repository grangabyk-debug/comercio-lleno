import type {Metadata} from 'next'
import Link from 'next/link'
import {PlatformFooter,PlatformHeader} from '../postula-preview/PlatformChrome'
import '../postula-preview/premium-v7.css'
import styles from '../legal.module.css'

export const metadata:Metadata={
  title:{absolute:'Política de evaluaciones y señales verificadas | Postulá Mejor'},
  description:'Reglas de Postulá Mejor para evaluaciones entre personas y empresas: vínculo verificable, criterios, moderación, revisión y protección de datos.',
  robots:{index:true,follow:true},
  alternates:{canonical:'https://postulamejor.com/politica-evaluaciones'},
  openGraph:{title:'Política de evaluaciones y señales verificadas | Postulá Mejor',description:'Cómo funcionan las evaluaciones laborales verificadas y qué protecciones existen para ambas partes.',url:'https://postulamejor.com/politica-evaluaciones'},
}

export default function EvaluationPolicy(){return <><PlatformHeader/><main className={styles.page}><div className={styles.shell}><div className={styles.top}><Link className={styles.back} href="/empresas">← Volver a Postulá Mejor Empresas</Link></div><article className={styles.card}>
  <span className={styles.eyebrow}>POSTULÁ MEJOR · CONFIANZA Y EVALUACIONES</span>
  <h1>Política de evaluaciones y señales verificadas</h1>
  <div className={styles.updated}>Versión vigente desde el 26 de agosto de 2026.</div>
  <p className={styles.notice}>Las evaluaciones buscan aportar contexto sobre experiencias laborales reales, no crear antecedentes privados, listas negras ni una calificación definitiva sobre una persona o empresa. Esta política complementa los Términos y la Política de Privacidad.</p>

  <h2>1. Principio general</h2>
  <p>Una evaluación representa la experiencia de una de las partes dentro de un vínculo determinado. No certifica la conducta general de una persona o empresa, no sustituye referencias formales y no debe interpretarse como una garantía de desempeño futuro.</p>

  <h2>2. Vínculo verificable</h2>
  <p>La plataforma procura habilitar evaluaciones únicamente cuando exista evidencia suficiente para asociar a ambas partes con una misma relación u oportunidad laboral. Una relación habilitada no implica que Postulá Mejor certifique todos los hechos ocurridos fuera de la plataforma.</p>
  <p>Como regla de integridad, cada parte puede emitir una sola evaluación por vínculo. Se pueden aplicar controles adicionales para detectar cuentas relacionadas, evaluaciones coordinadas, fraude, presión, incentivos o manipulación.</p>

  <h2>3. Evaluación bilateral y publicación diferida</h2>
  <p>Cuando la función esté habilitada, empleador y trabajador tendrán la misma posibilidad de evaluar. Para reducir represalias, la evaluación de una parte puede permanecer oculta hasta que la otra haya enviado la suya o hasta que finalice el plazo informado para evaluar.</p>

  <h2>4. Qué criterios se utilizan</h2>
  <p>Las señales visibles se concentran en aspectos relacionados con la experiencia concreta y razonablemente verificables. Para una persona pueden incluir cumplimiento de lo acordado, comunicación, colaboración profesional y organización. Para una empresa pueden incluir claridad de condiciones, cumplimiento de pagos o acuerdos, trato y comunicación y organización.</p>
  <p>Los criterios pueden modificarse para mejorar calidad, pertinencia o seguridad. No deben utilizarse como criterios de evaluación datos sensibles ni características ajenas al desempeño o a las condiciones de la relación.</p>

  <h2>5. Sin acusaciones abiertas en la señal pública</h2>
  <p>Postulá Mejor prioriza formularios estructurados para la señal visible y puede limitar o excluir texto libre público. No se permite utilizar una evaluación para publicar insultos, amenazas, hostigamiento, datos privados, datos sensibles, imputaciones delictivas, acusaciones de ilegalidad o afirmaciones sobre terceros identificables.</p>
  <p>Los hechos graves, denuncias de fraude, discriminación, violencia, delitos o incumplimientos legales deben comunicarse mediante los canales de soporte o a las autoridades competentes según corresponda. El sistema de reputación no reemplaza esos procedimientos.</p>

  <h2>6. Cómo se muestra una señal</h2>
  <p>Una muestra demasiado pequeña puede presentarse como “señal en formación” sin destacar un promedio numérico. Cuando exista suficiente historial, la interfaz puede mostrar un resumen por criterios, la cantidad de evaluaciones y el número de vínculos verificados que sirven de contexto.</p>
  <p>Postulá Mejor puede modificar umbrales, fórmulas y forma de presentación para reducir interpretaciones engañosas, manipulación o efectos desproporcionados. Si se utiliza un promedio, debe acompañarse de contexto suficiente para comprender su alcance.</p>

  <h2>7. No es una decisión automática de contratación</h2>
  <p>Las señales de experiencia no deben funcionar como única base automática para contratar, rechazar, bloquear o excluir a una persona. Se mantienen separadas del análisis de compatibilidad con una búsqueda y la decisión final corresponde a personas responsables del proceso.</p>
  <p>Postulá Mejor puede restringir usos que transformen la señal en una lista negra, un mecanismo de persecución, una herramienta discriminatoria o un sistema de exclusión contrario a la finalidad informada.</p>

  <h2>8. Revisión, impugnación y corrección</h2>
  <p>La persona o empresa afectada puede solicitar revisión cuando considere que una evaluación no corresponde al vínculo, contiene información incorrecta, proviene de una cuenta no autorizada o infringe estas reglas. Durante una revisión, Postulá Mejor puede marcar, limitar temporalmente o dejar de computar una señal cuando resulte razonable.</p>
  <p>La revisión de una evaluación no garantiza que toda opinión negativa sea eliminada. Se analizará la integridad del vínculo, el cumplimiento de las reglas, la exactitud de datos objetivos cuando pueda verificarse y los derechos de las partes.</p>

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
