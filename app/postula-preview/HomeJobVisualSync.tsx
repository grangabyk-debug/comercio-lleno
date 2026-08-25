'use client'

import {useEffect} from 'react'

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

export default function HomeJobVisualSync(){
 useEffect(()=>{
  const sync=()=>document.querySelectorAll<HTMLElement>('.pm7-social-job').forEach(card=>{
   const title=card.querySelector('h3')?.textContent?.trim()||''
   const cover=card.querySelector<HTMLElement>('.pm7-social-job-cover')
   const visual=visualFor(title)
   if(cover&&visual)cover.style.backgroundImage=`url(${visual})`
  })
  sync()
  const observer=new MutationObserver(sync)
  observer.observe(document.body,{childList:true,subtree:true})
  return()=>observer.disconnect()
 },[])
 return null
}
