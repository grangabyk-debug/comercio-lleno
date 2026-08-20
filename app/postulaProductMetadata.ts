import type {Metadata} from 'next'

const favicon='/postula-mejor-favicon.svg'

export const postulaProductMetadata:Metadata={
  metadataBase:new URL('https://postulamejor.com'),
  title:{default:'Postulá Mejor',template:'%s'},
  applicationName:'Postulá Mejor',
  icons:{
    icon:[{url:favicon,type:'image/svg+xml',sizes:'any'}],
    shortcut:favicon,
    apple:favicon,
  },
  openGraph:{siteName:'Postulá Mejor',locale:'es_AR',type:'website'},
}
