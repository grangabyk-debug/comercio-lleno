'use client'

import {useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'

const INFO=[
 {key:'pay',title:'Importe claro',text:'El importe estimado y la unidad —por hora, tarea o jornada puntual— quedan visibles antes de contactar. El pago del servicio se realiza directamente entre las partes.'},
 {key:'identity',title:'Identidad y contexto',text:'Mostramos señales verificables e historial cuando exista, siempre con contexto y posibilidad de pedir ayuda ante una conducta sospechosa.'},
 {key:'employment',title:'No encubre empleo',text:'Si hay continuidad, dependencia, supervisión permanente o cobertura de un puesto habitual, la publicación debe ir por Empleos y no por Servicios Flex.'},
 {key:'chat',title:'Chat primero',text:'Podés preguntar y acordar condiciones antes de realizar cualquier servicio. No compartas claves, códigos ni documentación sensible sin necesidad legítima.'},
] as const

const PACKS=[
 {code:'flex1',credits:1,amount:1990,label:'1 crédito'},
 {code:'flex5',credits:5,amount:7900,label:'5 créditos',featured:true},
 {code:'flex10',credits:10,amount:13900,label:'10 créditos'},
] as const

export default function ServicesFlexCompactSafety(){
 const[open,setOpen]=useState<string>('')
 const[busy,setBusy]=useState<string>('')
 const[notice,setNotice]=useState('')

 async function buy(code:string){
  if(busy)return
  setNotice('');setBusy(code)
  try{
   const{data}=await cvAuthClient().auth.getSession()
   const token=data.session?.access_token
   if(!token){location.assign('/login?next=/servicios-flex');return}
   const r=await fetch('/api/postula/flex/credits/checkout',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({pack:code})})
   const d=await r.json().catch(()=>({}))
   if(!r.ok||!d?.ok)throw new Error(d?.error||'No pudimos abrir Mercado Pago.')
   location.assign(d.init_point)
  }catch(e){setNotice(e instanceof Error?e.message:'No pudimos abrir Mercado Pago.');setBusy('')}
 }

 return <section className="pmsf-compact-section" aria-labelledby="pmsf-safe-title">
  <div className="pmsf-compact-inner">
   <div className="pmsf-compact-head">
    <span>ANTES DE ACORDAR</span>
    <h2 id="pmsf-safe-title">Reglas claras, sin llenar la pantalla.</h2>
   </div>

   <div className="pmsf-info-grid">
    {INFO.map(item=><div className={`pmsf-info-card ${item.key}`} key={item.key} onMouseLeave={()=>setOpen(v=>v===item.key?'':v)}>
      <b>{item.title}</b>
      <button type="button" className="pmsf-info-button" aria-label={`Información sobre ${item.title}`} aria-expanded={open===item.key} onMouseEnter={()=>setOpen(item.key)} onFocus={()=>setOpen(item.key)} onClick={()=>setOpen(v=>v===item.key?'':item.key)}>i</button>
      {open===item.key&&<div className="pmsf-info-tooltip" role="tooltip">{item.text}</div>}
    </div>)}
   </div>

   <div className="pmsf-credits-callout">
    <div>
     <span>CRÉDITOS SERVICIOS FLEX</span>
     <h3>Empezás con 3 créditos.</h3>
     <p>Cuando creás tu cuenta por primera vez recibís <b>3 créditos</b>. Después se renuevan <b>2 créditos cada 30 días</b>. Los créditos incluidos no son acumulativos.</p>
    </div>
    <div className="pmsf-credit-stats" aria-label="Resumen de créditos incluidos">
     <span><b>3</b><small>al crear la cuenta</small></span>
     <span><b>2</b><small>cada 30 días</small></span>
     <span><b>0</b><small>acumulación</small></span>
    </div>
   </div>

   <div className="pmsf-pack-shell">
    <div className="pmsf-pack-copy">
     <span>¿NECESITÁS PUBLICAR MÁS?</span>
     <h3>Comprá créditos extra cuando los necesites.</h3>
     <p>Son pagos únicos. Los créditos comprados quedan disponibles en tu cuenta y no reemplazan la renovación gratuita.</p>
    </div>
    <div className="pmsf-pack-grid">
     {PACKS.map(pack=><button type="button" key={pack.code} className="pmsf-pack" data-featured={'featured' in pack&&pack.featured?'true':'false'} disabled={Boolean(busy)} onClick={()=>void buy(pack.code)}>
       {'featured' in pack&&pack.featured&&<em>MÁS ELEGIDO</em>}
       <strong>{pack.label}</strong>
       <b>${pack.amount.toLocaleString('es-AR')}</b>
       <small>{pack.credits>1?`$${Math.round(pack.amount/pack.credits).toLocaleString('es-AR')} por crédito`:'pago único'}</small>
       <span>{busy===pack.code?'Abriendo Mercado Pago…':'Comprar'}</span>
      </button>)}
    </div>
    {notice&&<p className="pmsf-pack-notice">{notice}</p>}
   </div>

   <div className="pmsf-legal-mini">
    <b>Servicios Flex no crea una categoría laboral nueva.</b> La naturaleza de cada relación depende de cómo se presta realmente el servicio. Postulá Mejor no recibe ni custodia el dinero acordado entre las partes. <a href="/terminos/servicios-flex">Ver Términos específicos.</a>
   </div>
  </div>
 </section>
}
