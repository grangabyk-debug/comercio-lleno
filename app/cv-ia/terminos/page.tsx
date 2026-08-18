import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos | Postulá Mejor',
  description: 'Condiciones de uso de los diagnósticos y planes de Postulá Mejor.',
  robots: { index: false, follow: true },
}

const box: React.CSSProperties={maxWidth:820,margin:'0 auto',padding:'40px 18px 80px',fontFamily:'Inter,system-ui,sans-serif',color:'#15171a',lineHeight:1.6}
const h2: React.CSSProperties={fontSize:22,letterSpacing:'-.03em',marginTop:34}
const p: React.CSSProperties={fontSize:14,color:'#555c66'}

export default function TermsPage(){
 return <main style={{background:'#fff',minHeight:'100vh'}}><article style={box}>
  <a href="/" style={{color:'#5b49df',fontWeight:800,textDecoration:'none'}}>← Postulá Mejor</a>
  <h1 style={{fontSize:42,lineHeight:1,letterSpacing:'-.055em',margin:'26px 0 12px'}}>Términos de uso</h1>
  <p style={p}>Última actualización: 18 de agosto de 2026.</p>
  <p style={p}>Postulá Mejor es un producto digital de Llena Group, operado por Gabriel Alejandro Granvillano, CUIT 20-38422407-6. Al usar el sitio aceptás estas condiciones.</p>

  <h2 style={h2}>Qué ofrecemos</h2>
  <p style={p}>El servicio analiza la presentación de una candidatura laboral y puede generar versiones mejoradas del CV, textos para LinkedIn, mensajes de postulación, preparación para entrevistas y adaptaciones a búsquedas específicas, según el plan elegido.</p>

  <h2 style={h2}>No garantizamos una contratación</h2>
  <p style={p}>Las puntuaciones, diagnósticos y recomendaciones son herramientas de orientación. Una empresa puede utilizar criterios distintos, por lo que Postulá Mejor no puede garantizar entrevistas, ofertas de trabajo ni contrataciones.</p>

  <h2 style={h2}>Información verdadera</h2>
  <p style={p}>El sistema está diseñado para mejorar la forma de presentar información real, no para inventar experiencia. El usuario es responsable de revisar la versión final antes de enviarla y de confirmar que represente correctamente su trayectoria.</p>

  <h2 style={h2}>Diagnóstico gratuito</h2>
  <p style={p}>El diagnóstico inicial incluido sin cargo está sujeto a límites de uso razonables para evitar abuso del servicio y consumo automatizado.</p>

  <h2 style={h2}>CV Pro</h2>
  <p style={p}>CV Pro tiene un precio de lanzamiento de ARS 8.900 como pago único e incluye el diagnóstico, una versión optimizada del CV, adaptación a un puesto, mensaje de postulación, paquete de textos para LinkedIn y preparación de entrevista. La optimización de LinkedIn no implica que ingresemos ni modifiquemos la cuenta del usuario.</p>

  <h2 style={h2}>Búsqueda Activa</h2>
  <p style={p}>Búsqueda Activa tiene un precio de lanzamiento de ARS 12.900, vigencia de 30 días desde su activación e incluye CV Pro más hasta 10 búsquedas analizadas, versiones específicas por empresa y puesto, preparación de entrevista y tablero de seguimiento.</p>

  <h2 style={h2}>Pagos</h2>
  <p style={p}>Los pagos se procesan mediante Mercado Pago. El plan se habilita cuando el servidor verifica que la operación correspondiente quedó aprobada por el proveedor de pagos.</p>

  <h2 style={h2}>Disponibilidad y controles de calidad</h2>
  <p style={p}>Los planes pagos incluyen controles automáticos destinados a reducir afirmaciones no respaldadas. Si una generación no supera el control factual, el sistema puede intentar corregirla o frenar la entrega para evitar entregar material dudoso. Como cualquier servicio de software, puede requerir mantenimiento o presentar interrupciones temporales.</p>

  <h2 style={h2}>Uso permitido</h2>
  <p style={p}>No está permitido automatizar cargas masivas, intentar vulnerar límites, utilizar el servicio para crear identidades o antecedentes falsos, interferir con la seguridad del sitio ni usarlo de forma que perjudique a terceros.</p>

  <h2 style={h2}>Contacto</h2>
  <p style={p}>Para consultas vinculadas con una compra o con el funcionamiento del servicio podés comunicarte por el canal de atención.</p>
  <a href="https://wa.me/5491140540970?text=Hola%2C%20quiero%20hacer%20una%20consulta%20sobre%20Postul%C3%A1%20Mejor." target="_blank" rel="noopener noreferrer" style={{display:'inline-block',marginTop:8,background:'#15171a',color:'#fff',padding:'12px 16px',borderRadius:12,textDecoration:'none',fontWeight:850}}>Contactar</a>
 </article></main>
}
