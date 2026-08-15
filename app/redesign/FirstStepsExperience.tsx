'use client'

import { useCallback,useEffect,useMemo,useState } from 'react'
import { checkArcaHealth } from '@/lib/comercio/api'
import { readTenantSession } from '@/lib/comercio/session'
import type { TenantSession,ViewKey } from '@/lib/comercio/types'
import styles from './FirstStepsExperience.module.css'

const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL??'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

type ProgressState={company:boolean;product:boolean;sale:boolean;printer:boolean;arca:boolean;loaded:boolean}
type TargetRect={top:number;left:number;right:number;bottom:number;width:number;height:number}
type Tip={key:string;title:string;text:string}

type TourStep={key:'sale'|'products'|'cash'|'settings';title:string;text:string}
const TOUR_STEPS:TourStep[]=[
  {key:'sale',title:'Tu venta empieza acá',text:'Desde Nueva venta buscás o escaneás productos, elegís el medio de pago y registrás el cobro. Es la pantalla que más vas a usar.'},
  {key:'products',title:'Acá armás tu catálogo',text:'En Productos cargás artículos, precios y stock. Podés empezar con uno solo y después importar o completar el resto.'},
  {key:'cash',title:'Caja clara desde el primer día',text:'Caja diaria te muestra apertura, movimientos y cierre. Cuando quieras operar como en el local real, abrís la caja con el monto inicial.'},
  {key:'settings',title:'Lo técnico puede esperar',text:'En Configuración están la impresora, ARCA y otros ajustes. Durante la prueba no necesitás conectar impresora ni ARCA para conocer el sistema.'},
]

const CONTEXT_TIPS:Record<string,Tip>={
  sale:{key:'sale',title:'Primera venta',text:'Buscá o escaneá un producto, agregalo al carrito y elegí cómo te pagan. No necesitás ARCA ni impresora para probar el flujo.'},
  products:{key:'products',title:'Productos',text:'Podés cargar un producto manualmente para probar rápido. Después tenés opciones para trabajar con muchos artículos.'},
  cash:{key:'cash',title:'Caja diaria',text:'Cuando quieras simular una jornada real, abrí la caja con el efectivo inicial. Si solo estás explorando, podés volver más tarde.'},
  settings:{key:'settings',title:'Configuración',text:'Impresora y ARCA están acá, pero son opcionales durante la prueba. Configuralos recién cuando los necesites.'},
}

function normalize(value:string){return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()}
function clickButton(label:string){const wanted=normalize(label),buttons=Array.from(document.querySelectorAll('button')) as HTMLButtonElement[];const target=buttons.find(b=>normalize(b.textContent||'')===wanted)||buttons.find(b=>normalize(b.textContent||'').includes(wanted));if(!target)return false;target.click();return true}
function navigate(view:ViewKey,secondary?:string){window.dispatchEvent(new CustomEvent<ViewKey>('comercio:navigate-view',{detail:view}));if(secondary)window.setTimeout(()=>clickButton(secondary),260)}
function oldKeyCleanup(companyId:string){
  ;[`cl_setup_minimized_${companyId}`,`cl_setup_hidden_${companyId}`,`cl_setup_steps_${companyId}`,`cl_setup_deferred_${companyId}`].forEach(key=>localStorage.removeItem(key))
  sessionStorage.removeItem(`cl_onboarding_active_step_${companyId}`)
  sessionStorage.removeItem(`cl_resume_onboarding_${companyId}`)
}

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
  const[tip,setTip]=useState<Tip|null>(null)
  const[dismissConfirmOpen,setDismissConfirmOpen]=useState(false)
  const[dismissed,setDismissed]=useState(false)

  useEffect(()=>{
    const active=readTenantSession();if(!active||active.role!=='owner')return
    setSession(active)
    oldKeyCleanup(active.companyId)
    const neverShow=localStorage.getItem(`cl_first_steps_v2_never_show_${active.companyId}`)==='1'
    const closedThisSession=sessionStorage.getItem(`cl_first_steps_v2_closed_session_${active.companyId}`)==='1'
    if(neverShow||closedThisSession){setDismissed(true);return}
    const seen=localStorage.getItem(`cl_first_steps_v2_intro_${active.companyId}`)==='1'
    setIntroSeen(seen)
    if(!seen)window.setTimeout(()=>setWelcomeOpen(true),700)
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
    }catch{
      setProgress(current=>({...current,loaded:true}))
    }
  },[session])

  useEffect(()=>{
    if(!session||dismissed)return
    void refreshProgress()
    const refreshLater=()=>window.setTimeout(()=>void refreshProgress(),900)
    const timer=window.setInterval(()=>void refreshProgress(),30000)
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
      const cardWidth=Math.min(360,window.innerWidth-28),cardHeight=245,gap=18
      let left=rect.right+gap,top=Math.max(14,Math.min(rect.top,window.innerHeight-cardHeight-14))
      if(left+cardWidth>window.innerWidth-14){left=rect.left-cardWidth-gap}
      if(left<14){left=Math.max(14,Math.min(rect.left,window.innerWidth-cardWidth-14));top=Math.min(window.innerHeight-cardHeight-14,rect.bottom+gap)}
      setCardPos({left,top:Math.max(14,top)})
    }
    update()
    const timer=window.setInterval(update,300)
    window.addEventListener('resize',update)
    window.addEventListener('scroll',update,true)
    return()=>{window.clearInterval(timer);window.removeEventListener('resize',update);window.removeEventListener('scroll',update,true)}
  },[tourIndex])

  useEffect(()=>{
    if(!session||!introSeen||dismissed)return
    const handle=(event:MouseEvent)=>{
      if(tourIndex!==null||welcomeOpen||tourComplete)return
      const target=(event.target as HTMLElement|null)?.closest?.('[data-tour-context]') as HTMLElement|null
      const key=target?.dataset.tourContext||''
      const next=CONTEXT_TIPS[key]
      if(!next)return
      const storageKey=`cl_first_steps_v2_tip_${session.companyId}_${key}`
      if(localStorage.getItem(storageKey)==='1')return
      localStorage.setItem(storageKey,'1')
      window.setTimeout(()=>setTip(next),420)
    }
    document.addEventListener('click',handle,true)
    return()=>document.removeEventListener('click',handle,true)
  },[session,introSeen,dismissed,tourIndex,welcomeOpen,tourComplete])

  useEffect(()=>{if(!tip)return;const timer=window.setTimeout(()=>setTip(null),6500);return()=>window.clearTimeout(timer)},[tip])

  const essentialDone=useMemo(()=>[progress.company,progress.product,progress.sale].filter(Boolean).length,[progress])
  const essentialPercent=Math.round(essentialDone/3*100)

  function rememberIntro(){if(!session)return;localStorage.setItem(`cl_first_steps_v2_intro_${session.companyId}`,'1');setIntroSeen(true)}
  function rememberTour(){if(!session)return;localStorage.setItem(`cl_first_steps_v2_tour_${session.companyId}`,'1')}
  function startTour(){rememberIntro();setWelcomeOpen(false);setTourComplete(false);setChecklistOpen(false);setTip(null);setTourIndex(0)}
  function explore(){rememberIntro();rememberTour();setWelcomeOpen(false);setChecklistOpen(false)}
  function skipTour(){rememberTour();setTourIndex(null);setChecklistOpen(false)}
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
  function closeForThisSession(){
    if(!session)return
    sessionStorage.setItem(`cl_first_steps_v2_closed_session_${session.companyId}`,'1')
    setDismissConfirmOpen(false)
    setChecklistOpen(false)
    setWelcomeOpen(false)
    setTourIndex(null)
    setTourComplete(false)
    setTip(null)
    setDismissed(true)
  }
  function closeForever(){
    if(!session)return
    localStorage.setItem(`cl_first_steps_v2_never_show_${session.companyId}`,'1')
    closeForThisSession()
  }

  if(!session||dismissed)return null
  const currentStep=tourIndex===null?null:TOUR_STEPS[tourIndex]
  const highlightStyle=targetRect?{top:targetRect.top-6,left:targetRect.left-6,width:targetRect.width+12,height:targetRect.height+12}:undefined
  const tourCardStyle=cardPos?{top:cardPos.top,left:cardPos.left}:undefined

  return <>
    {welcomeOpen&&<div className={styles.welcomeOverlay} role="presentation"><section className={styles.welcomeCard} role="dialog" aria-modal="true" aria-labelledby="first-steps-welcome"><span className={styles.eyebrow}>PRIMEROS PASOS · COMERCIO LLENO</span><h2 id="first-steps-welcome">Conocé lo esencial en menos de un minuto.</h2><p>No hace falta configurar todo antes de probar. Primero te mostramos dónde vender, cargar productos y controlar la caja. La impresora y ARCA pueden esperar.</p><div className={styles.welcomePoints}><div className={styles.welcomePoint}><b>1 · Ubicate</b><span>Un recorrido corto sobre la pantalla real.</span></div><div className={styles.welcomePoint}><b>2 · Probá</b><span>Cargá un producto y hacé una venta.</span></div><div className={styles.welcomePoint}><b>3 · Configurá después</b><span>ARCA e impresora son opcionales en la prueba.</span></div></div><div className={styles.welcomeActions}><button type="button" className={styles.primary} onClick={startTour}>Empezar recorrido</button><button type="button" className={styles.secondary} onClick={explore}>Explorar por mi cuenta</button></div></section></div>}

    {currentStep&&<div className={styles.tourOverlay} style={{background:targetRect?'transparent':'rgba(7,15,24,.66)'}} role="presentation">
      {targetRect&&<div className={styles.highlight} style={highlightStyle}/>}<section className={styles.tourCard} style={tourCardStyle} role="dialog" aria-modal="true"><div className={styles.tourMeta}><span>Paso {tourIndex!+1} de {TOUR_STEPS.length}</span><button type="button" onClick={skipTour}>Omitir recorrido</button></div><h3>{currentStep.title}</h3><p>{currentStep.text}</p><div className={styles.tourDots}>{TOUR_STEPS.map((_,index)=><i key={index} className={index<=tourIndex!?styles.tourDotActive:styles.tourDot}/>)}</div><div className={styles.tourActions}>{tourIndex!>0?<button type="button" className={styles.secondary} onClick={prevTour}>Atrás</button>:<span/>}<button type="button" className={styles.primary} onClick={nextTour}>{tourIndex===TOUR_STEPS.length-1?'Terminar':'Siguiente'}</button></div></section>
    </div>}

    {tourComplete&&<div className={styles.welcomeOverlay} role="presentation"><section className={styles.completeCard} role="dialog" aria-modal="true"><div className={styles.completeIcon}>✓</div><h3>Ya conocés lo esencial.</h3><p>La mejor forma de entender Comercio Lleno ahora es usarlo. Probá cargar un producto y registrar tu primera venta; la impresora y ARCA pueden configurarse más adelante.</p><div className={styles.completeActions}><button type="button" className={styles.secondary} onClick={()=>{setTourComplete(false);setChecklistOpen(true)}}>Ver primeros pasos</button><button type="button" className={styles.primary} onClick={goToSale}>Ir a Nueva venta</button></div></section></div>}

    {introSeen&&!welcomeOpen&&tourIndex===null&&!tourComplete&&(checklistOpen?<aside className={styles.checklist} aria-label="Primeros pasos de Comercio Lleno"><div className={styles.checkHead}><div className={styles.checkTitle}><div><b>Primeros pasos</b><small>{essentialDone===3?'Lo esencial ya está listo':`${essentialDone} de 3 esenciales completos`}</small></div><div className={styles.checkActions}><button type="button" onClick={()=>setChecklistOpen(false)} aria-label="Minimizar">—</button><button type="button" onClick={()=>setDismissConfirmOpen(true)} aria-label="Cerrar Primeros pasos">×</button></div></div><div className={styles.checkBar}><i style={{width:`${essentialPercent}%`}}/></div></div><div className={styles.checkBody}>
      <button type="button" className={`${styles.checkRow} ${progress.company?styles.checkRowDone:''}`} onClick={()=>checklistAction('company')}><span className={styles.checkMark}>{progress.company?'✓':'1'}</span><span className={styles.checkCopy}><b>Datos del comercio</b><small>{progress.company?'Listo':'Completá los datos básicos'}</small></span></button>
      <button type="button" className={`${styles.checkRow} ${progress.product?styles.checkRowDone:''}`} onClick={()=>checklistAction('product')}><span className={styles.checkMark}>{progress.product?'✓':'2'}</span><span className={styles.checkCopy}><b>Cargar primer producto</b><small>{progress.product?'Listo':'Con uno alcanza para empezar'}</small></span></button>
      <button type="button" className={`${styles.checkRow} ${progress.sale?styles.checkRowDone:''}`} onClick={()=>checklistAction('sale')}><span className={styles.checkMark}>{progress.sale?'✓':'3'}</span><span className={styles.checkCopy}><b>Hacer primera venta</b><small>{progress.sale?'Listo':'Probá el flujo completo de cobro'}</small></span></button>
      <button type="button" className={`${styles.checkRow} ${progress.printer?styles.checkRowDone:''}`} onClick={()=>checklistAction('printer')}><span className={styles.checkMark}>{progress.printer?'✓':'▤'}</span><span className={styles.checkCopy}><b>Conectar impresora</b><small>{progress.printer?'Configurada':'Podés hacerlo cuando la necesites'}</small></span>{!progress.printer&&<span className={styles.optional}>OPCIONAL</span>}</button>
      <button type="button" className={`${styles.checkRow} ${progress.arca?styles.checkRowDone:''}`} onClick={()=>checklistAction('arca')}><span className={styles.checkMark}>{progress.arca?'✓':'A'}</span><span className={styles.checkCopy}><b>Conectar ARCA</b><small>{progress.arca?'Conectado':'Solo cuando quieras facturar electrónicamente'}</small></span>{!progress.arca&&<span className={styles.optional}>OPCIONAL</span>}</button>
      <div className={styles.checkFooter}><button type="button" className={styles.tourAgain} onClick={startTour}>Repetir recorrido</button><button type="button" className={styles.saleNow} onClick={goToSale}>Nueva venta</button></div>
    </div></aside>:<button type="button" className={styles.launcher} onClick={()=>setChecklistOpen(true)}><span className={styles.launcherIcon}>{essentialDone===3?'✓':'↗'}</span><span className={styles.launcherCopy}><b>Primeros pasos</b><small>{essentialDone===3?'Lo esencial está listo':'Seguí donde lo dejaste'}</small></span><span className={styles.launcherProgress}>{essentialDone}/3</span></button>)}

    {dismissConfirmOpen&&<div className={styles.welcomeOverlay} role="presentation"><section className={styles.dismissCard} role="dialog" aria-modal="true" aria-labelledby="dismiss-first-steps"><span className={styles.eyebrow}>PRIMEROS PASOS</span><h3 id="dismiss-first-steps">¿Cerrar y no volver a mostrar?</h3><p>Si elegís <b>No</b>, se cierra por ahora y volverá a aparecer cuando abras Comercio Lleno en una nueva sesión. Si elegís <b>Sí</b>, no volveremos a mostrar este panel en este dispositivo.</p><div className={styles.dismissActions}><button type="button" className={styles.secondary} onClick={closeForThisSession}>No</button><button type="button" className={styles.dismissNever} onClick={closeForever}>Sí, no volver a mostrar</button></div></section></div>}

    {tip&&<aside className={styles.contextTip} aria-live="polite"><i>i</i><div><b>{tip.title}</b><span>{tip.text}</span></div><button type="button" onClick={()=>setTip(null)} aria-label="Cerrar">×</button></aside>}
  </>
}