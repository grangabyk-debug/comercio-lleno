'use client'

import {useEffect} from 'react'
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
 'coca-cola femsa':'coca-colafemsa.com',
 'cencosud':'cencosud.com',
 'fleni':'fleni.org.ar',
 'rex':'pintureriasrex.com',
 'taranto':'taranto.com.ar',
 'prodental':'franquiciasprodental.com',
 'itsm consulting':'itsmconsulting.com.ar',
 'el precio mayorista':'elpreciomayorista.com.ar',
 'clarks':'clarksrecoleta.com',
 'pedidosya':'pedidosya.com.ar',
 'minor hotels europe & americas':'minorhotels.com',
 'despegar':'despegar.com',
 'emi labs':'emilabs.ai',
 'ey':'ey.com',
 'mercado libre':'mercadolibre.com.ar',
 'carrefour':'carrefour.com.ar',
 'farmacity':'farmacity.com',
 'frávega':'fravega.com',
 'fravega':'fravega.com',
}

function logoSources(company:string){
 const domain=companyDomains[company.trim().toLowerCase()]
 if(!domain)return []
 return [
  `https://unavatar.io/${domain}?fallback=false`,
  `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(`https://${domain}`)}&sz=256`,
  `https://icons.duckduckgo.com/ip3/${domain}.ico`,
 ]
}

function installLogo(mark:HTMLElement,company:string){
 if(!company||mark.dataset.pmLogoCompany===company||mark.querySelector('img'))return
 const sources=logoSources(company)
 if(!sources.length)return
 const fallback=(mark.textContent||company.split(/\s+/).slice(0,2).map(x=>x[0]).join('')).trim().toUpperCase()
 mark.dataset.pmLogoCompany=company
 mark.textContent=''
 const image=document.createElement('img')
 image.alt=`Logo de ${company}`
 image.referrerPolicy='no-referrer'
 image.decoding='async'
 image.loading='lazy'
 image.style.cssText='display:block;width:72%;height:72%;margin:auto;object-fit:contain;background:#fff;border-radius:8px;'
 let index=0
 const next=()=>{
  if(index>=sources.length){image.remove();mark.textContent=fallback;return}
  image.src=sources[index++]
 }
 image.onerror=next
 mark.appendChild(image)
 next()
}

function syncJobVisuals(){
 document.querySelectorAll<HTMLElement>('.pm7-social-job').forEach(card=>{
  const title=card.querySelector('h3')?.textContent?.trim()||''
  const cover=card.querySelector<HTMLElement>('.pm7-social-job-cover')
  const visual=visualFor(title)
  if(cover&&visual)cover.style.backgroundImage=`url(${visual})`
 })
}

function syncCompanyLogos(){
 document.querySelectorAll<HTMLElement>('.pm7-social-company').forEach(row=>{
  const company=row.querySelector('div b')?.textContent?.trim()||''
  const mark=row.firstElementChild
  if(mark instanceof HTMLElement)installLogo(mark,company)
 })
 document.querySelectorAll<HTMLAnchorElement>('a[href^="/empleos?empresa="]').forEach(link=>{
  const company=link.querySelector('b')?.textContent?.trim()||''
  const mark=link.querySelector<HTMLElement>('span')
  if(mark)installLogo(mark,company)
 })
}

export default function HomeJobVisualSync(){
 useEffect(()=>{
  let scheduled=false
  const sync=()=>{
   if(scheduled)return
   scheduled=true
   requestAnimationFrame(()=>{
    scheduled=false
    syncJobVisuals()
    syncCompanyLogos()
   })
  }
  sync()
  const observer=new MutationObserver(sync)
  observer.observe(document.body,{childList:true,subtree:true})
  return()=>observer.disconnect()
 },[])
 return <HomeCompanyStrip/>
}
