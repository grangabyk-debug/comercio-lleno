'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './orientation.module.css'
import { SESSION_KEY } from './cvAuth'

const ORIENTATION_API='https://pejkycdttogpmmdntzuq.supabase.co/functions/v1/cv-ai-orientation'

type RoleRec={role:string;fit_score:number;why_it_fits:string;evidence:string[];what_to_emphasize:string[];search_terms:string[]}
type Stretch={role:string;why_possible:string;gap_to_close:string[];first_step:string}
type Guidance={profile_score:number;profile_summary:string;professional_identity:string;recommended_roles:RoleRec[];stretch_roles:Stretch[];cv_improvements:{priority:string;title:string;advice:string}[];next_steps:string[];warning:string}

function nativeSet(el:HTMLInputElement|HTMLTextAreaElement,value:string){
  const proto=el instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype
  const setter=Object.getOwnPropertyDescriptor(proto,'value')?.set
  setter?.call(el,value)
  el.dispatchEvent(new Event('input',{bubbles:true}))
  el.dispatchEvent(new Event('change',{bubbles:true}))
}
function fileToBase64(file:File){return new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error('No pudimos leer el CV.'));reader.onload=()=>resolve(String(reader.result||'').split(',')[1]||'');reader.readAsDataURL(file)})}

export default function OrientationBridge(){
  const [mode,setMode]=useState<'target'|'orientation'>('target')
  const [host,setHost]=useState<HTMLElement|null>(null)
  const [resultHost,setResultHost]=useState<HTMLElement|null>(null)
  const [optionalJob,setOptionalJob]=useState('')
  const [guidance,setGuidance]=useState<Guidance|null>(null)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const targetFieldRef=useRef<HTMLElement|null>(null)
  const jobFieldRef=useRef<HTMLElement|null>(null)
  const targetInputRef=useRef<HTMLInputElement|null>(null)
  const jobTextRef=useRef<HTMLTextAreaElement|null>(null)
  const previousTarget=useRef('')
  const previousJob=useRef('')

  useEffect(()=>{
    let alive=true
    const setup=()=>{
      const form=document.getElementById('analisis') as HTMLFormElement|null
      if(!form)return false
      const targetInput=form.querySelector<HTMLInputElement>('input:not([type="file"])')
      const jobText=form.querySelector<HTMLTextAreaElement>('textarea')
      if(!targetInput||!jobText)return false
      targetInputRef.current=targetInput;jobTextRef.current=jobText
      targetFieldRef.current=targetInput.closest('div')
      jobFieldRef.current=jobText.closest('div')
      const stepTitle=Array.from(form.querySelectorAll('b')).find(el=>(el.textContent||'').trim()==='Decinos el puesto')
      if(stepTitle)stepTitle.textContent='Decinos el puesto o te orientamos'
      const stepSmall=stepTitle?.parentElement?.querySelector('small')
      if(stepSmall)stepSmall.textContent='Elegí la opción que mejor represente tu situación'
      for(const p of Array.from(document.querySelectorAll('p'))){
        const text=(p.textContent||'').trim()
        if(text==='El primer diagnóstico es gratis. Sin tarjeta.')p.textContent='Tenés hasta 2 análisis gratuitos. Sin tarjeta.'
      }
      let h=form.querySelector<HTMLElement>('[data-orientation-switch]')
      if(!h){h=document.createElement('div');h.dataset.orientationSwitch='1';targetFieldRef.current?.insertAdjacentElement('beforebegin',h)}
      let rh=document.querySelector<HTMLElement>('[data-orientation-result]')
      if(!rh){rh=document.createElement('div');rh.dataset.orientationResult='1';form.closest('section')?.insertAdjacentElement('afterend',rh)}
      if(alive){setHost(h);setResultHost(rh)}
      return true
    }
    if(!setup()){const id=window.setInterval(()=>{if(setup())window.clearInterval(id)},220);return()=>{alive=false;window.clearInterval(id)}}
    return()=>{alive=false}
  },[])

  function applyMode(next:'target'|'orientation'){
    const target=targetInputRef.current,job=jobTextRef.current
    if(!target||!job)return
    if(next==='orientation'){
      previousTarget.current=target.value
      previousJob.current=job.value
      nativeSet(target,'Orientación laboral')
      nativeSet(job,'Orientación laboral general sin una oferta específica. La oferta laboral es opcional y se procesa por separado.')
      if(targetFieldRef.current)targetFieldRef.current.style.display='none'
      if(jobFieldRef.current)jobFieldRef.current.style.display='none'
      const old=document.getElementById('resultado');if(old)old.style.display='none'
    }else{
      if(targetFieldRef.current)targetFieldRef.current.style.display='grid'
      if(jobFieldRef.current)jobFieldRef.current.style.display='grid'
      nativeSet(target,previousTarget.current==='Orientación laboral'?'':previousTarget.current)
      nativeSet(job,previousJob.current.includes('Orientación laboral general')?'':previousJob.current)
      const old=document.getElementById('resultado');if(old)old.style.display=''
      setGuidance(null);setError('')
    }
    setMode(next)
  }

  useEffect(()=>{
    if(!host)return
    const form=document.getElementById('analisis') as HTMLFormElement|null
    if(!form)return
    const handler=async(e:SubmitEvent)=>{
      if(mode!=='orientation')return
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()
      if(busy)return
      setBusy(true);setError('');setGuidance(null)
      try{
        const fileInput=form.querySelector<HTMLInputElement>('input[type="file"]')
        const file=fileInput?.files?.[0]
        if(!file)throw new Error('Primero subí tu CV.')
        if(file.size>6*1024*1024)throw new Error('El CV supera los 6 MB.')
        const token=localStorage.getItem(SESSION_KEY)||''
        if(!token)throw new Error('Todavía estamos preparando tu sesión. Recargá la página y probá de nuevo.')
        const response=await fetch(ORIENTATION_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'orient',token,optional_job_text:optionalJob.trim(),file:{name:file.name,mime:file.type||'application/pdf',data:await fileToBase64(file)}})})
        const data=await response.json().catch(()=>({ok:false,error:'Respuesta inválida'}))
        if(!response.ok||!data?.ok)throw new Error(data?.error||'No pudimos generar la orientación laboral.')
        setGuidance(data.orientation)
        window.setTimeout(()=>resultHost?.scrollIntoView({behavior:'smooth',block:'start'}),120)
      }catch(err){setError(err instanceof Error?err.message:'No pudimos generar la orientación laboral.')}finally{setBusy(false)}
    }
    form.addEventListener('submit',handler,true)
    return()=>form.removeEventListener('submit',handler,true)
  },[host,mode,busy,optionalJob,resultHost])

  function chooseRole(role:string){
    const target=targetInputRef.current,job=jobTextRef.current
    if(!target||!job)return
    previousTarget.current=role;previousJob.current=''
    applyMode('target')
    window.setTimeout(()=>{nativeSet(target,role);nativeSet(job,'');document.getElementById('analisis')?.scrollIntoView({behavior:'smooth',block:'start'});target.focus()},100)
  }

  const switchUi=host?createPortal(<>
    <div className={styles.switcher}>
      <button type="button" data-on={mode==='target'} onClick={()=>applyMode('target')}>Ya sé qué puesto busco</button>
      <button type="button" data-on={mode==='orientation'} onClick={()=>applyMode('orientation')}>Quiero orientación laboral</button>
    </div>
    {mode==='orientation'&&<div className={styles.guideBox}><b>No hace falta que sepas a qué puesto apuntar.</b><p>Vamos a leer tu experiencia y proponerte caminos concretos de búsqueda, qué fortalezas conviene destacar y qué podrías mejorar si querés ampliar tus opciones.</p></div>}
    {mode==='orientation'&&<div className={styles.optional}><label>¿Tenés una oferta que te llamó la atención? <span style={{opacity:.62}}>(opcional)</span></label><textarea value={optionalJob} onChange={e=>setOptionalJob(e.target.value)} placeholder="Podés pegarla acá y te decimos si parece alineada con tu perfil. Si no, dejalo vacío."/></div>}
    {mode==='orientation'&&busy&&<div className={styles.loading}>Analizando experiencia, habilidades y posibles caminos laborales…</div>}
    {mode==='orientation'&&error&&<div className={styles.error}>{error}</div>}
  </>,host):null

  const resultUi=resultHost&&guidance?createPortal(<section className={styles.result}><div className={styles.inner}>
    <div className={styles.head}><div><span className={styles.tag}>ORIENTACIÓN LABORAL</span><h2>Estos son los caminos que hoy tienen más sentido para tu perfil.</h2><p>{guidance.profile_summary}</p></div><div className={styles.score}><div><strong>{guidance.profile_score}</strong><span>fortaleza del perfil</span></div></div></div>
    <div className={styles.identity}><small>CÓMO TE LEERÍA EL MERCADO</small><h3>{guidance.professional_identity}</h3><p>No es una etiqueta definitiva: es una forma de traducir tu experiencia actual a búsquedas concretas.</p></div>
    <div className={styles.roles}>{guidance.recommended_roles.map((r,i)=><article className={styles.role} key={`${r.role}-${i}`}><div className={styles.roleTop}><h3>{r.role}</h3><span className={styles.fit}>{r.fit_score}%</span></div><p>{r.why_it_fits}</p><b style={{fontSize:10}}>Se apoya en:</b><ul>{r.evidence.slice(0,3).map((x,k)=><li key={k}>{x}</li>)}</ul><b style={{fontSize:10}}>En tu CV conviene destacar:</b><ul>{r.what_to_emphasize.slice(0,3).map((x,k)=><li key={k}>{x}</li>)}</ul><b style={{fontSize:10}}>Buscalo también como:</b><p>{r.search_terms.join(' · ')}</p><button onClick={()=>chooseRole(r.role)}>Quiero apuntar a este puesto</button></article>)}</div>
    <h3 className={styles.sectionTitle}>Opciones para crecer un poco más</h3><div className={styles.stretchGrid}>{guidance.stretch_roles.map((r,i)=><article className={styles.stretch} key={i}><h4>{r.role}</h4><p>{r.why_possible}</p><b style={{fontSize:10}}>Qué tendrías que cerrar:</b><ul>{r.gap_to_close.map((x,k)=><li key={k}>{x}</li>)}</ul><p><b>Primer paso:</b> {r.first_step}</p></article>)}</div>
    <h3 className={styles.sectionTitle}>Qué mejoraría antes de mandar más CV</h3><div className={styles.improveGrid}>{guidance.cv_improvements.map((x,i)=><article className={styles.improve} key={i}><h4>{x.title}</h4><p>{x.advice}</p><small style={{fontWeight:900,color:x.priority==='alta'?'#8b343a':'#6957ff'}}>Prioridad {x.priority}</small></article>)}</div>
    <div className={styles.next}><b>Próximos pasos sugeridos</b><ol>{guidance.next_steps.map((x,i)=><li key={i}>{x}</li>)}</ol></div>
    {guidance.warning&&<p style={{fontSize:10,color:'#7b818a',marginTop:12}}>{guidance.warning}</p>}
  </div></section>,resultHost):null

  return <>{switchUi}{resultUi}</>
}
