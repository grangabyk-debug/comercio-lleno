import type { Metadata, Viewport } from 'next'
import FirstCvClient from './FirstCvClient'

export const viewport:Viewport={width:'device-width',initialScale:1,maximumScale:5}

export const metadata:Metadata={
  metadataBase:new URL('https://postulamejor.com'),
  title:{absolute:'Armar mi primer CV gratis | Postulá Mejor'},
  description:'Creá tu primer currículum paso a paso, incluso si todavía no tenés experiencia formal. Gratis y listo para analizar en Postulá Mejor.',
  applicationName:'Postulá Mejor',
  alternates:{canonical:'https://postulamejor.com/primer-cv'},
  icons:{icon:[{url:'/postula-mejor-favicon.svg',type:'image/svg+xml',sizes:'any'}],shortcut:'/postula-mejor-favicon.svg',apple:'/postula-mejor-favicon.svg'},
  openGraph:{siteName:'Postulá Mejor',type:'website',locale:'es_AR',url:'https://postulamejor.com/primer-cv',title:'Armar mi primer CV gratis | Postulá Mejor',description:'Una guía paso a paso para crear un CV honesto incluso sin experiencia formal y llevarlo directo al analizador.'},
}

export default function FirstCvPage(){return <div className="firstCvPageScope">
  <a className="firstCvMobileBack" href="/" aria-label="Volver a Postulá Mejor">← Volver</a>
  <style>{`
    .firstCvMobileBack{display:none}
    @media(max-width:600px){
      html,body{max-width:100%;overflow-x:hidden}
      .firstCvPageScope{width:100%;max-width:100vw;overflow-x:hidden}
      .firstCvPageScope .firstCvMobileBack{
        display:inline-flex;align-items:center;justify-content:center;position:fixed;left:10px;top:14px;z-index:80;
        min-height:34px;padding:0 10px;border:1px solid rgba(105,87,255,.22);border-radius:999px;
        background:rgba(255,255,255,.94);box-shadow:0 6px 20px rgba(37,28,110,.12);backdrop-filter:blur(12px);
        color:#24212f;text-decoration:none;font:800 12px/1 Inter,system-ui,sans-serif;white-space:nowrap
      }
      .firstCvPageScope main{width:100%;max-width:100vw;overflow-x:hidden}
      .firstCvPageScope main>header{width:100%;max-width:100vw;box-sizing:border-box}
      .firstCvPageScope main>div{
        display:block!important;width:100%!important;max-width:100vw!important;min-width:0!important;box-sizing:border-box!important
      }
      .firstCvPageScope main>div>aside,
      .firstCvPageScope main>div>section{
        width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important
      }
      .firstCvPageScope main>div>aside{overflow:hidden!important}
      .firstCvPageScope main>div>aside>div{
        display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px!important;
        width:100%!important;max-width:100%!important;overflow:visible!important
      }
      .firstCvPageScope main>div>aside>div>button{
        width:100%!important;max-width:100%!important;min-width:0!important;margin:0!important;box-sizing:border-box!important
      }
      .firstCvPageScope main>div>aside>div>button span,
      .firstCvPageScope main>div>aside>div>button strong,
      .firstCvPageScope main>div>aside>div>button small{min-width:0;overflow-wrap:anywhere}
      .firstCvPageScope main>div>section,
      .firstCvPageScope main>div>section *{box-sizing:border-box;min-width:0}
      .firstCvPageScope main>div>section>div,
      .firstCvPageScope main>div>section article,
      .firstCvPageScope main>div>section form,
      .firstCvPageScope main>div>section label,
      .firstCvPageScope main>div>section input,
      .firstCvPageScope main>div>section textarea,
      .firstCvPageScope main>div>section button{
        max-width:100%
      }
      .firstCvPageScope main>div>section input,
      .firstCvPageScope main>div>section textarea{width:100%!important}
      .firstCvPageScope main>div>section article{width:100%!important;overflow-wrap:anywhere}
      .firstCvPageScope main>div>section p,
      .firstCvPageScope main>div>section li,
      .firstCvPageScope main>div>section h1,
      .firstCvPageScope main>div>section h2,
      .firstCvPageScope main>div>section h3{overflow-wrap:anywhere}
      .firstCvPageScope>aside{max-width:100vw!important;margin:-48px auto 30px!important;padding:0 10px!important;box-sizing:border-box}
    }
    @media(max-width:360px){
      .firstCvPageScope main>div>aside>div{grid-template-columns:1fr!important}
      .firstCvPageScope .firstCvMobileBack{left:7px;padding:0 8px;font-size:11px}
    }
  `}</style>
  <FirstCvClient/>
  <aside style={{maxWidth:1240,margin:'-58px auto 46px',padding:'0 18px',fontFamily:'Inter,system-ui,sans-serif'}}><div style={{border:'1px solid #d9dde2',background:'rgba(255,255,255,.82)',borderRadius:18,padding:'16px 18px',fontSize:12.5,lineHeight:1.65,color:'#363c44',boxShadow:'0 10px 30px rgba(17,19,24,.05)'}}><b style={{color:'#17191d',fontSize:13}}>Privacidad de tu primer CV.</b> Los datos que escribís acá no se guardan en nuestros servidores ni se incorporan a una memoria de IA. El borrador permanece localmente en este navegador para que no pierdas el progreso; sólo se envía al analizador de Postulá Mejor si vos tocás “Analizar y mejorar este CV gratis”.</div></aside>
</div>}
