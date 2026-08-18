import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacidad | Postulá Mejor',
  description: 'Cómo Postulá Mejor trata la información usada para analizar y mejorar candidaturas laborales.',
  robots: { index: false, follow: true },
}

const box: React.CSSProperties={maxWidth:820,margin:'0 auto',padding:'40px 18px 80px',fontFamily:'Inter,system-ui,sans-serif',color:'#15171a',lineHeight:1.6}
const h2: React.CSSProperties={fontSize:22,letterSpacing:'-.03em',marginTop:34}
const p: React.CSSProperties={fontSize:14,color:'#555c66'}

export default function PrivacyPage(){
 return <main style={{background:'#fff',minHeight:'100vh'}}><article style={box}>
  <a href="/" style={{color:'#5b49df',fontWeight:800,textDecoration:'none'}}>← Postulá Mejor</a>
  <h1 style={{fontSize:42,lineHeight:1,letterSpacing:'-.055em',margin:'26px 0 12px'}}>Privacidad</h1>
  <p style={p}>Última actualización: 18 de agosto de 2026.</p>
  <p style={p}>Postulá Mejor es un producto digital de Llena Group, operado por Gabriel Alejandro Granvillano, CUIT 20-38422407-6. Esta página explica de forma simple qué información usamos para prestar el servicio.</p>

  <h2 style={h2}>Qué información procesamos</h2>
  <p style={p}>Cuando hacés un diagnóstico podés cargar un CV, indicar un puesto y pegar una oferta laboral. El archivo se procesa para extraer hechos profesionales como experiencia, formación, habilidades y datos de contacto que ya estén presentes en el documento. También podemos guardar el diagnóstico, las versiones generadas, postulaciones y comentarios que decidas enviar.</p>

  <h2 style={h2}>Para qué la usamos</h2>
  <p style={p}>La usamos únicamente para entregar el diagnóstico, generar el CV y materiales contratados, adaptar candidaturas, controlar que el sistema no agregue datos no respaldados, mantener tu tablero de búsqueda y operar el servicio.</p>

  <h2 style={h2}>Archivo original</h2>
  <p style={p}>Postulá Mejor no persiste el PDF, DOC, DOCX o TXT original como archivo en su base de CV IA. El contenido se envía al motor de inteligencia artificial para poder extraer la información necesaria y luego trabajamos con los hechos estructurados resultantes.</p>

  <h2 style={h2}>Proveedores tecnológicos</h2>
  <p style={p}>Para operar el servicio utilizamos infraestructura de Vercel y Supabase, modelos de OpenAI para análisis y generación, y Mercado Pago para procesar pagos. Cada proveedor puede tratar datos técnicos necesarios para prestar su parte del servicio según sus propias condiciones y políticas.</p>

  <h2 style={h2}>Pagos</h2>
  <p style={p}>No almacenamos los datos completos de tu tarjeta. El checkout y la confirmación del pago se realizan mediante Mercado Pago. Nosotros conservamos la información necesaria para identificar la orden, su estado, importe y plan asociado.</p>

  <h2 style={h2}>Comentarios públicos</h2>
  <p style={p}>Si dejás un comentario, puede publicarse junto con el nombre y área o puesto que hayas indicado. No publiques teléfono, email, domicilio ni otros datos sensibles en el comentario.</p>

  <h2 style={h2}>Seguridad y minimización</h2>
  <p style={p}>Limitamos el acceso directo a las tablas internas, usamos identificadores opacos para las sesiones y buscamos conservar solamente la información necesaria para operar las funciones que usás.</p>

  <h2 style={h2}>Consultas o eliminación</h2>
  <p style={p}>Si necesitás consultar por tus datos o pedir que eliminemos la información asociada a tu uso de Postulá Mejor, podés comunicarte por nuestro canal de atención.</p>
  <a href="https://wa.me/5491140540970?text=Hola%2C%20quiero%20hacer%20una%20consulta%20de%20privacidad%20sobre%20Postul%C3%A1%20Mejor." target="_blank" rel="noopener noreferrer" style={{display:'inline-block',marginTop:8,background:'#15171a',color:'#fff',padding:'12px 16px',borderRadius:12,textDecoration:'none',fontWeight:850}}>Contactar</a>
 </article></main>
}
