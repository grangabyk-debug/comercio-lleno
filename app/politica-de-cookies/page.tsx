import Link from 'next/link'

export const metadata={title:'Política de cookies | Comercio Lleno',description:'Información sobre el uso de cookies y tecnologías similares en Comercio Lleno.'}

export default function CookiePolicyPage(){
  return <main style={{fontFamily:'Inter,system-ui,sans-serif',maxWidth:860,margin:'0 auto',padding:'56px 24px 80px',color:'#111314',lineHeight:1.65}}>
    <Link href="/" style={{display:'inline-block',marginBottom:36,color:'#147a50',fontWeight:800,textDecoration:'none'}}>← Volver a Comercio Lleno</Link>
    <p style={{fontSize:11,fontWeight:900,letterSpacing:'.16em',color:'#168054'}}>PRIVACIDAD</p>
    <h1 style={{fontSize:'clamp(42px,7vw,72px)',lineHeight:.98,letterSpacing:'-.045em',margin:'10px 0 24px'}}>Política de cookies</h1>
    <p style={{fontSize:18,color:'#5f6661'}}>Esta política explica qué cookies y tecnologías similares puede utilizar comerciolleno.com y para qué las usamos.</p>

    <section style={{marginTop:44}}>
      <h2>Cookies necesarias</h2>
      <p>Son las que permiten funciones básicas del sitio, seguridad, inicio de sesión y preferencias esenciales. No se desactivan desde el panel de consentimiento porque son necesarias para prestar el servicio.</p>
    </section>
    <section style={{marginTop:32}}>
      <h2>Analítica</h2>
      <p>Si das tu consentimiento, podemos utilizar Microsoft Clarity para comprender de forma agregada cómo se usa el sitio y detectar problemas de experiencia. Esta categoría es opcional.</p>
    </section>
    <section style={{marginTop:32}}>
      <h2>Marketing</h2>
      <p>Si das tu consentimiento, podemos utilizar Google Ads para medir el rendimiento de campañas publicitarias y atribuir conversiones. Esta categoría también es opcional.</p>
    </section>
    <section style={{marginTop:32}}>
      <h2>Cambiar tu elección</h2>
      <p>Podés modificar tus preferencias en cualquier momento desde el enlace “Configurar cookies” disponible en el pie del sitio. También podés borrar las cookies desde la configuración de tu navegador.</p>
    </section>
    <section style={{marginTop:32}}>
      <h2>Más información</h2>
      <p>Para conocer cómo tratamos los datos personales, consultá nuestra <Link href="/politica-de-privacidad" style={{color:'#147a50'}}>Política de privacidad</Link>.</p>
    </section>
    <p style={{marginTop:48,fontSize:12,color:'#7a817c'}}>Última actualización: 15 de agosto de 2026.</p>
  </main>
}
