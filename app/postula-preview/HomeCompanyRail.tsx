'use client'

import Link from 'next/link'
import {useCallback,useEffect,useRef,useState} from 'react'

type CompanyCard={name:string;logo:string;count:number}

function initials(name:string){return name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()}
function domainFrom(src:string){try{return new URL(src).hostname.replace(/^www\./,'')}catch{return''}}
function companyDomain(company:CompanyCard){if(company.name.toLowerCase()==='despegar')return'despegar.com.ar';return domainFrom(company.logo)}
function googleLogo(company:CompanyCard){const domain=companyDomain(company);return domain?`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`:company.logo}
function duckLogo(company:CompanyCard){const domain=companyDomain(company);return domain?`https://icons.duckduckgo.com/ip3/${domain}.ico`:''}

const railPolish=`
.pm44-company-more{min-height:50px!important;padding:0 18px!important;border:0!important;background:linear-gradient(135deg,#5d4cff 0%,#7d5bff 58%,#a85cff 100%)!important;color:#fff!important;font-size:13px!important;font-weight:950!important;box-shadow:0 12px 28px rgba(93,76,255,.28)!important;letter-spacing:-.01em!important}.pm44-company-more span{font-size:19px!important;transition:transform .18s ease}.pm44-company-more:hover{transform:translateY(-2px)!important;box-shadow:0 16px 34px rgba(93,76,255,.36)!important}.pm44-company-more:hover span{transform:translateX(3px)}
.pm44-despegar-mark{width:36px;height:36px;border-radius:11px;background:linear-gradient(145deg,#6046ff,#8d5dff 58%,#d868ff);display:grid;place-items:center;position:relative;color:#fff;font-size:17px;font-weight:950;box-shadow:inset 0 0 0 1px rgba(255,255,255,.35),0 5px 12px rgba(96,70,255,.2)}.pm44-despegar-mark i{position:absolute;right:4px;top:3px;font-style:normal;font-size:8px;transform:rotate(-18deg)}
@media(max-width:540px){.pm44-company-more{min-height:40px!important;padding:0 12px!important;font-size:10.5px!important}}
`

export default function HomeCompanyRail({companies}:{companies:CompanyCard[]}){
 const rail=useRef<HTMLDivElement>(null)
 const [edge,setEdge]=useState({start:true,end:false})
 const updateEdges=useCallback(()=>{
  const el=rail.current;if(!el)return
  setEdge({start:el.scrollLeft<8,end:el.scrollLeft+el.clientWidth>=el.scrollWidth-8})
 },[])
 useEffect(()=>{updateEdges();const el=rail.current;if(!el)return;el.addEventListener('scroll',updateEdges,{passive:true});window.addEventListener('resize',updateEdges);return()=>{el.removeEventListener('scroll',updateEdges);window.removeEventListener('resize',updateEdges)}},[updateEdges])
 const move=(dir:number)=>{const el=rail.current;if(!el)return;el.scrollBy({left:dir*Math.max(280,el.clientWidth*.72),behavior:'smooth'})}
 return <section id="pm44-company-strip-static" className="pm44-company-strip" aria-label="Empresas con oportunidades visibles">
  <style dangerouslySetInnerHTML={{__html:railPolish}}/>
  <div className="pm44-company-strip-inner">
   <div className="pm44-company-strip-copy"><span>EMPRESAS CON AVISOS</span><b>Empresas que hoy tienen oportunidades en el catálogo</b></div>
   <div className="pm44-company-carousel">
    <button type="button" className="pm44-company-arrow" onClick={()=>move(-1)} disabled={edge.start} aria-label="Ver empresas anteriores">‹</button>
    <div className="pm44-company-list" ref={rail}>
     {companies.map(company=><Link className="pm44-company-item" href={`/empleos?empresa=${encodeURIComponent(company.name)}`} title={`Ver oportunidades de ${company.name}`} key={company.name}>
      <span className="pm44-company-logo">{company.name.toLowerCase()==='despegar'?<span className="pm44-despegar-mark" aria-label="Despegar"><span>D</span><i>✈</i></span>:<><img src={googleLogo(company)} alt={`Logo de ${company.name}`} loading="eager" referrerPolicy="no-referrer" data-source={company.logo} onError={event=>{const img=event.currentTarget;if(!img.dataset.duck){const fallback=duckLogo(company);if(fallback){img.dataset.duck='1';img.src=fallback;return}}img.style.display='none';const badge=img.nextElementSibling as HTMLElement|null;if(badge)badge.style.display='flex'}}/><b>{initials(company.name)}</b></>}</span>
      <span className="pm44-company-name">{company.name}<small>{company.count===1?'1 aviso':`${company.count} avisos`}</small></span>
     </Link>)}
    </div>
    <button type="button" className="pm44-company-arrow" onClick={()=>move(1)} disabled={edge.end} aria-label="Ver más empresas">›</button>
   </div>
   <Link className="pm44-company-more" href="/empleos">Ver empleos <span>→</span></Link>
   <p className="pm44-company-note"><b>Aclaración:</b> estas marcas aparecen porque existen avisos laborales públicos vinculados a ellas dentro del catálogo. Esto no implica relación comercial, representación, patrocinio, afiliación ni vínculo laboral con Postulá Mejor.</p>
  </div>
 </section>
}
