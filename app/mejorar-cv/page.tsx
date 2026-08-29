import type {Metadata} from 'next'
import CvAccountGate from './CvAccountGate'
import CandidatePlanOnly from './CandidatePlanOnly'
import CvIaExperience from '../cv-ia/CvIaExperience'
import CvRealChangeShowcase from '../cv-ia/CvRealChangeShowcase'
import OwnerTestBridge from '../cv-ia/OwnerTestBridge'
import ConsentBridge from '../cv-ia/ConsentBridge'
import OrientationBridge from '../cv-ia/OrientationBridge'
import CheckoutBridge from '../cv-ia/CheckoutBridge'
import FunnelBridge from '../cv-ia/FunnelBridge'
import PhotoPreserveBridge from '../cv-ia/PhotoPreserveBridge'
import FreeCareerTools from '../cv-ia/FreeCareerTools'
import FirstCvBridge from '../cv-ia/FirstCvBridge'
import CommentPolicyBridge from '../cv-ia/CommentPolicyBridge'
import AtsBridge from '../cv-ia/AtsBridge'
import DesignPreferenceBridge from '../cv-ia/DesignPreferenceBridge'
import {PlatformFooter,PlatformHeader,MobileNav} from '../postula-preview/PlatformChrome'
import '../cv-ia/postula-mejor-polish.css'
import '../cv-ia/postula-flow-v2.css'
import '../cv-ia/ats-offer.css'
import '../cv-ia/landing-refinement-v2.css'
import '../cv-ia/cv-unified-v8.css'
import '../cv-ia/cv-visual-v9.css'
import '../cv-ia/cv-polish-v10.css'
import '../cv-ia/cv-real-change-v11.css'
import '../cv-ia/cv-page-unified-v12.css'

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

const stableCss=`
.pmcv-shell{padding-top:34px!important;padding-bottom:54px!important}
.pmcv-shell>main>section:not(:first-of-type):not([class*="workspace"]){margin:14px auto!important;border-radius:25px!important}
.pmcv-shell [class*="plansGrid"]{max-width:620px!important;margin-left:auto!important;margin-right:auto!important}
@media(max-width:560px){.pmcv-shell{padding-top:22px!important;padding-bottom:38px!important}}
`

export default function MejorarCvPage(){
 return <main className="pmcv-page pm7-page">
  <CvAccountGate/>
  <CandidatePlanOnly/>
  <PlatformHeader/>
  <CvRealChangeShowcase/>
  <div className="pmcv-shell"><CvIaExperience/></div>
  <FreeCareerTools/>
  <ConsentBridge/>
  <OrientationBridge/>
  <CheckoutBridge/>
  <PhotoPreserveBridge/>
  <DesignPreferenceBridge/>
  <FirstCvBridge/>
  <FunnelBridge/>
  <CommentPolicyBridge/>
  <AtsBridge/>
  <OwnerTestBridge/>
  <style dangerouslySetInnerHTML={{__html:stableCss}}/>
  <PlatformFooter/>
  <MobileNav active="cv"/>
 </main>
}
