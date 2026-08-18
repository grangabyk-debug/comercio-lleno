import type { Metadata } from 'next'

const icon='/postula-mejor-favicon.svg'
export const metadata: Metadata = {
  metadataBase:new URL('https://postulamejor.com'),
  title: {absolute:'Privacidad | Postulá Mejor'},
  description: 'Cómo Postulá Mejor trata la información usada para analizar, orientar y mejorar candidaturas laborales.',
  applicationName:'Postulá Mejor',
  robots: { index: false, follow: true },
  icons:{icon:[{url:icon,type:'image/svg+xml',sizes:'any'}],shortcut:icon,apple:icon},
  openGraph:{siteName:'Postulá Mejor',title:'Privacidad | Postulá Mejor'},
}

const box: React.CSSProperties={maxWidth:820,margin:'0 auto',padding:'40px 18px 80px',fontFamily:'Inter,system-ui,sans-serif',color:'#15171a',lineHeight:1.6}
const h2: React.CSSProperties={fontSize:22,letterSpacing:'-.03em',marginTop:34}
const p: React.CSSProperties={fontSize:14,color:'#555c66'}
const note:React.CSSProperties={...p,background:'#f5f4ff',border:'1px solid #e6e2ff',borderRadius:14,padding:'13px 15px'}

export default function PrivacyPage(){
 return <main style={{background:'#fff',minHeight:'100vh'}}><article style={box}>
  <a href="/" style={{color:'#5b49df',fontWeight:800,textDecoration:'none'}}>← Postulá Mejor</a>
  <h1 style={{fontSize:42,lineHeight:1,letterSpacing:'-.055em',margin:'26px 0 12px'}}>Privacidad y tratamiento de la información</h1>
  <p style={p}>Versión vigente: 18 de agosto de 2026.</p>
  <p style={p}>Postulá Mejor es un producto digital de Llena Group, operado por Gabriel Alejandro Granvillano, CUIT 20-38422407-6. Esta política explica qué información usamos y con qué finalidad cuando pedís un diagnóstico, orientación laboral, CV Pro o Búsqueda Activa.</p>
  <p style={note}><b>Antes de procesar un CV registramos tu aceptación de los Términos y de esta Política de Privacidad.</b> El registro incluye la versión aceptada, fecha y hora, y referencias técnicas protegidas para poder acreditar el consentimiento.</p>

  <h2 style={h2}>Qué información procesamos</h2>
  <p style={p}>Podés cargar un CV y, según el modo elegido, indicar un puesto, pegar una oferta laboral o pedir Orientación Laboral sin definir un objetivo. Del documento extraemos información profesional que ya esté presente: experiencia, formación, habilidades, idiomas, certificaciones, datos de contacto y otros hechos útiles para la candidatura. También podemos conservar diagnósticos, recomendaciones, CV generados, textos para LinkedIn, preparación de entrevistas, postulaciones y estados del tablero.</p>

  <h2 style={h2}>Orientación laboral</h2>
  <p style={p}>Si elegís Orientación Laboral, el sistema usa exclusivamente la información obtenida de tu CV y, si la aportás, una oferta opcional. Las recomendaciones de puestos, transiciones posibles y mejoras son orientativas y se generan para ayudarte a explorar alternativas; no constituyen una garantía de empleabilidad ni una evaluación profesional definitiva.</p>

  <h2 style={h2}>Archivo original del CV</h2>
  <p style={p}>El PDF, DOC, DOCX o TXT se utiliza para extraer la información necesaria para prestar el servicio. Postulá Mejor no lo persiste como archivo original dentro de su base de CV IA. Sí podemos conservar los hechos profesionales estructurados, el diagnóstico y los materiales generados para mantener la continuidad del servicio y evitar que tengas que empezar de cero.</p>

  <h2 style={h2}>Foto del CV</h2>
  <p style={p}>Si querés conservar una foto en CV Pro, la cargás de forma separada y voluntaria. La almacenamos en un espacio privado para poder incluirla en los diseños que elijas. No intentamos reutilizar una foto detectada automáticamente dentro del documento original. Podés pedir su eliminación junto con el resto de tus datos.</p>

  <h2 style={h2}>Cuentas y acceso</h2>
  <p style={p}>CV Pro puede asociarse al email informado durante la compra. Para Búsqueda Activa se requiere una cuenta porque necesitamos conservar el tablero y permitirte volver desde otro dispositivo. La autenticación se gestiona mediante Supabase Auth; Postulá Mejor no almacena tu contraseña en texto legible. Cuando vinculás una compra a una cuenta, podemos exigir que el email coincida con el utilizado en la compra para evitar accesos indebidos.</p>

  <h2 style={h2}>Para qué usamos la información</h2>
  <p style={p}>La usamos para entregar los análisis solicitados, generar y adaptar materiales, controlar que el sistema no agregue antecedentes no respaldados, recordar tus preferencias de diseño, mantener el tablero, operar cuentas y pagos, prevenir abuso, resolver soporte y mejorar el funcionamiento del producto a partir de métricas técnicas y feedback.</p>

  <h2 style={h2}>Inteligencia artificial y proveedores</h2>
  <p style={p}>Para operar el servicio usamos infraestructura de Vercel y Supabase, modelos de OpenAI para análisis y generación, y Mercado Pago para procesar pagos. El contenido necesario puede ser enviado a estos proveedores para ejecutar la función solicitada. Cada proveedor trata la información técnica necesaria para prestar su servicio según sus propias condiciones y políticas.</p>

  <h2 style={h2}>Pagos</h2>
  <p style={p}>No almacenamos los datos completos de tu tarjeta. Mercado Pago gestiona el checkout. Nosotros conservamos la información necesaria para identificar la orden, email asociado, plan, importe, estado y referencias del pago necesarias para habilitar el servicio y atender reclamos.</p>

  <h2 style={h2}>Comentarios públicos</h2>
  <p style={p}>Si dejás un comentario y se publica, puede mostrarse junto con el nombre y área o puesto que hayas indicado. No publiques teléfono, email, domicilio ni otros datos sensibles. Podemos moderar comentarios para evitar spam, información privada o contenido engañoso.</p>

  <h2 style={h2}>Seguridad y minimización</h2>
  <p style={p}>Las tablas internas de CV IA no se exponen para lectura directa desde el navegador; las operaciones sensibles pasan por funciones de servidor, las sesiones usan identificadores opacos, los permisos de propietario se validan en servidor y las fotos se guardan en almacenamiento privado. También aplicamos límites de uso y controles para reducir abuso. Ningún sistema conectado a Internet puede prometer riesgo cero, por lo que revisamos y endurecemos estas medidas de forma periódica.</p>

  <h2 style={h2}>Cuánto tiempo conservamos la información</h2>
  <p style={p}>Conservamos la información mientras sea necesaria para prestar el plan, permitirte volver a tu cuenta, resolver una compra, mantener el historial que hayas solicitado o cumplir obligaciones operativas. Podemos eliminar o anonimizar información que deje de ser necesaria. Si pedís eliminación, verificaremos tu identidad antes de ejecutar la solicitud cuando corresponda.</p>

  <h2 style={h2}>Consultas, acceso o eliminación</h2>
  <p style={p}>Podés consultarnos por la información asociada a tu uso, pedir correcciones o solicitar la eliminación de tu cuenta y datos vinculados. Algunas referencias de una transacción pueden necesitar conservarse durante el plazo exigido para obligaciones contables, fiscales o resolución de controversias.</p>
  <a href="https://wa.me/5491140540970?text=Hola%2C%20quiero%20hacer%20una%20consulta%20de%20privacidad%20sobre%20Postul%C3%A1%20Mejor." target="_blank" rel="noopener noreferrer" style={{display:'inline-block',marginTop:8,background:'#15171a',color:'#fff',padding:'12px 16px',borderRadius:12,textDecoration:'none',fontWeight:850}}>Contactar por privacidad</a>
 </article></main>
}
