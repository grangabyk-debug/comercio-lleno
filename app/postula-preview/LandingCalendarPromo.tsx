'use client'

import Link from 'next/link'
import {useEffect,useRef} from 'react'
import {usePathname} from 'next/navigation'

const weekdays=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
const months=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
function pad(v:number){return String(v).padStart(2,'0')}
function key(d:Date){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`}

export default function LandingCalendarPromo(){
 const pathname=usePathname()||'/'
 const employer=pathname==='/empresas'||pathname==='/empresas/'
 const candidate=pathname==='/'
 const sectionRef=useRef<HTMLElement|null>(null)
 useEffect(()=>{
  if(!employer)return
  const place=()=>{
   const section=sectionRef.current
   const plans=document.querySelector('.pm19-plans-ready')
   if(section&&plans&&plans.nextElementSibling!==section)plans.insertAdjacentElement('afterend',section)
  }
  place()
  const timer=window.setTimeout(place,120)
  return()=>window.clearTimeout(timer)
 },[employer])
 if(!candidate&&!employer)return null
 const today=new Date(),gridStart=new Date(today);gridStart.setDate(today.getDate()-((today.getDay()+6)%7))
 const cells=Array.from({length:14},(_,i)=>{const d=new Date(gridStart);d.setDate(gridStart.getDate()+i);return d})
 const interviewDate=new Date(today);interviewDate.setDate(today.getDate()+2)
 const taskDate=new Date(today);taskDate.setDate(today.getDate()+4)
 return <>
  {employer?<style>{`.pm7-employer .pm7-final{display:none!important}.pm7-employer .pm45-old-price{font-size:23px!important;line-height:1.05!important;font-weight:950!important;color:#4e5660!important;text-decoration:line-through!important;text-decoration-thickness:2px!important;text-decoration-color:#4e5660!important;margin:2px 0 7px!important;letter-spacing:-.02em!important}@media(max-width:520px){.pm7-employer .pm45-old-price{font-size:21px!important}}`}</style>:null}
  <section ref={sectionRef} className="pmcal-promo" data-audience={employer?'employer':'candidate'}>
   <div className="pmcal-promo-inner">
    <div className="pmcal-promo-copy"><small>CALENDARIO INTEGRADO</small><h2>{employer?'Entrevistas y pendientes, sin perder el hilo.':'Tus entrevistas y tareas, en un solo lugar.'}</h2><p>{employer?'Las entrevistas aceptadas se agendan solas y el equipo puede sumar tareas propias.':'Cuando aceptás una entrevista aparece automáticamente. También podés sumar recordatorios y tareas personales.'}</p><Link href={employer?'/empresas/registro':'/registro'}>{employer?'Crear cuenta empresa':'Crear cuenta gratis'} <span>→</span></Link></div>
    <div className="pmcal-promo-calendar" aria-label="Vista del calendario de Postulá Mejor"><header><button type="button" tabIndex={-1}>←</button><div><small>{today.getFullYear()}</small><strong>{months[today.getMonth()]}</strong></div><span>Hoy</span></header><div className="pmcal-promo-weekdays">{weekdays.map(day=><b key={day}>{day}</b>)}</div><div className="pmcal-promo-grid">{cells.map(d=>{const k=key(d),outside=d.getMonth()!==today.getMonth(),isToday=k===key(today),hasInterview=k===key(interviewDate),hasTask=k===key(taskDate);return <div key={k} data-outside={outside} data-today={isToday}><strong>{d.getDate()}</strong><span>{hasInterview&&<i data-kind="interview"/>}{hasTask&&<i data-kind="task"/>}</span></div>})}</div><footer><i data-kind="interview"/><span>{employer?'Entrevista confirmada · 17:30':'Entrevista · 17:30'}</span><b>{employer?'Vendedora/or · Palermo':'Selección · Palermo'}</b></footer></div>
   </div>
  </section>
 </>
}
