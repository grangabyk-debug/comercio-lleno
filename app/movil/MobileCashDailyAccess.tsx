'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { closeCashRegister, loadCommerceSnapshot } from '@/lib/comercio/api'
import { loadSalesSettings, readCachedSalesSettings, type CashMode } from '@/lib/comercio/sales-settings'
import { readTenantSession } from '@/lib/comercio/session'

type CashRegisterState = Awaited<ReturnType<typeof loadCommerceSnapshot>>['cashRegister']

function compact(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toLowerCase()}
function effective(mode:CashMode){return mode==='manual'?'manual':'automatic'}

export default function MobileCashDailyAccess(){
  const[mode,setMode]=useState<'manual'|'automatic'>('automatic')
  const[cash,setCash]=useState<CashRegisterState>(null)
  const[homeHost,setHomeHost]=useState<HTMLElement|null>(null)
  const[cashHost,setCashHost]=useState<HTMLElement|null>(null)
  const[busy,setBusy]=useState(false)
  const[message,setMessage]=useState('')
  const timer=useRef<number|undefined>(undefined)

  function notify(value:string){setMessage(value);if(timer.current)window.clearTimeout(timer.current);timer.current=window.setTimeout(()=>setMessage(''),2400)}

  async function refresh(){
    const session=readTenantSession();if(!session)return
    try{
      const[settings,snapshot]=await Promise.all([loadSalesSettings(session).catch(()=>readCachedSalesSettings(session.companyId)),loadCommerceSnapshot(session)])
      setMode(effective(settings.cashMode));setCash(snapshot.cashRegister)
    }catch{}
  }

  function removeHosts(){
    document.querySelector('[data-mobile-cash-home-host]')?.remove()
    document.querySelector('[data-mobile-cash-view-host]')?.remove()
    setHomeHost(null);setCashHost(null)
  }

  function syncHosts(currentMode=mode){
    if(currentMode!=='manual'){removeHosts();return}
    const greeting=document.querySelector('div[class*="greeting"]') as HTMLElement|null
    if(greeting){
      let host=document.querySelector('[data-mobile-cash-home-host]') as HTMLElement|null
      if(!host){host=document.createElement('div');host.dataset.mobileCashHomeHost='1';greeting.insertAdjacentElement('afterend',host)}
      setHomeHost(host)
    }else setHomeHost(null)

    const cashHero=document.querySelector('div[class*="cashHero"]') as HTMLElement|null
    if(cashHero){
      let host=document.querySelector('[data-mobile-cash-view-host]') as HTMLElement|null
      if(!host){host=document.createElement('div');host.dataset.mobileCashViewHost='1';cashHero.insertAdjacentElement('beforebegin',host)}
      setCashHost(host)
      const section=cashHero.parentElement
      const heading=section?.querySelector('[class*="sectionHead"] h2')
      const eyebrow=section?.querySelector('[class*="sectionHead"] span, [class*="sectionHead"] small')
      if(heading&&compact(heading.textContent||'')==='movimientos')heading.textContent='Caja diaria'
      if(eyebrow&&compact(eyebrow.textContent||'')==='hoy')eyebrow.textContent='CAJA MANUAL'
    }else setCashHost(null)
  }

  useEffect(()=>{
    const session=readTenantSession();if(!session)return
    const cached=readCachedSalesSettings(session.companyId)
    const initial=effective(cached.cashMode);setMode(initial);void refresh()
    const observer=new MutationObserver(()=>syncHosts(initial))
    observer.observe(document.body,{childList:true,subtree:true})
    window.setTimeout(()=>syncHosts(initial),120)

    const onSettings=(event:Event)=>{
      const next=effective((event as CustomEvent<{cashMode?:CashMode}>).detail?.cashMode||'automatic')
      setMode(next);window.setTimeout(()=>syncHosts(next),0);void refresh()
    }
    const onStatus=(event:Event)=>{
      const open=Boolean((event as CustomEvent<{open?:boolean}>).detail?.open)
      setCash(current=>current?{...current,status:open?'open':'closed'}:current)
      void refresh()
    }
    window.addEventListener('comercio:sales-settings',onSettings)
    window.addEventListener('comercio:mobile-cash-status',onStatus)
    return()=>{observer.disconnect();window.removeEventListener('comercio:sales-settings',onSettings);window.removeEventListener('comercio:mobile-cash-status',onStatus);if(timer.current)window.clearTimeout(timer.current);removeHosts()}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  useEffect(()=>{syncHosts(mode)},[mode])

  function goToCash(){
    const buttons=Array.from(document.querySelectorAll('button')) as HTMLButtonElement[]
    const target=buttons.find(button=>compact(button.textContent||'').startsWith('movimientos'))
    target?.click();window.setTimeout(()=>syncHosts('manual'),80)
  }

  async function closeCash(){
    const session=readTenantSession();if(!session||!cash||cash.status!=='open')return
    setBusy(true)
    try{
      const closed=await closeCashRegister(session,cash);setCash(closed);notify('Caja cerrada correctamente.');window.dispatchEvent(new Event('comercio:mobile-cash-refresh'))
    }catch(error){notify(error instanceof Error?error.message:'No se pudo cerrar la caja.')}finally{setBusy(false)}
  }

  if(mode!=='manual')return message?<div style={toastStyle}>{message}</div>:null
  const open=cash?.status==='open'

  return <>
    {homeHost&&createPortal(<div style={homeCardStyle}>
      <div><span style={eyebrowStyle}>CAJA MANUAL</span><b style={{display:'block',fontSize:14,marginTop:2}}>{open?'Caja abierta':'Caja cerrada'}</b><small style={{display:'block',marginTop:2,opacity:.72,fontSize:9}}>{open?'Las ventas quedan asociadas a la caja del día.':'Abrila antes de cobrar o facturar.'}</small></div>
      <button type="button" onClick={goToCash} style={homeButtonStyle}>Caja diaria</button>
    </div>,homeHost)}

    {cashHost&&createPortal(<div style={cashCardStyle}>
      <div><span style={eyebrowStyle}>ESTADO ACTUAL</span><h3 style={{margin:'4px 0 3px',fontSize:20}}>{open?'Caja abierta':'Caja cerrada'}</h3><p style={{margin:0,fontSize:10,opacity:.72}}>{open?'Podés cobrar y facturar normalmente.':'Abrí la caja antes de registrar una venta.'}</p></div>
      {!open?<button type="button" onClick={()=>window.dispatchEvent(new Event('comercio:mobile-open-cash'))} style={primaryButtonStyle}>Abrir nueva caja</button>:<button type="button" disabled={busy} onClick={()=>void closeCash()} style={secondaryButtonStyle}>{busy?'Cerrando…':'Cerrar caja'}</button>}
    </div>,cashHost)}
    {message&&<div style={toastStyle}>{message}</div>}
  </>
}

const homeCardStyle:React.CSSProperties={margin:'10px 0 12px',padding:'11px 12px',border:'1px solid #5a3844',borderRadius:14,background:'linear-gradient(135deg,#27181d,#1c151f)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,boxShadow:'0 10px 24px rgba(0,0,0,.16)'}
const cashCardStyle:React.CSSProperties={margin:'0 0 12px',padding:14,border:'1px solid #5a3844',borderRadius:16,background:'linear-gradient(135deg,#27181d,#1c151f)',color:'#fff',boxShadow:'0 12px 28px rgba(0,0,0,.18)'}
const eyebrowStyle:React.CSSProperties={fontSize:8,fontWeight:950,letterSpacing:'.12em',color:'#ff735c'}
const homeButtonStyle:React.CSSProperties={border:0,borderRadius:11,background:'#ff641d',color:'#fff',fontWeight:900,minHeight:40,padding:'0 13px',fontSize:10}
const primaryButtonStyle:React.CSSProperties={width:'100%',marginTop:12,minHeight:44,border:0,borderRadius:12,background:'#ff641d',color:'#fff',fontWeight:900}
const secondaryButtonStyle:React.CSSProperties={width:'100%',marginTop:12,minHeight:44,border:'1px solid #ff7d68',borderRadius:12,background:'#2d1c21',color:'#ff9d8c',fontWeight:900}
const toastStyle:React.CSSProperties={position:'fixed',zIndex:12060,left:'50%',top:18,transform:'translateX(-50%)',maxWidth:'calc(100vw - 28px)',padding:'11px 15px',borderRadius:14,background:'#171218',color:'#fff',fontSize:12,fontWeight:850,boxShadow:'0 12px 34px rgba(0,0,0,.25)',textAlign:'center'}
