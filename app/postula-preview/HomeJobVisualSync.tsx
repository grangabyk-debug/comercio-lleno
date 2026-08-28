'use client'

import {useLayoutEffect} from 'react'
import HomeCompanyStrip from './HomeCompanyStrip'

const img=(id:number)=>`https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`

function visualFor(title:string){
 const t=title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 if(/agente de viajes|travel|turismo/.test(t))return img(7820326)
 if(/strategy|performance|consultor|consultoria|analyst|auditor/.test(t))return img(8062280)
 if(/customer support|customer service|soporte|call center/.test(t))return img(7709290)
 if(/back-end|backend|front-end|frontend|developer|software|programador/.test(t))return img(7988114)
 if(/cajer|cajas|checkout/.test(t))return img(36772947)
 if(/fruta|verdura|frescos/.test(t))return img(16154014)
 if(/repositor|reposicion|gondola/.test(t))return img(5380920)
 if(/deposit|almacen|logistic|operario|picking/.test(t))return img(36552175)
 if(/carnic|despost|depost|fiambr/.test(t))return img(7883930)
 if(/cocin|chef|barista|gastronom|camarer|mozo/.test(t))return img(36473250)
 if(/recepcion.*hotel|hotel.*recepcion|front desk/.test(t))return img(5371676)
 if(/limpieza|mucama|housekeeping/.test(t))return img(4239146)
 if(/venta|vendedor|comercial|retail/.test(t))return img(4199490)
 return ''
}

const companyDomains:Record<string,string>={
 'coca-cola femsa':'coca-colafemsa.com','cencosud':'cencosud.com','fleni':'fleni.org.ar','rex':'pintureriasrex.com','taranto':'taranto.com.ar','prodental':'franquiciasprodental.com','itsm consulting':'itsmconsulting.com.ar','el precio mayorista':'elpreciomayorista.com.ar','clarks':'clarksrecoleta.com','pedidosya':'pedidosya.com.ar','minor hotels europe & americas':'minorhotels.com','despegar':'despegar.com','emi labs':'emilabs.ai','ey':'ey.com','mercado libre':'mercadolibre.com.ar','carrefour':'carrefour.com.ar','farmacity':'farmacity.com','frávega':'fravega.com','fravega':'fravega.com',
}

const homeZones=[
 ['','Todo Argentina'],['CABA','CABA'],['Zona Norte GBA','Zona Norte · GBA'],['Zona Oeste GBA','Zona Oeste · GBA'],['Zona Sur GBA','Zona Sur · GBA'],['La Plata','La Plata'],['Rosario','Rosario'],['Córdoba','Córdoba'],['Mendoza','Mendoza'],['Remoto','Remoto'],
] as const

function logoSources(company:string){const domain=companyDomains[company.trim().toLowerCase()];if(!domain)return[];return[`https://${domain}/favicon.ico`,`https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(`https://${domain}`)}&sz=256`]}
function installLogo(mark:HTMLElement,company:string){
 if(!company||mark.dataset.pmLogoCompany===company||mark.querySelector('img'))return
 const sources=logoSources(company);if(!sources.length)return
 const fallback=(mark.textContent||company.split(/\s+/).slice(0,2).map(x=>x[0]).join('')).trim().toUpperCase();mark.dataset.pmLogoCompany=company;mark.textContent=''
 const image=document.createElement('img');image.alt=`Logo de ${company}`;image.referrerPolicy='no-referrer';image.decoding='async';image.loading='lazy';image.style.cssText='display:block;width:72%;height:72%;margin:auto;object-fit:contain;background:#fff;border-radius:8px;'
 let index=0;const next=()=>{if(index>=sources.length){image.remove();mark.textContent=fallback;return}image.src=sources[index++]};image.onerror=next;mark.appendChild(image);next()
}
function syncJobVisuals(){document.querySelectorAll<HTMLElement>('.pm7-social-job').forEach(card=>{const title=card.querySelector('h3')?.textContent?.trim()||'',cover=card.querySelector<HTMLElement>('.pm7-social-job-cover'),visual=visualFor(title);if(cover&&visual)cover.style.backgroundImage=`url(${visual})`})}
function syncCompanyLogos(){document.querySelectorAll<HTMLElement>('.pm7-social-company').forEach(row=>{const company=row.querySelector('div b')?.textContent?.trim()||'',mark=row.firstElementChild;if(mark instanceof HTMLElement)installLogo(mark,company)})}
function installHomeSearch(){
 const existing=document.querySelector<HTMLElement>('.pm7-search');if(!existing)return false
 if(existing.matches('form.pm-home-job-search')||existing.dataset.pmRealSearch)return true
 const form=document.createElement('form');form.className=`${existing.className} pm-home-job-search`;form.action='/empleos';form.method='get';form.dataset.pmRealSearch='1';form.setAttribute('role','search')
 const q=document.createElement('label');q.innerHTML='<small>¿Qué querés hacer?</small><input name="q" type="search" autocomplete="off" placeholder="ventas, café, diseño, logística…" aria-label="Puesto o palabra clave">'
 const zone=document.createElement('label');const select=document.createElement('select');select.name='location';select.setAttribute('aria-label','Zona para buscar trabajo');for(const[value,label]of homeZones){const option=document.createElement('option');option.value=value;option.textContent=label;select.appendChild(option)};const zoneTitle=document.createElement('small');zoneTitle.textContent='¿Dónde?';zone.append(zoneTitle,select)
 const submit=document.createElement('button');submit.type='submit';submit.textContent='Buscar';form.append(q,zone,submit);existing.replaceWith(form)
 return true
}
function syncLanding(){const searchReady=installHomeSearch();syncJobVisuals();syncCompanyLogos();return searchReady}

export default function HomeJobVisualSync(){
 useLayoutEffect(()=>{
  let stopped=false
  const run=()=>{if(stopped)return;syncLanding()}
  run()
  /* The landing is streamed by Next. On a cold request this component can hydrate
     before the hero arrives, so watch the stream and upgrade the search as soon as
     the actual markup is inserted. */
  const observer=new MutationObserver(()=>run())
  observer.observe(document.documentElement,{childList:true,subtree:true})
  const frames=[0,40,120,300,700,1400].map(ms=>window.setTimeout(run,ms))
  return()=>{stopped=true;observer.disconnect();frames.forEach(id=>window.clearTimeout(id))}
 },[])
 return <HomeCompanyStrip/>
}
