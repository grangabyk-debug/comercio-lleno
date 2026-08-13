'use client'

import { useEffect,useMemo,useRef,useState,type PointerEvent as ReactPointerEvent } from 'react'
import { readTenantSession } from '@/lib/comercio/session'
import styles from './onboardingGuide.module.css'

const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL??'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
type Step={id:string;label:string;icon:string;primary:string;secondary?:string}
type DragState={pointerId:number;startX:number;startY:number;left:number;top:number;width:number}
const STEPS:Step[]=[{id:'datos',label:'Completá los datos del comercio',icon:'⚙',primary:'Configuración',secondary:'Comercio'},{id:'arca',label:'Configurá ARCA',icon:'✓',primary:'Configuración',secondary:'ARCA'},{id:'impresora',label:'Prepará la impresora y tickets',icon:'▤',primary:'Configuración',secondary:'Impresora y tickets'},{id:'producto',label:'Cargá tu primer producto',icon:'▦',primary:'Productos'},{id:'venta',label:'Abrí la caja y hacé tu primera venta',icon:'$',primary:'Nueva venta'}]
function normalize(value:string){return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()}
function clickButton(label:string){const wanted=normalize(label),buttons=Array.from(document.querySelectorAll('button')) as HTMLButtonElement[];const target=buttons.find(b=>normalize(b.textContent||'')===wanted)||buttons.find(b=>normalize(b.textContent||'').includes(wanted));if(!target)return false;target.click();return true}

export default function OnboardingGuide(){
  const[visible,setVisible]=useState(false),[minimized,setMinimized]=useState(false),[companyName,setCompanyName]=useState('tu comercio'),[companyId,setCompanyId]=useState(''),[incomplete,setIncomplete]=useState(false),[progress,setProgress]=useState<Record<string,boolean>>({}),[position,setPosition]=useState<{left:number;top:number}|null>(null)
  const wrapRef=useRef<HTMLElement|null>(null),dragRef=useRef<DragState|null>(null)
  useEffect(()=>{
    const session=readTenantSession();if(!session||session.role!=='owner')return
    setCompanyId(session.companyId);setCompanyName(session.companyName||'tu comercio');setMinimized(localStorage.getItem(`cl_setup_minimized_${session.companyId}`)==='1')
    let localProgress:Record<string,boolean>={};try{localProgress=JSON.parse(localStorage.getItem(`cl_setup_steps_${session.companyId}`)||'{}')}catch{}setProgress(localProgress)
    let cancelled=false
    const headers={apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${session.token}`}
    Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/company_subscriptions?company_id=eq.${encodeURIComponent(session.companyId)}&select=status,trial_ends_at&limit=1`,{headers,cache:'no-store'}).then(r=>r.ok?r.json():[]),
      fetch(`${SUPABASE_URL}/rest/v1/companies?id=eq.${encodeURIComponent(session.companyId)}&select=name,onboarding_complete&limit=1`,{headers,cache:'no-store'}).then(r=>r.ok?r.json():[]),
    ]).then(([subs,companies])=>{
      if(cancelled)return
      const subscription=Array.isArray(subs)?subs[0]:null,company=Array.isArray(companies)?companies[0]:null
      const trialActive=subscription?.status==='trialing'&&(!subscription.trial_ends_at||new Date(subscription.trial_ends_at).getTime()>Date.now())
      const setupIncomplete=company?.onboarding_complete===false
      if(company?.name)setCompanyName(company.name)
      setIncomplete(setupIncomplete)
      if(setupIncomplete){const next={...localProgress,datos:false};setProgress(next);localStorage.setItem(`cl_setup_steps_${session.companyId}`,JSON.stringify(next))}
      const hidden=localStorage.getItem(`cl_setup_hidden_${session.companyId}`)==='1'
      if(setupIncomplete||(!hidden&&trialActive))window.setTimeout(()=>{if(!cancelled)setVisible(true)},650)
    }).catch(()=>{})
    return()=>{cancelled=true}
  },[])
  const completed=useMemo(()=>STEPS.filter(s=>progress[s.id]).length,[progress]),percent=Math.round(completed/STEPS.length*100)
  function saveProgress(next:Record<string,boolean>){setProgress(next);if(companyId)localStorage.setItem(`cl_setup_steps_${companyId}`,JSON.stringify(next))}
  function go(step:Step){saveProgress({...progress,[step.id]:true});const opened=clickButton(step.primary);if(opened&&step.secondary)setTimeout(()=>clickButton(step.secondary!),160)}
  function minimize(){if(companyId)localStorage.setItem(`cl_setup_minimized_${companyId}`,'1');setMinimized(true);setPosition(null)}
  function restore(){if(companyId)localStorage.removeItem(`cl_setup_minimized_${companyId}`);setMinimized(false);setPosition(null)}
  function hideForever(){if(incomplete){minimize();return}if(companyId){localStorage.setItem(`cl_setup_hidden_${companyId}`,'1');localStorage.removeItem(`cl_setup_minimized_${companyId}`)}setVisible(false)}
  function startDrag(event:ReactPointerEvent<HTMLDivElement>){if(innerWidth<=720||minimized)return;const target=event.target as HTMLElement;if(target.closest('button,a'))return;const wrap=wrapRef.current;if(!wrap)return;const rect=wrap.getBoundingClientRect();dragRef.current={pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,left:rect.left,top:rect.top,width:rect.width};event.currentTarget.setPointerCapture(event.pointerId)}
  function moveDrag(event:ReactPointerEvent<HTMLDivElement>){const drag=dragRef.current;if(!drag||drag.pointerId!==event.pointerId)return;setPosition({left:Math.min(Math.max(8,innerWidth-drag.width-8),Math.max(8,drag.left+event.clientX-drag.startX)),top:Math.min(Math.max(8,innerHeight-72),Math.max(8,drag.top+event.clientY-drag.startY))})}
  function endDrag(event:ReactPointerEvent<HTMLDivElement>){if(dragRef.current?.pointerId!==event.pointerId)return;dragRef.current=null;try{event.currentTarget.releasePointerCapture(event.pointerId)}catch{}}
  if(!visible)return null
  if(minimized)return <aside className={`${styles.wrap} ${styles.minimized}`} aria-label="Configuración inicial de Comercio Lleno"><button className={styles.miniButton} onClick={restore} title="Abrir guía de configuración"><span>{incomplete?'⚠ Configuración pendiente':'👋 Guía de inicio'}</span><small>{incomplete?'Completá los datos del comercio':`${completed} de ${STEPS.length}`}</small><b>Abrir ↑</b></button></aside>
  return <aside ref={wrapRef} className={styles.wrap} style={position?{left:position.left,top:position.top,right:'auto'}:undefined} aria-label="Configuración inicial de Comercio Lleno"><div className={styles.card}><div className={styles.head} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}><div className={styles.headRow}><div className={styles.titleBlock}><b>{incomplete?'⚠ Terminá de configurar ': '👋 Prepará '}{companyName}</b><small>{incomplete?'Faltan datos obligatorios del comercio · podés completarlos ahora':'Tu puesta a punto de Comercio Lleno · podés mover esta ventana'}</small></div><div className={styles.headActions}><span>{completed} de {STEPS.length}</span><button type="button" onClick={minimize} title="Minimizar guía">—</button></div></div><div className={styles.progress}><i style={{width:`${percent}%`}}/></div></div><div className={styles.body}>{incomplete&&<div style={{border:'1px solid #efd69f',background:'#fff8e8',color:'#76530b',borderRadius:10,padding:'9px 10px',fontSize:9,lineHeight:1.45}}><b>Configuración del comercio pendiente.</b> Completá CUIT/CUIL, país y provincia para dejar el local listo.</div>}{completed===STEPS.length&&!incomplete?<div className={styles.complete}>✓ ¡Listo! Ya completaste la configuración inicial.</div>:<p>Te acompañamos durante toda la configuración. Podés mover esta guía o minimizarla.</p>}{STEPS.map((step,index)=>{const done=Boolean(progress[step.id])&&!((step.id==='datos')&&incomplete);return <button key={step.id} className={`${styles.step} ${done?styles.done:''}`} onClick={()=>go(step)}><i>{done?'✓':step.icon}</i><span>{index+1}. {step.label}</span><small>{done?'Listo':'Ir →'}</small></button>})}<div className={styles.actions}><button onClick={minimize}>Minimizar guía</button><a target="_blank" rel="noopener noreferrer" href="https://wa.me/5491159609135?text=Hola%2C%20necesito%20ayuda%20para%20configurar%20Comercio%20Lleno">Ayuda humana</a></div><button className={styles.hide} onClick={hideForever}>{incomplete?'Ocultar por ahora':'No quiero volver a ver esta guía'}</button></div></div></aside>
}
