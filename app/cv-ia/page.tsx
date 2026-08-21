import type {Metadata} from 'next'
import CvIaExperience from './CvIaExperience'
import OwnerTestBridge from './OwnerTestBridge'
import ConsentBridge from './ConsentBridge'
import OrientationBridge from './OrientationBridge'
import CheckoutBridge from './CheckoutBridge'
import FunnelBridge from './FunnelBridge'
import PhotoPreserveBridge from './PhotoPreserveBridge'
import FreeCareerTools from './FreeCareerTools'
import FirstCvBridge from './FirstCvBridge'
import CommentPolicyBridge from './CommentPolicyBridge'
import AtsBridge from './AtsBridge'
import CvUnifiedBridge from './CvUnifiedBridge'
import FlexPlanBenefitsBridge from '../postula-preview/FlexPlanBenefitsBridge'
import {PlatformFooter,PlatformHeader,MobileNav} from '../postula-preview/PlatformChrome'
import './postula-mejor-polish.css'
import './postula-flow-v2.css'
import './ats-offer.css'
import './landing-refinement-v2.css'
import './cv-unified-v8.css'
import './cv-visual-v9.css'
import './cv-polish-v10.css'

export const metadata:Metadata={
 metadataBase:new URL('https://postulamejor.com'),
 title:{absolute:'Mejorar mi CV | ATS y CV Pro+ · Postulá Mejor'},
 description:'Analizá tu CV gratis, revisá compatibilidad ATS y prepará versiones adaptadas a búsquedas reales sin inventar experiencia.',
 applicationName:'Postulá Mejor',
 alternates:{canonical:'https://postulamejor.com/mejorar-cv'},
 robots:{index:true,follow:true},
 openGraph:{title:'Mejorar mi CV | ATS y CV Pro+ · Postulá Mejor',description:'Analizá tu CV gratis, revisá compatibilidad ATS y prepará versiones adaptadas a búsquedas reales sin inventar experiencia.',url:'https://postulamejor.com/mejorar-cv',siteName:'Postulá Mejor',type:'website',locale:'es_AR'},
 twitter:{card:'summary',title:'Mejorar mi CV | ATS y CV Pro+ · Postulá Mejor',description:'Analizá tu CV gratis, revisá compatibilidad ATS y prepará versiones adaptadas a búsquedas reales sin inventar experiencia.'},
 icons:{icon:[{url:'/postula-mejor-favicon.svg',type:'image/svg+xml',sizes:'any'}],shortcut:'/postula-mejor-favicon.svg',apple:'/postula-mejor-favicon.svg'},
}
export const revalidate=300
export default function CvIaPage(){return <main className="pmcv-page pm7-page"><PlatformHeader/><div className="pmcv-shell"><CvIaExperience/></div><FreeCareerTools/><ConsentBridge/><OrientationBridge/><CheckoutBridge/><PhotoPreserveBridge/><FirstCvBridge/><FunnelBridge/><CommentPolicyBridge/><AtsBridge/><OwnerTestBridge/><CvUnifiedBridge/><FlexPlanBenefitsBridge/><PlatformFooter/><MobileNav active="cv"/></main>}
