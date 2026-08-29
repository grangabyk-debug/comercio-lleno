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
const densityCss=`
.pmcv-shell{padding-top:34px!important;padding-bottom:54px!important}
.pmcv-shell>main>section:not(:first-of-type):not([class*="workspace"]){margin:14px auto!important;border-radius:25px!important}
.pmcv-shell [class*="section"],.pmcv-shell [class*="sectionPaper"]{padding:38px 30px!important}
.pmcv-shell [class*="sectionPaper"]{background:radial-gradient(circle at 92% 12%,rgba(105,87,255,.075),transparent 24%),linear-gradient(145deg,#fff,#f8f7ff)!important}
.pmcv-shell [class*="sectionIntro"]{max-width:1060px!important;margin:0 auto 22px!important;display:grid!important;grid-template-columns:auto minmax(0,1fr)!important;column-gap:18px!important;row-gap:7px!important;align-items:start!important}
.pmcv-shell [class*="sectionIntro"]>[class*="sectionTag"],.pmcv-shell [class*="resultTag"]{width:auto!important;height:auto!important;min-width:0!important;min-height:0!important;max-width:none!important;aspect-ratio:auto!important;border-radius:999px!important;padding:8px 11px!important;margin:5px 0 0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;align-self:start!important;font-size:9px!important;line-height:1!important;letter-spacing:.11em!important;font-weight:950!important;background:#eeeaff!important;color:#5542df!important;box-shadow:0 8px 20px rgba(105,87,255,.08)!important}
.pmcv-shell [class*="sectionIntro"] h2{grid-column:2!important;margin:0!important;max-width:780px!important;font-size:clamp(30px,3.7vw,45px)!important;line-height:.98!important;letter-spacing:-.052em!important;text-wrap:balance}
.pmcv-shell [class*="sectionIntro"] p{grid-column:2!important;margin:3px 0 0!important;max-width:760px!important;font-size:12.5px!important;line-height:1.55!important;color:#6c7480!important}
.pmcv-shell [class*="plansGrid"]{max-width:920px!important;gap:13px!important;margin-left:auto!important;margin-right:auto!important}
.pmcv-shell [class*="plan"]{min-height:0!important;padding:19px!important;border-radius:20px!important;background:linear-gradient(160deg,#fff 0%,#fbfaff 100%)!important;transition:transform .2s ease,box-shadow .2s ease!important}
.pmcv-shell [class*="plan"]:hover{transform:translateY(-3px)!important;box-shadow:0 20px 44px rgba(48,39,95,.09)!important}
.pmcv-shell [class*="planHighlight"]{transform:translateY(-4px)!important;background:linear-gradient(160deg,#fff 0%,#f5f1ff 100%)!important}
.pmcv-shell [class*="planHighlight"]:hover{transform:translateY(-7px)!important}
.pmcv-shell [class*="planBadge"]{width:auto!important;height:auto!important;min-width:0!important;min-height:0!important;border-radius:999px!important;padding:6px 8px!important;display:inline-flex!important;align-self:flex-start!important;background:#f0edff!important;color:#5946df!important;font-size:8px!important;line-height:1!important}
.pmcv-shell [class*="plan"] h3{font-size:22px!important;margin:10px 0 3px!important}
.pmcv-shell [class*="price"]{padding-bottom:12px!important}
.pmcv-shell [class*="price"] strong{font-size:30px!important}
.pmcv-shell [class*="plan"] ul{margin:13px 0!important;gap:7px!important}
.pmcv-shell [class*="plan"] li{font-size:10.5px!important}
.pmcv-shell [class*="plan"] button{padding:12px 13px!important;border-radius:12px!important}
.pmcv-shell [class*="communityGrid"]{display:grid!important;grid-template-columns:minmax(0,1.08fr) minmax(330px,.92fr)!important;gap:14px!important;max-width:1060px!important;margin:0 auto!important;align-items:start!important}
.pmcv-shell [class*="commentsList"]{min-height:250px!important;border:1px solid #e4e1ee!important;border-radius:20px!important;background:linear-gradient(145deg,#fff,#faf9ff)!important;padding:16px!important;box-shadow:0 12px 28px rgba(43,36,86,.045)!important}
.pmcv-shell [class*="emptyComments"]{min-height:210px!important;display:grid!important;place-items:center!important;text-align:center!important;padding:24px!important;border:1px dashed #d8d2f4!important;border-radius:16px!important;background:radial-gradient(circle at 50% 0,rgba(105,87,255,.08),transparent 42%),#fff!important;color:#737a86!important;font-size:11px!important;line-height:1.55!important}
.pmcv-shell [class*="commentForm"]{border:1px solid #ded9ee!important;border-radius:20px!important;background:linear-gradient(160deg,#f6f3ff,#fff)!important;padding:18px!important;box-shadow:0 14px 32px rgba(42,34,86,.055)!important}
.pmcv-shell [class*="commentForm"]>b{font-size:18px!important;letter-spacing:-.025em!important}
.pmcv-shell [class*="commentForm"]>p{font-size:10px!important;line-height:1.45!important;color:#737a86!important}
.pmcv-shell [class*="commentForm"] input,.pmcv-shell [class*="commentForm"] textarea{border:1px solid #ddd9ea!important;border-radius:12px!important;background:#fff!important;padding:11px 12px!important;outline:none!important}
.pmcv-shell [class*="commentForm"] input:focus,.pmcv-shell [class*="commentForm"] textarea:focus{border-color:#6957ff!important;box-shadow:0 0 0 3px rgba(105,87,255,.08)!important}
.pmcv-shell [class*="commentForm"]>button[type="submit"]{border:0!important;border-radius:12px!important;background:#191a20!important;color:#fff!important;padding:12px!important;font-weight:850!important}
.pmcv-shell [class*="compareCard"]{border-radius:18px!important}
.pmcv-shell [class*="filterCard"]{min-height:145px!important;padding:18px!important}
.pmcv-shell [class*="filterCard"] b{margin-top:20px!important}
.pmcv-page [class*="finalCta"]{padding:38px 30px!important;margin-top:15px!important}
.pmcv-page [class*="finalCta"] h2{font-size:clamp(29px,4vw,45px)!important;line-height:1!important;max-width:900px!important;margin-bottom:10px!important}
@media(min-width:860px){.pmcv-shell [class*="plansGrid"]{grid-template-columns:repeat(2,minmax(0,1fr))!important}.pmcv-shell [class*="filterGrid"]{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
@media(max-width:859px){.pmcv-shell{padding-top:24px!important}.pmcv-shell [class*="section"],.pmcv-shell [class*="sectionPaper"]{padding:32px 18px!important}.pmcv-shell [class*="sectionIntro"]{display:block!important;margin-bottom:18px!important}.pmcv-shell [class*="sectionIntro"]>[class*="sectionTag"]{margin:0 0 12px!important}.pmcv-shell [class*="sectionIntro"] h2{font-size:clamp(29px,8vw,40px)!important}.pmcv-shell [class*="sectionIntro"] p{margin-top:9px!important}.pmcv-shell [class*="communityGrid"]{grid-template-columns:1fr!important}.pmcv-shell [class*="commentsList"]{min-height:0!important}.pmcv-shell [class*="emptyComments"]{min-height:150px!important}.pmcv-shell [class*="planHighlight"]{transform:none!important}.pmcv-shell [class*="planHighlight"]:hover{transform:translateY(-3px)!important}}
@media(max-width:560px){.pmcv-shell{padding-bottom:38px!important}.pmcv-shell>main>section:not(:first-of-type):not([class*="workspace"]){margin:10px auto!important;border-radius:20px!important}.pmcv-shell [class*="section"],.pmcv-shell [class*="sectionPaper"]{padding:26px 15px!important}.pmcv-shell [class*="sectionIntro"] h2{font-size:30px!important}.pmcv-page [class*="finalCta"]{padding:30px 20px!important}}
`

export default function CvIaPage(){return <main className="pmcv-page pm7-page"><PlatformHeader/><CvRealChangeShowcase/><div className="pmcv-shell"><CvIaExperience/></div><FreeCareerTools/><ConsentBridge/><OrientationBridge/><CheckoutBridge/><PhotoPreserveBridge/><DesignPreferenceBridge/><FirstCvBridge/><FunnelBridge/><CommentPolicyBridge/><AtsBridge/><OwnerTestBridge/><CvUnifiedBridge/><FlexPlanBenefitsBridge/><style dangerouslySetInnerHTML={{__html:filterCss}}/><style dangerouslySetInnerHTML={{__html:densityCss}}/><script dangerouslySetInnerHTML={{__html:filterScript}}/><PlatformFooter/><MobileNav active="cv"/></main>}
