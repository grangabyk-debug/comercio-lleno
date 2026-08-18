import type { Metadata } from 'next'

const icon='/postula-mejor-favicon.svg'
export const metadata: Metadata = {
  metadataBase:new URL('https://postulamejor.com'),
  title: {absolute:'Términos | Postulá Mejor'},
  description: 'Condiciones de uso de los diagnósticos, orientación laboral y planes de Postulá Mejor.',
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
  <p style={p}>Versión vigente: 18 de agosto de 2026.</p>
  <p style={p}>Postulá Mejor es un producto digital de Llena Group, operado por Gabriel Alejandro Granvillano, CUIT 20-38422407-6. Al solicitar el procesamiento de un CV aceptás estos Términos y la Política de Privacidad vigente.</p>

  <h2 style={h2}>Qué ofrecemos</h2>
  <p style={p}>Postulá Mejor ofrece herramientas de apoyo para candidaturas laborales. Según el flujo y plan elegido, puede analizar un CV, compararlo con una oferta, brindar Orientación Laboral, generar una versión mejorada del CV, textos para LinkedIn, mensajes de postulación, preparación para entrevistas, adaptaciones por búsqueda y un tablero de seguimiento.</p>

  <h2 style={h2}>Orientación laboral</h2>
  <p style={p}>La Orientación Laboral ayuda a explorar puestos que podrían ser compatibles con la experiencia declarada en el CV, alternativas de transición y aspectos a reforzar. Es una herramienta orientativa basada en la información aportada por el usuario. No reemplaza asesoramiento profesional individual ni garantiza que un puesto recomendado sea ofrecido, resulte adecuado o derive en contratación.</p>

  <h2 style={h2}>No garantizamos entrevistas ni contratación</h2>
  <p style={p}>Las puntuaciones, porcentajes de compatibilidad, diagnósticos y recomendaciones son estimaciones del sistema. Cada empresa puede utilizar criterios y procesos diferentes. Postulá Mejor no garantiza entrevistas, ofertas de trabajo, salarios, resultados de selección ni contrataciones.</p>

  <h2 style={h2}>Información verdadera y control factual</h2>
  <p style={p}>El servicio está diseñado para mejorar la presentación de información real, no para fabricar antecedentes. Los generadores pagos trabajan sobre hechos extraídos del CV y aplican un control adicional para detectar afirmaciones no respaldadas. Aun así, el usuario debe revisar el documento final antes de enviarlo y confirmar que fechas, cargos, estudios, habilidades y demás información representen correctamente su trayectoria.</p>

  <h2 style={h2}>Dos análisis gratuitos</h2>
  <p style={p}>Una sesión gratuita puede realizar hasta dos análisis de CV, ya sea mediante una búsqueda concreta u Orientación Laboral. El límite existe para evitar abuso y consumo automatizado. Intentar evadirlo mediante automatización, múltiples sesiones artificiales u otros mecanismos puede provocar el bloqueo del acceso gratuito.</p>

  <h2 style={h2}>CV Pro</h2>
  <p style={p}>CV Pro tiene un precio de lanzamiento de ARS 8.900 como pago único. Incluye el diagnóstico disponible para la candidatura, una versión optimizada del CV, adaptación al objetivo trabajado, mensaje de postulación, paquete de textos para LinkedIn y preparación de entrevista. El usuario puede elegir entre diseños disponibles y, si quiere conservar una foto, cargarla de forma voluntaria. La optimización de LinkedIn entrega textos listos para copiar y no implica que Postulá Mejor ingrese ni modifique la cuenta del usuario.</p>

  <h2 style={h2}>Búsqueda Activa</h2>
  <p style={p}>Búsqueda Activa tiene un precio de lanzamiento de ARS 12.900 y una vigencia de 30 días desde su activación. Incluye CV Pro más hasta 10 búsquedas analizadas y adaptadas, preparación específica de entrevista y tablero de seguimiento. Para conservar el tablero y volver desde otros dispositivos se requiere una cuenta.</p>

  <h2 style={h2}>Cuentas y credenciales</h2>
  <p style={p}>El usuario es responsable de mantener la confidencialidad de sus credenciales y de utilizar un email al que tenga acceso. Para vincular una candidatura o compra podemos exigir que el email de la cuenta coincida con el informado durante el pago. Si detectás un acceso que no reconocés, comunicate con nosotros y cambiá tu contraseña.</p>

  <h2 style={h2}>Pagos y activación</h2>
  <p style={p}>Los pagos se procesan mediante Mercado Pago. El plan se habilita únicamente cuando el servidor puede verificar la operación correspondiente como aprobada, por el importe y moneda esperados. Si el proveedor informa un pago pendiente, rechazado, cancelado o revertido, el acceso puede permanecer pendiente, no activarse o ser ajustado según corresponda.</p>

  <h2 style={h2}>Disponibilidad y controles de calidad</h2>
  <p style={p}>Los planes pagos incluyen controles automáticos destinados a reducir afirmaciones no respaldadas y redacción de baja calidad. Si una generación no supera esos controles, el sistema puede corregirla automáticamente, pedir un nuevo intento o frenar la entrega. Como cualquier servicio conectado a Internet, puede requerir mantenimiento o sufrir interrupciones temporales; procuramos restaurar la operación y no entregar resultados dudosos.</p>

  <h2 style={h2}>Uso permitido</h2>
  <p style={p}>No está permitido automatizar cargas masivas, revender accesos sin autorización, intentar vulnerar límites o controles, crear identidades o antecedentes falsos, acceder a datos de otras personas, manipular pagos, interferir con la seguridad, explotar fallas o usar el servicio de una forma que perjudique a terceros.</p>

  <h2 style={h2}>Privacidad y consentimiento</h2>
  <p style={p}>Antes de procesar un CV solicitamos la aceptación de estos Términos y de la Política de Privacidad. El tratamiento de CV, foto opcional, cuenta, email, diagnósticos y postulaciones se describe en esa política. Si no aceptás las condiciones vigentes, no debés enviar el CV para procesamiento.</p>

  <h2 style={h2}>Cambios del servicio</h2>
  <p style={p}>Podemos mejorar diseños, modelos, flujos y funcionalidades. Si un cambio afecta de manera sustancial las condiciones de un servicio ya comprado, procuraremos respetar lo contratado durante su vigencia o brindar una alternativa razonable.</p>

  <h2 style={h2}>Contacto</h2>
  <p style={p}>Para consultas vinculadas con una compra, acceso a la cuenta, privacidad o funcionamiento del servicio podés comunicarte por nuestro canal de atención.</p>
  <a href="https://wa.me/5491140540970?text=Hola%2C%20quiero%20hacer%20una%20consulta%20sobre%20Postul%C3%A1%20Mejor." target="_blank" rel="noopener noreferrer" style={{display:'inline-block',marginTop:8,background:'#15171a',color:'#fff',padding:'12px 16px',borderRadius:12,textDecoration:'none',fontWeight:850}}>Contactar</a>
 </article></main>
}
