'use client'

import Link from 'next/link'
import {useCallback,useEffect,useRef,useState} from 'react'

type CompanyCard={name:string;logo:string;count:number}

function initials(name:string){return name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()}
function fallbackLogo(src:string){try{const host=new URL(src).hostname.replace(/^www\./,'');return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`}catch{return''}}

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
  <div className="pm44-company-strip-inner">
   <div className="pm44-company-strip-copy"><span>EMPRESAS CON AVISOS</span><b>Empresas que hoy tienen oportunidades en el catálogo</b></div>
   <div className="pm44-company-carousel">
    <button type="button" className="pm44-company-arrow" onClick={()=>move(-1)} disabled={edge.start} aria-label="Ver empresas anteriores">‹</button>
    <div className="pm44-company-list" ref={rail}>
     {companies.map(company=><Link className="pm44-company-item" href={`/empleos?empresa=${encodeURIComponent(company.name)}`} title={`Ver oportunidades de ${company.name}`} key={company.name}>
      <span className="pm44-company-logo"><img src={company.logo} alt={`Logo de ${company.name}`} loading="lazy" referrerPolicy="no-referrer" onError={event=>{const img=event.currentTarget;const fallback=fallbackLogo(img.src);if(!img.dataset.fallback&&fallback&&fallback!==img.src){img.dataset.fallback='1';img.src=fallback;return}img.style.display='none';const badge=img.nextElementSibling as HTMLElement|null;if(badge)badge.style.display='flex'}}/><b>{initials(company.name)}</b></span>
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
