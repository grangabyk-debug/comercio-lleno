'use client'

import { useEffect,useMemo,useRef,useState,type PointerEvent as ReactPointerEvent } from 'react'
import { readTenantSession } from '@/lib/comercio/session'
import styles from './onboardingGuide.module.css'

const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL??'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

type Step={id:string;label:string;icon:string;primary:string;secondary?:string;optional?:boolean}
type DragState={pointerId:number;startX:number;startY:number;left:number;top:number;width:number}

const STEPS:Step[]=[
  {id:'datos',label:'Completá los datos del comercio',icon:'⚙',primary:'Configuración',secondary:'Comercio'},
  {id:'impresora',label:'Prepará la impresora y tickets',icon:'▤',primary:'Configuración',secondary:'Impresora y tickets'},
  {id:'producto',label:'Cargá tu primer producto',icon:'▦',primary:'Productos'},
  {id:'venta',label:'Abrí la caja y hacé tu primera venta',icon:'$',primary:'Nueva venta'},
  {id:'arca',label:'Configurá ARCA',icon:'✓',primary:'Configuración',secondary:'ARCA',optional:true},
]
const ESSENTIAL_STEPS=STEPS.filter(step=>!step.optional)

function normalize(value:string){return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()}
function clickButton(label:string){const wanted=normalize(label),buttons=Array.from(document.querySelectorAll('button')) as HTMLButtonElement[];const target=buttons.find(b=>normalize(b.textContent||'')===wanted)||buttons.find(b=>normalize(b.textContent||'').includes(wanted));if(!target)return false;target.click();return true}

export default function OnboardingGuide(){
  const[visible,setVisible]=useState(false),[minimized,setMinimized]=useState(false),[companyName,setCompanyName]=useState('tu comercio'),[companyId,setCompanyId]=useState(''),[incomplete,setIncomplete]=useState(false),[progress,setProgress]=useState<Record<string,boolean>>({}),[position,setPosition]=useState<{left:number;top:number}|null>(null)
  const wrapRef=useRef<HTMLElement|null>(null),dragRef=useRef<DragState|null>(null)

  useEffect(()=>{
    const session=readTenantSession();if(!session||session.role!=='owner')return
    const resumeKey=`cl_resume_onboarding_${session.companyId}`,resumeAfterArca=sessionStorage.getItem(resumeKey)==='1'
    if(resumeAfterArca){sessionStorage.removeItem(resumeKey);localStorage.removeItem(`cl_setup_minimized_${session.companyId}`);localStorage.removeItem(`cl_setup_hidden_${session.companyId}`)}
    setCompanyId(session.companyId);setCompanyName(session.companyName||'tu comercio');setMinimized(resumeAfterArca?false:localStorage.getItem(`cl_setup_minimized_${session.companyId}`)==='1')
    let localProgress:Record<string,boolean>={};try{localProgress=JSON.parse(localStorage.getItem(`cl_setup_steps_${session.companyId}`)||'{}')}catch{}setProgress(localProgress)
    if(resumeAfterArca)window.setTimeout(()=>setVisible(true),220)
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
      if(resumeAfterArca||setupIncomplete||(!hidden&&trialActive))window.setTimeout(()=>{if(!cancelled)setVisible(true)},resumeAfterArca?220:650)
    }).catch(()=>{})
    return()=>{cancelled=true}
  },[])

  const completedEssential=useMemo(()=>ESSENTIAL_STEPS.filter(s=>progress[s.id]).length,[progress])
  const percent=Math.round(completedEssential/ESSENTIAL_STEPS.length*100)
  const essentialReady=completedEssential===ESSENTIAL_STEPS.length&&!incomplete

  function saveProgress(next:Record<string,boolean>){setProgress(next);if(companyId)localStorage.setItem(`cl_setup_steps_${companyId}`,JSON.stringify(next))}
  function go(step:Step){if(step.id==='arca'&&companyId)sessionStorage.setItem(`cl_onboarding_active_step_${companyId}`,'arca');else saveProgress({...progress,[step.id]:true});const opened=clickButton(step.primary);if(opened&&step.secondary)setTimeout(()=>clickButton(step.secondary!),160)}
  function minimize(){if(companyId)localStorage.setItem(`cl_setup_minimized_${companyId}`,'1');setMinimized(true);setPosition(null)}
  function restore(){if(companyId)localStorage.removeItem(`cl_setup_minimized_${companyId}`);setMinimized(false);setPosition(null)}
  function hideForever(){if(incomplete){minimize();return}if(companyId){localStorage.setItem(`cl_setup_hidden_${companyId}`,'1');localStorage.removeItem(`cl_setup_minimized_${companyId}`)}setVisible(false)}
  function deferArca(){
    if(companyId){
      localStorage.setItem(`cl_setup_hidden_${companyId}`,'1')
      localStorage.removeItem(`cl_setup_minimized_${companyId}`)
      sessionStorage.removeItem(`cl_onboarding_active_step_${companyId}`)
      sessionStorage.removeItem(`cl_resume_onboarding_${companyId}`)
    }
    setVisible(false)
  }
  function openHumanSupport(){window.dispatchEvent(new Event('comercio:open-human-support'));const opened=clickButton('Asistente IA');if(opened)window.setTimeout(()=>window.dispatchEvent(new Event('comercio:open-human-support')),240)}
  function startDrag(event:ReactPointerEvent<HTMLDivElement>){if(innerWidth<=720||minimized)return;const target=event.target as HTMLElement;if(target.closest('button,a'))return;const wrap=wrapRef.current;if(!wrap)return;const rect=wrap.getBoundingClientRect();dragRef.current={pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,left:rect.left,top:rect.top,width:rect.width};event.currentTarget.setPointerCapture(event.pointerId)}
  function moveDrag(event:ReactPointerEvent<HTMLDivElement>){const drag=dragRef.current;if(!drag||drag.pointerId!==event.pointerId)return;setPosition({left:Math.min(Math.max(8,innerWidth-drag.width-8),Math.max(8,drag.left+event.clientX-drag.startX)),top:Math.min(Math.max(8,innerHeight-72),Math.max(8,drag.top+event.clientY-drag.startY))})}
  function endDrag(event:ReactPointerEvent<HTMLDivElement>){if(dragRef.current?.pointerId!==event.pointerId)return;dragRef.current=null;try{event.currentTarget.releasePointerCapture(event.pointerId)}catch{}}

  if(!visible)return null
  if(minimized)return <aside className={`${styles.wrap} ${styles.minimized}`} aria-label="Configuración inicial de Comercio Lleno"><button className={styles.miniButton} onClick={restore} title="Abrir guía de configuración"><span>{incomplete?'⚠ Configuración pendiente':'👋 Guía de inicio'}</span><small>{incomplete?'Completá los datos del comercio':`${completedEssential} de ${ESSENTIAL_STEPS.length}`}</small><b>Abrir ↑</b></button></aside>

  return <aside ref={wrapRef} className={styles.wrap} style={position?{left:position.left,top:position.top,right:'auto'}:undefined} aria-label="Configuración inicial de Comercio Lleno"><div className={styles.card}><div className={styles.head} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}><div className={styles.headRow}><div className={styles.titleBlock}><b>{incomplete?'⚠ Terminá de configurar ': '👋 Prepará '}{companyName}</b><small>{incomplete?'Faltan datos obligatorios del comercio · podés completarlos ahora':'Tu puesta a punto de Comercio Lleno · ARCA puede configurarse después'}</small></div><div className={styles.headActions}><span>{completedEssential} de {ESSENTIAL_STEPS.length}</span><button type="button" onClick={minimize} title="Minimizar guía">—</button></div></div><div className={styles.progress}><i style={{width:`${percent}%`}}/></div></div><div className={styles.body}>
    {incomplete&&<div style={{border:'1px solid #efd69f',background:'#fff8e8',color:'#76530b',borderRadius:10,padding:'9px 10px',fontSize:9,lineHeight:1.45}}><b>Configuración del comercio pendiente.</b> Completá CUIT/CUIL, país y provincia para dejar el local listo.</div>}
    {essentialReady?<div className={styles.complete}>✓ Lo esencial ya está listo. ARCA queda como último paso opcional y podés hacerlo más adelante.</div>:<p>Te acompañamos durante la configuración. Los primeros pasos te dejan listo para probar el sistema; ARCA no es obligatorio durante la prueba.</p>}
    {STEPS.map((step,index)=>{const done=Boolean(progress[step.id])&&!((step.id==='datos')&&incomplete);const row=<button key={`${step.id}-row`} className={`${styles.step} ${done?styles.done:''}`} onClick={()=>go(step)}><i>{done?'✓':step.icon}</i><span>{index+1}. {step.label}{step.optional&&<b style={{display:'inline-block',marginLeft:7,padding:'2px 6px',borderRadius:999,background:'#eef5ff',color:'#2d65a8',fontSize:9,textDecoration:'none'}}>OPCIONAL</b>}</span><small>{done?'Listo':'Ir →'}</small></button>;if(step.id!=='arca')return row;return <div key={step.id}>{row}{!done&&<div style={{margin:'-1px 0 9px',padding:'10px 11px',border:'1px solid #d8e6f7',borderRadius:10,background:'#f6f9fd',color:'#38536f'}}><b style={{display:'block',fontSize:11,marginBottom:3}}>ARCA no es obligatorio ahora.</b><span style={{display:'block',fontSize:10.5,lineHeight:1.45}}>Podés usar el período de prueba, cargar productos y hacer ventas sin configurarlo en este momento. Cuando quieras facturar electrónicamente, lo activás desde Configuración → ARCA.</span><button type="button" onClick={deferArca} style={{width:'100%',marginTop:9,border:'1px solid #b9cde4',background:'#fff',color:'#254b73',borderRadius:9,padding:'9px 10px',fontSize:10.5,fontWeight:900,cursor:'pointer'}}>Lo hago después · cerrar guía</button></div>}</div>})}
    <div className={styles.actions}><button onClick={minimize}>Minimizar guía</button><button type="button" className={styles.supportButton} onClick={openHumanSupport}>Ayuda humana</button></div>
    <button className={styles.hide} onClick={hideForever}>{incomplete?'Ocultar por ahora':'No quiero volver a ver esta guía'}</button>
  </div></div></aside>
}
