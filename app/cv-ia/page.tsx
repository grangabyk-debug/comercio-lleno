import type {Metadata} from 'next'
import CvIaExperience from './CvIaExperience'
import CvRealChangeShowcase from './CvRealChangeShowcase'
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
import DesignPreferenceBridge from './DesignPreferenceBridge'
import FlexPlanBenefitsBridge from '../postula-preview/FlexPlanBenefitsBridge'
import {PlatformFooter,PlatformHeader,MobileNav} from '../postula-preview/PlatformChrome'
import './postula-mejor-polish.css'
import './postula-flow-v2.css'
import './ats-offer.css'
import './landing-refinement-v2.css'
import './cv-unified-v8.css'
import './cv-visual-v9.css'
import './cv-polish-v10.css'
import './cv-real-change-v11.css'
import './cv-page-unified-v12.css'

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

const filterCss=`
.pmcv-modern-filter-section [class*="filterGrid"]{gap:18px!important}.pmcv-modern-filter-card{position:relative!important;overflow:hidden!important;min-height:220px!important;padding:26px!important;border:1px solid #e5e7eb!important;border-radius:24px!important;background:linear-gradient(145deg,#fff 0%,#fbfbfd 100%)!important;box-shadow:0 16px 42px rgba(17,24,39,.07)!important;transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease!important}.pmcv-modern-filter-card::before{content:"";position:absolute;left:0;right:0;top:0;height:4px}.pmcv-modern-filter-card::after{content:"";position:absolute;width:150px;height:150px;right:-58px;bottom:-68px;border-radius:50%;background:radial-gradient(circle,rgba(108,92,255,.11),transparent 68%);pointer-events:none}.pmcv-modern-filter-card:hover{transform:translateY(-4px)!important;box-shadow:0 24px 58px rgba(17,24,39,.11)!important;border-color:#d8dbe3!important}.pmcv-modern-filter-card>span{position:relative!important;z-index:1!important;width:auto!important;height:auto!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;margin:0 0 30px!important;padding:7px 10px!important;border-radius:999px!important;font-size:10px!important;line-height:1!important;font-weight:900!important;letter-spacing:.12em!important}.pmcv-modern-filter-card>b{position:relative;z-index:1;display:block!important;margin:0 0 10px!important;color:#111827!important;font-size:25px!important;line-height:1.05!important;letter-spacing:-.035em!important}.pmcv-modern-filter-card>p{position:relative;z-index:1;margin:0!important;color:#5f6875!important;font-size:14px!important;line-height:1.65!important}.pmcv-modern-filter-1::before{background:linear-gradient(90deg,#ff694a,#ff9c68)}.pmcv-modern-filter-1>span{background:#fff1ec!important;color:#e4502f!important}.pmcv-modern-filter-2::before{background:linear-gradient(90deg,#6957ff,#9a8cff)}.pmcv-modern-filter-2>span{background:#f0edff!important;color:#5d4be8!important}.pmcv-modern-filter-3::before{background:linear-gradient(90deg,#18a45f,#78d7a1)}.pmcv-modern-filter-3>span{background:#eaf9f0!important;color:#12874d!important}@media(max-width:820px){.pmcv-modern-filter-section [class*="filterGrid"]{grid-template-columns:1fr!important}.pmcv-modern-filter-card{min-height:0!important;padding:22px!important}.pmcv-modern-filter-card>span{margin-bottom:22px!important}.pmcv-modern-filter-card>b{font-size:22px!important}}`
const filterScript=`(()=>{if(window.__pmCvFilters)return;window.__pmCvFilters=true;const labels=['Filtro ATS','Reclutador','Responsable de área'];const decorate=()=>{const h=[...document.querySelectorAll('h2')].find(x=>(x.textContent||'').includes('Tu CV visto desde tres lugares distintos'));const s=h&&h.closest('section');if(!s)return false;s.classList.add('pmcv-modern-filter-section');[...s.querySelectorAll('article')].slice(0,3).forEach((c,i)=>{c.classList.add('pmcv-modern-filter-card','pmcv-modern-filter-'+(i+1));const b=c.querySelector('b');if(b&&b.textContent!==labels[i])b.textContent=labels[i]});return true};const start=()=>{if(decorate())return;const observer=new MutationObserver(()=>{if(decorate())observer.disconnect()});observer.observe(document.body,{childList:true,subtree:true});setTimeout(()=>observer.disconnect(),5000)};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start()})()`

export default function CvIaPage(){return <main className="pmcv-page pm7-page"><PlatformHeader/><CvRealChangeShowcase/><div className="pmcv-shell"><CvIaExperience/></div><FreeCareerTools/><ConsentBridge/><OrientationBridge/><CheckoutBridge/><PhotoPreserveBridge/><DesignPreferenceBridge/><FirstCvBridge/><FunnelBridge/><CommentPolicyBridge/><AtsBridge/><OwnerTestBridge/><CvUnifiedBridge/><FlexPlanBenefitsBridge/><style dangerouslySetInnerHTML={{__html:filterCss}}/><script dangerouslySetInnerHTML={{__html:filterScript}}/><PlatformFooter/><MobileNav active="cv"/></main>}
