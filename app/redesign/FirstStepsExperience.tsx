'use client'

import { useCallback,useEffect,useMemo,useState } from 'react'
import { checkArcaHealth } from '@/lib/comercio/api'
import { readTenantSession } from '@/lib/comercio/session'
import type { TenantSession,ViewKey } from '@/lib/comercio/types'
import UiIcon from './UiIcon'
import styles from './FirstStepsExperience.module.css'

const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL??'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

type ProgressState={company:boolean;product:boolean;sale:boolean;printer:boolean;arca:boolean;loaded:boolean}
type TargetRect={top:number;left:number;right:number;bottom:number;width:number;height:number}
type TourStep={key:'sale'|'products'|'cash'|'settings';title:string;text:string}

const TOUR_STEPS:TourStep[]=[
  {key:'sale',title:'Tu venta empieza acá',text:'Desde Nueva venta buscás o escaneás productos, elegís el medio de pago y registrás el cobro. Es la pantalla que más vas a usar.'},
  {key:'products',title:'Acá armás tu catálogo',text:'En Productos cargás artículos, precios y stock. Podés empezar con uno solo y después importar o completar el resto.'},
  {key:'cash',title:'Caja clara desde el primer día',text:'Caja diaria te muestra apertura, movimientos y cierre. Cuando quieras operar como en el local real, abrís la caja con el monto inicial.'},
  {key:'settings',title:'Lo técnico queda ordenado acá',text:'En Configuración están ventas, impresora, ARCA, usuarios y otros ajustes. Podés configurarlos a medida que los necesites.'},
]

function normalize(value:string){return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()}
function clickButton(label:string){const wanted=normalize(label),buttons=Array.from(document.querySelectorAll('button')) as HTMLButtonElement[];const target=buttons.find(b=>normalize(b.textContent||'')===wanted)||buttons.find(b=>normalize(b.textContent||'').includes(wanted));if(!target)return false;target.click();return true}
function navigate(view:ViewKey,secondary?:string){window.dispatchEvent(new CustomEvent<ViewKey>('comercio:navigate-view',{detail:view}));if(secondary)window.setTimeout(()=>clickButton(secondary),260)}
function localDay(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}

export default function FirstStepsExperience(){
  const[session,setSession]=useState<TenantSession|null>(null)
  const[welcomeOpen,setWelcomeOpen]=useState(false)
  const[tourIndex,setTourIndex]=useState<number|null>(null)
  const[tourComplete,setTourComplete]=useState(false)
  const[checklistOpen,setChecklistOpen]=useState(false)
  const[introSeen,setIntroSeen]=useState(false)
  const[progress,setProgress]=useState<ProgressState>({company:false,product:false,sale:false,printer:false,arca:false,loaded:false})
  const[targetRect,setTargetRect]=useState<TargetRect|null>(null)
  const[cardPos,setCardPos]=useState<{top:number;left:number}|null>(null)
  const[dismissConfirmOpen,setDismissConfirmOpen]=useState(false)
  const[dismissed,setDismissed]=useState(false)

  useEffect(()=>{
    const active=readTenantSession()
    if(!active||active.role!=='owner')return
    setSession(active)

    const today=localDay()
    const introKey=`cl_first_steps_v2_intro_${active.companyId}`
    const firstDayKey=`cl_first_steps_v3_first_day_${active.companyId}`
    const neverShow=localStorage.getItem(`cl_first_steps_v2_never_show_${active.companyId}`)==='1'
    const closedThisSession=sessionStorage.getItem(`cl_first_steps_v2_closed_session_${active.companyId}`)==='1'
    const seen=localStorage.getItem(introKey)==='1'
    let firstDay=localStorage.getItem(firstDayKey)

    if(!firstDay){
      if(seen){
        setIntroSeen(true)
        setDismissed(true)
        return
      }
      firstDay=today
      localStorage.setItem(firstDayKey,today)
    }

    if(neverShow||closedThisSession||firstDay!==today){setDismissed(true);return}
    setIntroSeen(seen)
    if(!seen)window.setTimeout(()=>setWelcomeOpen(true),650)
  },[])

  const refreshProgress=useCallback(async()=>{
    if(!session)return
    const headers={apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${session.token}`}
    try{
      const companyId=encodeURIComponent(session.companyId)
      const[companyResponse,productResponse,saleResponse,arcaState]=await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/companies?id=eq.${companyId}&select=id,onboarding_complete&limit=1`,{headers,cache:'no-store'}),
        fetch(`${SUPABASE_URL}/rest/v1/products?company_id=eq.${companyId}&select=id&limit=1`,{headers,cache:'no-store'}),
        fetch(`${SUPABASE_URL}/rest/v1/sales?company_id=eq.${companyId}&select=id&limit=1`,{headers,cache:'no-store'}),
        checkArcaHealth(session).catch(()=>({connected:false})),
      ])
      const[companies,products,sales]=await Promise.all([
        companyResponse.ok?companyResponse.json():[],
        productResponse.ok?productResponse.json():[],
        saleResponse.ok?saleResponse.json():[],
      ])
      const company=Array.isArray(companies)?companies[0]:null
      const printer=localStorage.getItem(`cl_device_settings_${session.companyId}`)!==null
      setProgress({
        company:Boolean(company)&&company.onboarding_complete!==false,
        product:Array.isArray(products)&&products.length>0,
        sale:Array.isArray(sales)&&sales.length>0,
        printer,
        arca:Boolean(arcaState?.connected),
        loaded:true,
      })
    }catch{setProgress(current=>({...current,loaded:true}))}
  },[session])

  useEffect(()=>{
    if(!session||dismissed)return
    void refreshProgress()
    const timer=window.setInterval(()=>void refreshProgress(),30000)
    const refreshLater=()=>window.setTimeout(()=>void refreshProgress(),700)
    window.addEventListener('focus',refreshLater)
    window.addEventListener('comercio:navigate-view',refreshLater)
    return()=>{window.clearInterval(timer);window.removeEventListener('focus',refreshLater);window.removeEventListener('comercio:navigate-view',refreshLater)}
  },[session,dismissed,refreshProgress])

  useEffect(()=>{
    if(tourIndex===null){setTargetRect(null);setCardPos(null);return}
    const step=TOUR_STEPS[tourIndex]
    const update=()=>{
      const node=document.querySelector(`[data-tour="${step.key}"]`) as HTMLElement|null
      if(!node){setTargetRect(null);setCardPos(null);return}
      const rect=node.getBoundingClientRect()
      if(rect.width<4||rect.height<4||rect.bottom<0||rect.top>window.innerHeight){setTargetRect(null);setCardPos(null);return}
      const next={top:rect.top,left:rect.left,right:rect.right,bottom:rect.bottom,width:rect.width,height:rect.height}
      setTargetRect(next)
      const cardWidth=Math.min(380,window.innerWidth-28),cardHeight=260,gap=18
      let left=rect.right+gap,top=Math.max(14,Math.min(rect.top,window.innerHeight-cardHeight-14))
      if(left+cardWidth>window.innerWidth-14)left=rect.left-cardWidth-gap
      if(left<14){left=Math.max(14,Math.min(rect.left,window.innerWidth-cardWidth-14));top=Math.min(window.innerHeight-cardHeight-14,rect.bottom+gap)}
      setCardPos({left,top:Math.max(14,top)})
    }
    update()
    const timer=window.setInterval(update,300)
    window.addEventListener('resize',update)
    window.addEventListener('scroll',update,true)
    return()=>{window.clearInterval(timer);window.removeEventListener('resize',update);window.removeEventListener('scroll',update,true)}
  },[tourIndex])

  const essentialDone=useMemo(()=>[progress.company,progress.product,progress.sale].filter(Boolean).length,[progress])
  const essentialPercent=Math.round(essentialDone/3*100)

  function rememberIntro(){if(!session)return;localStorage.setItem(`cl_first_steps_v2_intro_${session.companyId}`,'1');setIntroSeen(true)}
  function rememberTour(){if(!session)return;localStorage.setItem(`cl_first_steps_v2_tour_${session.companyId}`,'1')}
  function startTour(){rememberIntro();setWelcomeOpen(false);setTourComplete(false);setChecklistOpen(false);setTourIndex(0)}
  function explore(){rememberIntro();rememberTour();setWelcomeOpen(false);setChecklistOpen(false)}
  function skipTour(){rememberIntro();rememberTour();setTourIndex(null);setChecklistOpen(false)}
  function nextTour(){if(tourIndex===null)return;if(tourIndex<TOUR_STEPS.length-1){setTourIndex(tourIndex+1);return}rememberTour();setTourIndex(null);setTourComplete(true)}
  function prevTour(){if(tourIndex===null||tourIndex===0)return;setTourIndex(tourIndex-1)}
  function goToSale(){setTourComplete(false);setChecklistOpen(false);navigate('pos')}
  function checklistAction(key:'company'|'product'|'sale'|'printer'|'arca'){
    setChecklistOpen(false)
    if(key==='company')navigate('settings','Comercio')
    if(key==='product')navigate('products')
    if(key==='sale')navigate('pos')
    if(key==='printer')navigate('settings','Impresora y tickets')
    if(key==='arca')navigate('settings','ARCA')
  }
  function closeForToday(){
    if(!session)return
    sessionStorage.setItem(`cl_first_steps_v2_closed_session_${session.companyId}`,'1')
    setDismissConfirmOpen(false);setChecklistOpen(false);setWelcomeOpen(false);setTourIndex(null);setTourComplete(false);setDismissed(true)
  }
  function closeForever(){
    if(!session)return
    localStorage.setItem(`cl_first_steps_v2_never_show_${session.companyId}`,'1')
    closeForToday()
  }

  if(!session||dismissed)return null
  const currentStep=tourIndex===null?null:TOUR_STEPS[tourIndex]
  const highlightStyle=targetRect?{top:targetRect.top-6,left:targetRect.left-6,width:targetRect.width+12,height:targetRect.height+12}:undefined
  const tourCardStyle=cardPos?{top:cardPos.top,left:cardPos.left}:undefined

  return <>
    {welcomeOpen&&<div className={styles.welcomeOverlay} role="presentation">
      <section className={styles.welcomeCard} role="dialog" aria-modal="true" aria-labelledby="first-steps-welcome">
        <span className={styles.eyebrow}>PRIMER DÍA · COMERCIO LLENO</span>
        <h2 id="first-steps-welcome">Conocé lo esencial en menos de un minuto.</h2>
        <p>Te mostramos dónde vender, cargar productos, controlar la caja y configurar el sistema. Este recorrido se ofrece automáticamente solamente durante tu primer día.</p>
        <div className={styles.welcomePoints}>
          <div className={styles.welcomePoint}><b>1 · Ubicate</b><span>La pantalla se enfoca en cada sector importante.</span></div>
          <div className={styles.welcomePoint}><b>2 · Probá</b><span>Podés seguir el recorrido o tocar el sistema por tu cuenta.</span></div>
          <div className={styles.welcomePoint}><b>3 · Seguí solo</b><span>En cualquier momento podés salir y explorar libremente.</span></div>
        </div>
        <div className={styles.welcomeActions}><button type="button" className={styles.primary} onClick={startTour}>Empezar recorrido</button><button type="button" className={styles.secondary} onClick={explore}>Explorar por mi cuenta</button></div>
      </section>
    </div>}

    {currentStep&&<div className={styles.tourOverlay} style={{background:targetRect?'transparent':'rgba(13,8,16,.72)'}} role="presentation">
      {targetRect&&<div className={styles.highlight} style={highlightStyle}/>}<section className={styles.tourCard} style={tourCardStyle} role="dialog" aria-modal="true">
        <div className={styles.tourMeta}><span>Paso {tourIndex!+1} de {TOUR_STEPS.length}</span><button type="button" onClick={skipTour}>Explorar por mi cuenta</button></div>
        <h3>{currentStep.title}</h3><p>{currentStep.text}</p>
        <div className={styles.tourDots}>{TOUR_STEPS.map((_,index)=><i key={index} className={index<=tourIndex!?styles.tourDotActive:styles.tourDot}/>)}</div>
        <div className={styles.tourActions}>{tourIndex!>0?<button type="button" className={styles.secondary} onClick={prevTour}>Atrás</button>:<span/>}<button type="button" className={styles.primary} onClick={nextTour}>{tourIndex===TOUR_STEPS.length-1?'Terminar':'Siguiente'}</button></div>
      </section>
    </div>}

    {tourComplete&&<div className={styles.welcomeOverlay} role="presentation"><section className={styles.completeCard} role="dialog" aria-modal="true">
      <div className={styles.completeIcon}><UiIcon name="check" size={25}/></div><h3>Ya conocés lo esencial.</h3><p>Podés empezar a trabajar o abrir la lista corta de primeros pasos. Mañana este asistente ya no se mostrará automáticamente.</p>
      <div className={styles.completeActions}><button type="button" className={styles.secondary} onClick={()=>{setTourComplete(false);setChecklistOpen(true)}}>Ver primeros pasos</button><button type="button" className={styles.primary} onClick={goToSale}>Ir a Nueva venta</button></div>
    </section></div>}

    {introSeen&&!welcomeOpen&&tourIndex===null&&!tourComplete&&(checklistOpen?<aside className={styles.checklist} aria-label="Primeros pasos de Comercio Lleno">
      <div className={styles.checkHead}><div className={styles.checkTitle}><div><b>Primeros pasos</b><small>{essentialDone===3?'Lo esencial ya está listo':`${essentialDone} de 3 esenciales completos`}</small></div><div className={styles.checkActions}><button type="button" onClick={()=>setChecklistOpen(false)} aria-label="Minimizar">−</button><button type="button" onClick={()=>setDismissConfirmOpen(true)} aria-label="Cerrar Primeros pasos">×</button></div></div><div className={styles.checkBar}><i style={{width:`${essentialPercent}%`}}/></div></div>
      <div className={styles.checkBody}>
        <button type="button" className={`${styles.checkRow} ${progress.company?styles.checkRowDone:''}`} onClick={()=>checklistAction('company')}><span className={styles.checkMark}>{progress.company?<UiIcon name="check" size={14}/>:<b>01</b>}</span><span className={styles.checkCopy}><b>Datos del comercio</b><small>{progress.company?'Listo':'Completá los datos básicos'}</small></span></button>
        <button type="button" className={`${styles.checkRow} ${progress.product?styles.checkRowDone:''}`} onClick={()=>checklistAction('product')}><span className={styles.checkMark}>{progress.product?<UiIcon name="check" size={14}/>:<b>02</b>}</span><span className={styles.checkCopy}><b>Cargar primer producto</b><small>{progress.product?'Listo':'Con uno alcanza para empezar'}</small></span></button>
        <button type="button" className={`${styles.checkRow} ${progress.sale?styles.checkRowDone:''}`} onClick={()=>checklistAction('sale')}><span className={styles.checkMark}>{progress.sale?<UiIcon name="check" size={14}/>:<b>03</b>}</span><span className={styles.checkCopy}><b>Hacer primera venta</b><small>{progress.sale?'Listo':'Probá el flujo completo de cobro'}</small></span></button>
        <button type="button" className={`${styles.checkRow} ${progress.printer?styles.checkRowDone:''}`} onClick={()=>checklistAction('printer')}><span className={styles.checkMark}><UiIcon name="printer" size={14}/></span><span className={styles.checkCopy}><b>Conectar impresora</b><small>{progress.printer?'Configurada':'Podés hacerlo cuando la necesites'}</small></span>{!progress.printer&&<span className={styles.optional}>OPCIONAL</span>}</button>
        <button type="button" className={`${styles.checkRow} ${progress.arca?styles.checkRowDone:''}`} onClick={()=>checklistAction('arca')}><span className={styles.checkMark}><b>AR</b></span><span className={styles.checkCopy}><b>Conectar ARCA</b><small>{progress.arca?'Conectado':'Solo cuando quieras facturar electrónicamente'}</small></span>{!progress.arca&&<span className={styles.optional}>OPCIONAL</span>}</button>
        <div className={styles.checkFooter}><button type="button" className={styles.tourAgain} onClick={startTour}>Repetir recorrido</button><button type="button" className={styles.saleNow} onClick={goToSale}>Nueva venta</button></div>
      </div>
    </aside>:<div className={styles.launcherWrap}><button type="button" className={styles.launcher} onClick={()=>setChecklistOpen(true)}><span className={styles.launcherIcon}><UiIcon name={essentialDone===3?'check':'sparkles'} size={17}/></span><span className={styles.launcherCopy}><b>Primeros pasos</b><small>{essentialDone===3?'Lo esencial está listo':'Seguí donde lo dejaste'}</small></span><span className={styles.launcherProgress}>{essentialDone}/3</span></button><button type="button" className={styles.launcherClose} aria-label="Cerrar Primeros pasos" title="Cerrar Primeros pasos" onClick={()=>setDismissConfirmOpen(true)}>×</button></div>)}

    {dismissConfirmOpen&&<div className={styles.welcomeOverlay} role="presentation"><section className={styles.dismissCard} role="dialog" aria-modal="true" aria-labelledby="dismiss-first-steps">
      <span className={styles.eyebrow}>PRIMEROS PASOS</span><h3 id="dismiss-first-steps">¿Querés quitar este asistente?</h3><p>Podés cerrarlo por esta sesión o indicar que no vuelva a mostrarse en este dispositivo. De todas formas, el onboarding automático está limitado al primer día.</p>
      <div className={styles.dismissActions}><button type="button" className={styles.secondary} onClick={closeForToday}>Cerrar por hoy</button><button type="button" className={styles.dismissNever} onClick={closeForever}>No volver a mostrar</button></div>
    </section></div>}
  </>
}
