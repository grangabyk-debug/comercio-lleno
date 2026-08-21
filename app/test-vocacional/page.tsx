import type { Metadata } from 'next'
import VocationalTestClient from './VocationalTestClient'
import VocationalCertificate from './VocationalCertificate'
import './test-polish-v2.css'

export const metadata:Metadata={
  metadataBase:new URL('https://postulamejor.com'),
  title:{absolute:'Test de intereses vocacionales y laborales gratis | Postulá Mejor'},
  description:'Descubrí áreas de trabajo que pueden encajar con tus intereses con un test gratuito basado en el modelo RIASEC. Resultado inmediato y conexión con tu primer CV.',
  applicationName:'Postulá Mejor',
  alternates:{canonical:'https://postulamejor.com/test-vocacional'},
  icons:{icon:[{url:'/postula-mejor-favicon.svg',type:'image/svg+xml',sizes:'any'}],shortcut:'/postula-mejor-favicon.svg',apple:'/postula-mejor-favicon.svg'},
  openGraph:{siteName:'Postulá Mejor',type:'website',locale:'es_AR',url:'https://postulamejor.com/test-vocacional',title:'Test de intereses vocacionales y laborales gratis | Postulá Mejor',description:'30 situaciones para explorar tus intereses laborales con el marco RIASEC y convertir el resultado en un primer CV.'},
}

export default function VocationalTestPage(){return <><VocationalTestClient/><VocationalCertificate/><footer style={{maxWidth:1040,margin:'-42px auto 45px',padding:'0 18px',fontFamily:'Inter,system-ui,sans-serif',fontSize:12,lineHeight:1.65,color:'#5b626b'}}><b style={{color:'#30353c'}}>Base metodológica:</b> esta experiencia es una adaptación orientativa propia del marco RIASEC/Holland. El O*NET Interest Profiler utiliza ese mismo marco y cuenta con investigación psicométrica publicada por O*NET con participación de investigadores de University of Illinois. <a href="https://www.onetcenter.org/reports/IP_Manual.html" target="_blank" rel="noreferrer" style={{color:'#4d3fd2',fontWeight:850}}>Manual O*NET</a> · <a href="https://www.onetcenter.org/reports/IP_RVS.html" target="_blank" rel="noreferrer" style={{color:'#4d3fd2',fontWeight:850}}>Confiabilidad y validez</a></footer></>}
