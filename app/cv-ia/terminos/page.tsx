import type { Metadata } from 'next'

const icon='/postula-mejor-favicon.svg'
export const metadata: Metadata = {
  metadataBase:new URL('https://postulamejor.com'),
  title: {absolute:'Términos | Postulá Mejor'},
  description: 'Condiciones de uso de cuentas, empleos, Trabajos Flex, diagnósticos y herramientas de Postulá Mejor.',
  applicationName:'Postulá Mejor',
  robots: { index: false, follow: true },
  icons:{icon:[{url:icon,type:'image/svg+xml',sizes:'any'}],shortcut:icon,apple:icon},
  openGraph:{siteName:'Postulá Mejor',title:'Términos | Postulá Mejor'},
}

const box: React.CSSProperties={maxWidth:820,margin:'0 auto',padding:'40px 18px 80px',fontFamily:'Inter,system-ui,sans-serif',color:'#15171a',lineHeight:1.6}
const h2: React.CSSProperties={fontSize:22,letterSpacing:'-.03em',marginTop:34}
const p: React.CSSProperties={fontSize:14,color:'#555c66'}

export default function TermsPage(){
 return <main style={{background:'#fff',minHeight:'100vh'}}><article style={box}>
  <a href="/" style={{color:'#5b49df',fontWeight:800,textDecoration:'none'}}>← Postulá Mejor</a>
  <h1 style={{fontSize:42,lineHeight:1,letterSpacing:'-.055em',margin:'26px 0 12px'}}>Términos de uso</h1>
  <p style={p}>Versión vigente: 21 de agosto de 2026.</p>
  <p style={p}>Postulá Mejor es un producto digital de Llena Group, operado por Gabriel Alejandro Granvillano, CUIT 20-38422407-6. Al crear una cuenta, procesar un CV, postularte, publicar un empleo o utilizar Trabajos Flex aceptás estos Términos y la Política de Privacidad vigente.</p>

  <h2 style={h2}>Qué ofrecemos</h2>
  <p style={p}>Postulá Mejor ofrece herramientas para explorar empleos y tareas puntuales, administrar postulaciones, comunicarse entre candidatos y empleadores y mejorar la presentación laboral. Según el flujo y plan elegido, también puede analizar un CV, compararlo con una oferta, brindar Orientación Laboral, generar una versión mejorada del CV, textos para LinkedIn, mensajes de postulación, preparación para entrevistas, adaptaciones por búsqueda y un tablero de seguimiento.</p>

  <h2 style={h2}>Orientación laboral</h2>
  <p style={p}>La Orientación Laboral ayuda a explorar puestos que podrían ser compatibles con la experiencia declarada en el CV, alternativas de transición y aspectos a reforzar. Es una herramienta orientativa basada en la información aportada por el usuario. No reemplaza asesoramiento profesional individual ni garantiza que un puesto recomendado sea ofrecido, resulte adecuado o derive en contratación.</p>

  <h2 style={h2}>No garantizamos entrevistas ni contratación</h2>
  <p style={p}>Las puntuaciones, porcentajes de compatibilidad, diagnósticos y recomendaciones son estimaciones del sistema. Cada empresa puede utilizar criterios y procesos diferentes. Postulá Mejor no garantiza entrevistas, ofertas de trabajo, salarios, resultados de selección, acuerdos de Trabajo Flex ni contrataciones.</p>

  <h2 style={h2}>Información verdadera y control factual</h2>
  <p style={p}>El servicio está diseñado para mejorar la presentación de información real, no para fabricar antecedentes. Los generadores pagos trabajan sobre hechos extraídos del CV y aplican un control adicional para detectar afirmaciones no respaldadas. Aun así, el usuario debe revisar el documento final antes de enviarlo y confirmar que fechas, cargos, estudios, habilidades y demás información representen correctamente su trayectoria.</p>

  <h2 style={h2}>Cuentas, autoridad y credenciales</h2>
  <p style={p}>El titular de una cuenta es responsable de mantener la confidencialidad de sus credenciales, utilizar un email al que tenga acceso y mantener actualizados sus datos. Si una persona actúa en nombre de una empresa, comercio, organización o tercero, declara contar con autorización suficiente para hacerlo. Si detectás un acceso que no reconocés, comunicate con nosotros y cambiá tu contraseña.</p>

  <h2 style={h2}>Responsabilidad de quien publica</h2>
  <p style={p}>Quien publica un empleo, un Trabajo Flex, un perfil de empresa u otro contenido declara ser titular o representante autorizado de la cuenta, que la información es verdadera y que cuenta con facultades para realizar la publicación. La cuenta publicadora es responsable por la legalidad del contenido, las condiciones ofrecidas, el cumplimiento laboral, fiscal, contractual, de seguridad e higiene, habilitaciones y cualquier obligación aplicable a su actividad o al acuerdo que celebre con terceros.</p>
  <p style={p}>PostulaMejor.com facilita infraestructura tecnológica de publicación, descubrimiento, contacto y moderación. Puede revisar, limitar, pausar o retirar contenido cuando detecte riesgos o incumplimientos, pero esa moderación no sustituye las obligaciones legales de candidatos, empleadores, empresas o usuarios que publican y no implica que la plataforma sea parte de los contratos o acuerdos que esas personas celebren entre sí.</p>

  <h2 style={h2}>Empleos y procesos de selección</h2>
  <p style={p}>La empresa o cuenta empleadora debe publicar condiciones reales y criterios vinculados al puesto. No puede utilizar requisitos discriminatorios ni pedir información sensible que no resulte legítimamente necesaria. La existencia de una publicación en Postulá Mejor no constituye validación de solvencia, habilitaciones, cumplimiento laboral o conveniencia de la contratación. Cada parte debe realizar las verificaciones razonables que correspondan antes de avanzar.</p>

  <h2 style={h2}>Trabajos Flex</h2>
  <p style={p}>Trabajos Flex está destinado a tareas puntuales. No debe utilizarse para encubrir una relación laboral cuando por la modalidad, dependencia, continuidad u otras circunstancias corresponda otra figura jurídica. Quien publica debe indicar con claridad tarea, zona, fecha u horario cuando aplique, duración estimada, pago o forma de cálculo y cualquier requisito de seguridad relevante. Las partes deben acordar alcance, forma de pago y condiciones antes de comenzar.</p>

  <h2 style={h2}>Publicaciones y conductas prohibidas</h2>
  <p style={p}>No se permiten ofertas o tareas ilegales, discriminatorias, fraudulentas, engañosas o manifiestamente inseguras; estafas, esquemas piramidales o de inversión engañosa; suplantación de identidad; acoso, explotación o captación abusiva; pedidos de contraseñas o credenciales bancarias; cobros previos injustificados; solicitudes de documentación sensible sin una finalidad legítima; actividades que requieran habilitaciones, protecciones o permisos que no se cumplan; ni publicaciones que oculten una relación laboral bajo la apariencia de una tarea ocasional.</p>

  <h2 style={h2}>Mensajes y contacto entre usuarios</h2>
  <p style={p}>Los mensajes sirven para coordinar procesos de selección o tareas. No compartas contraseñas, códigos de autenticación, claves bancarias ni documentación sensible sin una razón legítima y un canal adecuado. Podemos aplicar medidas de seguridad y moderación ante reportes, indicios de fraude o abuso.</p>

  <h2 style={h2}>Notificaciones</h2>
  <p style={p}>Las alertas dentro de la plataforma pueden utilizarse para informar mensajes, cambios en una postulación, entrevistas, seguridad de la cuenta u otros eventos operativos. Las notificaciones del navegador o dispositivo requieren autorización expresa del usuario y pueden desactivarse desde la configuración de la cuenta o desde el propio navegador. Algunas comunicaciones estrictamente necesarias para seguridad, acceso o funcionamiento del servicio pueden no ser optativas.</p>

  <h2 style={h2}>Dos análisis gratuitos</h2>
  <p style={p}>Una sesión gratuita puede realizar hasta dos análisis de CV, ya sea mediante una búsqueda concreta u Orientación Laboral. El límite existe para evitar abuso y consumo automatizado. Intentar evadirlo mediante automatización, múltiples sesiones artificiales u otros mecanismos puede provocar el bloqueo del acceso gratuito.</p>

  <h2 style={h2}>CV Pro</h2>
  <p style={p}>CV Pro tiene un precio de lanzamiento de ARS 8.900 como pago único. Incluye el diagnóstico disponible para la candidatura, una versión optimizada del CV, adaptación al objetivo trabajado, mensaje de postulación, paquete de textos para LinkedIn y preparación de entrevista. El usuario puede elegir entre diseños disponibles y, si quiere conservar una foto, cargarla de forma voluntaria. La optimización de LinkedIn entrega textos listos para copiar y no implica que Postulá Mejor ingrese ni modifique la cuenta del usuario.</p>

  <h2 style={h2}>Búsqueda Activa</h2>
  <p style={p}>Búsqueda Activa tiene un precio de lanzamiento de ARS 12.900 y una vigencia de 30 días desde su activación. Incluye CV Pro más hasta 10 búsquedas analizadas y adaptadas, preparación específica de entrevista y tablero de seguimiento. Para conservar el tablero y volver desde otros dispositivos se requiere una cuenta.</p>

  <h2 style={h2}>Pagos y activación</h2>
  <p style={p}>Los pagos se procesan mediante Mercado Pago. El plan se habilita únicamente cuando el servidor puede verificar la operación correspondiente como aprobada, por el importe y moneda esperados. Si el proveedor informa un pago pendiente, rechazado, cancelado o revertido, el acceso puede permanecer pendiente, no activarse o ser ajustado según corresponda.</p>

  <h2 style={h2}>Disponibilidad y controles de calidad</h2>
  <p style={p}>Los planes pagos incluyen controles automáticos destinados a reducir afirmaciones no respaldadas y redacción de baja calidad. Si una generación no supera esos controles, el sistema puede corregirla automáticamente, pedir un nuevo intento o frenar la entrega. Como cualquier servicio conectado a Internet, puede requerir mantenimiento o sufrir interrupciones temporales; procuramos restaurar la operación y no entregar resultados dudosos.</p>

  <h2 style={h2}>Uso permitido</h2>
  <p style={p}>No está permitido automatizar cargas masivas, revender accesos sin autorización, intentar vulnerar límites o controles, crear identidades o antecedentes falsos, acceder a datos de otras personas, manipular pagos, interferir con la seguridad, explotar fallas o usar el servicio de una forma que perjudique a terceros.</p>

  <h2 style={h2}>Privacidad y consentimiento</h2>
  <p style={p}>Al crear una cuenta y en determinados flujos de publicación solicitamos aceptación expresa de estos Términos y de la Política de Privacidad. El tratamiento de CV, foto opcional, cuenta, email, diagnósticos, postulaciones, publicaciones y mensajes se describe en esa política. Si no aceptás las condiciones vigentes, no debés utilizar los flujos que requieren esa aceptación.</p>

  <h2 style={h2}>Cambios del servicio</h2>
  <p style={p}>Podemos mejorar diseños, modelos, flujos y funcionalidades. Si un cambio afecta de manera sustancial las condiciones de un servicio ya comprado, procuraremos respetar lo contratado durante su vigencia o brindar una alternativa razonable. Cuando una modificación de términos requiera una nueva aceptación, podremos solicitarla antes de permitir determinadas acciones.</p>

  <h2 style={h2}>Contacto</h2>
  <p style={p}>Para consultas vinculadas con una compra, acceso a la cuenta, privacidad, publicaciones o funcionamiento del servicio podés comunicarte por nuestro canal de atención.</p>
  <a href="https://wa.me/5491140540970?text=Hola%2C%20quiero%20hacer%20una%20consulta%20sobre%20Postul%C3%A1%20Mejor." target="_blank" rel="noopener noreferrer" style={{display:'inline-block',marginTop:8,background:'#15171a',color:'#fff',padding:'12px 16px',borderRadius:12,textDecoration:'none',fontWeight:850}}>Contactar</a>
 </article></main>
}
