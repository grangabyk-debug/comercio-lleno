import type { Metadata } from 'next'
import FirstCvClient from './FirstCvClient'

export const metadata:Metadata={
  metadataBase:new URL('https://postulamejor.com'),
  title:{absolute:'Armar mi primer CV gratis | Postulá Mejor'},
  description:'Creá tu primer currículum paso a paso, incluso si todavía no tenés experiencia formal. Gratis y listo para analizar en Postulá Mejor.',
  applicationName:'Postulá Mejor',
  alternates:{canonical:'https://postulamejor.com/primer-cv'},
  icons:{icon:[{url:'/postula-mejor-favicon.svg',type:'image/svg+xml',sizes:'any'}],shortcut:'/postula-mejor-favicon.svg',apple:'/postula-mejor-favicon.svg'},
  openGraph:{siteName:'Postulá Mejor',type:'website',locale:'es_AR',url:'https://postulamejor.com/primer-cv',title:'Armar mi primer CV gratis | Postulá Mejor',description:'Una guía paso a paso para crear un CV honesto incluso sin experiencia formal y llevarlo directo al analizador.'},
}
export default function FirstCvPage(){return <><FirstCvClient/><aside style={{maxWidth:1240,margin:'-58px auto 46px',padding:'0 18px',fontFamily:'Inter,system-ui,sans-serif'}}><div style={{border:'1px solid #d9dde2',background:'rgba(255,255,255,.82)',borderRadius:18,padding:'16px 18px',fontSize:12.5,lineHeight:1.65,color:'#363c44',boxShadow:'0 10px 30px rgba(17,19,24,.05)'}}><b style={{color:'#17191d',fontSize:13}}>Privacidad de tu primer CV.</b> Los datos que escribís acá no se guardan en nuestros servidores ni se incorporan a una memoria de IA. El borrador permanece localmente en este navegador para que no pierdas el progreso; sólo se envía al analizador de Postulá Mejor si vos tocás “Analizar y mejorar este CV gratis”.</div></aside></>}
