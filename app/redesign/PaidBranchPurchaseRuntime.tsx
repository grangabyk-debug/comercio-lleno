'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { readTenantSession } from '@/lib/comercio/session'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const PRICE = 4900

function money(value:number){return new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(value)}

function normalizeDashboardCopy(){
  if(location.pathname!=='/redesign')return
  const branchRoot=document.querySelector<HTMLElement>('[data-branch-settings-runtime="true"]')
  if(branchRoot){
    branchRoot.querySelectorAll<HTMLElement>('*').forEach(el=>{
      const text=(el.textContent||'').trim()
      if(text==='Dos sucursales están incluidas sin costo extra.')el.textContent='Una sucursal está incluida sin costo.'
      if(text==='Desde la tercera se aplica un costo adicional. Productos y carga de stock siguen siendo ilimitados. Máximo 5 sucursales por comercio.')el.textContent=`Cada sucursal adicional cuesta ${money(PRICE)}. Productos y carga de stock siguen siendo ilimitados. Máximo 5 sucursales por comercio.`
      if(text==='2'&&el.parentElement?.textContent?.includes('sucursales'))el.textContent='1'
    })
    const items=Array.from(branchRoot.querySelectorAll<HTMLElement>('article'))
    items.forEach((item,index)=>{
      if(index===0)return
      item.querySelectorAll<HTMLElement>('span').forEach(span=>{
        if((span.textContent||'').trim()==='Incluida')span.textContent='Adicional'
      })
    })
  }

  document.querySelectorAll<HTMLElement>('button,a,[role="button"]').forEach(el=>{
    if((el.textContent||'').trim()==='WhatsApp oficial')el.style.setProperty('display','none','important')
  })
  document.querySelectorAll<HTMLElement>('label,p,small,span').forEach(el=>{
    const text=(el.textContent||'').trim()
    if(text==='WhatsApp del propietario'){
      const input=el.querySelector('input')
      if(input){
        const existingSmall=el.querySelector('small')
        const fragment=document.createDocumentFragment()
        fragment.append('Teléfono del propietario')
        fragment.append(input)
        if(existingSmall){existingSmall.textContent='Se usa como teléfono de contacto para envíos y cierres de caja.';fragment.append(existingSmall)}
        el.replaceChildren(fragment)
      }
    }
    if(text.includes('se usan también en tickets y funciones de WhatsApp.'))el.textContent=text.replace('se usan también en tickets y funciones de WhatsApp.','se usan también en tickets y funciones del sistema.')
  })
}

export default function PaidBranchPurchaseRuntime(){
  const[open,setOpen]=useState(false)
  const[name,setName]=useState('')
  const[address,setAddress]=useState('')
  const[busy,setBusy]=useState(false)
  const[error,setError]=useState('')
  const[purchaseId,setPurchaseId]=useState('')
  const[waiting,setWaiting]=useState(false)
  const pollRef=useRef<number|null>(null)

  useEffect(()=>{
    if(location.pathname!=='/redesign')return
    const capture=(event:MouseEvent)=>{
      const target=event.target instanceof Element?event.target.closest('button'):null
      if(!(target instanceof HTMLButtonElement))return
      if((target.textContent||'').trim()!=='Agregar sucursal')return
      if(!target.closest('[data-branch-settings-runtime="true"]'))return
      event.preventDefault();event.stopPropagation();event.stopImmediatePropagation()
      setError('');setPurchaseId('');setWaiting(false);setOpen(true)
    }
    normalizeDashboardCopy()
    const observer=new MutationObserver(()=>normalizeDashboardCopy())
    observer.observe(document.body,{subtree:true,childList:true,characterData:true})
    document.addEventListener('click',capture,true)
    return()=>{observer.disconnect();document.removeEventListener('click',capture,true)}
  },[])

  useEffect(()=>()=>{if(pollRef.current)window.clearInterval(pollRef.current)},[])

  async function api(action:'checkout'|'status',body:Record<string,unknown>){
    const session=readTenantSession()
    if(!session)throw new Error('La sesión venció. Volvé a ingresar.')
    const response=await fetch(`${SUPABASE_URL}/functions/v1/branch-purchase?action=${action}`,{
      method:'POST',
      headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${session.token}`,'Content-Type':'application/json'},
      body:JSON.stringify(body),
    })
    const data=await response.json().catch(()=>({}))
    if(!response.ok||!data?.ok)throw new Error(data?.error||'No se pudo completar la operación.')
    return data
  }

  async function verify(id=purchaseId){
    if(!id)return false
    try{
      const data=await api('status',{purchase_id:id})
      if(data.status==='approved'&&data.branch_id){
        if(pollRef.current)window.clearInterval(pollRef.current)
        pollRef.current=null
        setWaiting(false)
        location.reload()
        return true
      }
      return false
    }catch(e){setError(e instanceof Error?e.message:String(e));return false}
  }

  async function startCheckout(){
    if(!name.trim()||busy)return
    setBusy(true);setError('')
    const checkoutWindow=window.open('about:blank','_blank')
    try{
      const data=await api('checkout',{name:name.trim(),address:address.trim()})
      const id=String(data.purchase_id||'')
      setPurchaseId(id);setWaiting(true)
      if(checkoutWindow){checkoutWindow.opener=null;checkoutWindow.location.href=String(data.init_point)}
      else location.href=String(data.init_point)
      if(id){
        if(pollRef.current)window.clearInterval(pollRef.current)
        pollRef.current=window.setInterval(()=>{void verify(id)},3000)
      }
    }catch(e){
      if(checkoutWindow)checkoutWindow.close()
      setError(e instanceof Error?e.message:String(e))
    }finally{setBusy(false)}
  }

  if(!open||typeof document==='undefined')return null
  return createPortal(<div style={{position:'fixed',inset:0,zIndex:100000,display:'grid',placeItems:'center',padding:20,background:'rgba(10,12,18,.72)',backdropFilter:'blur(9px)'}} onMouseDown={e=>{if(e.currentTarget===e.target&&!waiting)setOpen(false)}}>
    <section style={{width:'min(500px,100%)',background:'#fff',borderRadius:22,padding:24,color:'#16171a',boxShadow:'0 28px 90px rgba(0,0,0,.32)',fontFamily:'Inter,system-ui,sans-serif'}}>
      <div style={{fontSize:11,fontWeight:900,letterSpacing:'.08em',color:'#6b49d9'}}>SUCURSAL ADICIONAL</div>
      <h2 style={{fontSize:27,lineHeight:1.08,margin:'10px 0 8px'}}>Agregá una nueva sucursal por {money(PRICE)}</h2>
      <p style={{margin:'0 0 18px',color:'#626772',lineHeight:1.5,fontSize:14}}>La primera sucursal está incluida. Las siguientes se habilitan una vez que Mercado Pago confirma el pago.</p>
      <label style={{display:'grid',gap:6,fontSize:12,fontWeight:800,marginBottom:12}}>Nombre de la sucursal<input autoFocus disabled={waiting} value={name} onChange={e=>setName(e.target.value)} placeholder="Ej: Sucursal Centro" style={{border:'1px solid #d9dce3',borderRadius:11,padding:'12px 13px',fontSize:14}}/></label>
      <label style={{display:'grid',gap:6,fontSize:12,fontWeight:800,marginBottom:16}}>Dirección <span style={{fontWeight:500,color:'#8a8e98'}}>(opcional)</span><input disabled={waiting} value={address} onChange={e=>setAddress(e.target.value)} placeholder="Ej: Av. Corrientes 1234" style={{border:'1px solid #d9dce3',borderRadius:11,padding:'12px 13px',fontSize:14}}/></label>
      {!waiting?<button type="button" disabled={busy||!name.trim()} onClick={()=>void startCheckout()} style={{width:'100%',border:0,borderRadius:12,padding:'14px 16px',background:'#009ee3',color:'#fff',fontSize:15,fontWeight:900,cursor:busy?'wait':'pointer'}}>{busy?'Abriendo Mercado Pago…':`Pagar ${money(PRICE)} con Mercado Pago`}</button>:<div style={{border:'1px solid #dce7ee',background:'#f5fbfe',borderRadius:14,padding:15}}><b style={{display:'block',fontSize:14}}>Esperando confirmación de Mercado Pago</b><span style={{display:'block',fontSize:12,color:'#68737b',marginTop:5,lineHeight:1.45}}>Cuando el pago quede aprobado, la sucursal se crea automáticamente y se habilita para configurar.</span><button type="button" onClick={()=>void verify()} style={{marginTop:12,width:'100%',border:'1px solid #009ee3',borderRadius:10,padding:'10px 12px',background:'#fff',color:'#0078aa',fontWeight:850,cursor:'pointer'}}>Verificar pago ahora</button></div>}
      {error&&<div style={{marginTop:12,padding:11,borderRadius:10,background:'#fff0f0',color:'#a33a3a',fontSize:12,fontWeight:700}}>{error}</div>}
      {!waiting&&<button type="button" onClick={()=>setOpen(false)} style={{marginTop:12,width:'100%',border:0,background:'transparent',padding:9,color:'#6b7079',fontWeight:800,cursor:'pointer'}}>Cancelar</button>}
    </section>
  </div>,document.body)
}
