'use client'

import { useEffect, useState } from 'react'
import { readTenantSession } from '@/lib/comercio/session'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

type Feature = 'products_unlimited' | 'fiscal_2500'
type Limits = {
  managed?: boolean
  legacy?: boolean
  product_count?: number
  product_limit?: number
  products_unlimited?: boolean
  fiscal_count?: number
  fiscal_limit?: number
  fiscal_extended?: boolean
  fiscal_extended_limit?: number
  upgrade_price?: number
}

export default function PromoLimitsRuntime(){
  const [limits,setLimits]=useState<Limits|null>(null)
  const [productsView,setProductsView]=useState(false)
  const [feature,setFeature]=useState<Feature|null>(null)
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const session=typeof window!=='undefined'?readTenantSession():null

  async function load(){
    if(!session)return
    try{
      const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_promo_usage_limits`,{method:'POST',headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${session.token}`,'Content-Type':'application/json'},body:'{}',cache:'no-store'})
      if(response.ok)setLimits(await response.json())
    }catch{}
  }

  async function buy(next:Feature){
    if(!session||busy)return
    setBusy(true);setMessage('')
    try{
      const response=await fetch(`${SUPABASE_URL}/functions/v1/feature-purchase`,{method:'POST',headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${session.token}`,'Content-Type':'application/json'},body:JSON.stringify({action:'checkout',feature:next})})
      const data=await response.json().catch(()=>({}))
      if(data?.already_unlocked||data?.status==='approved'){await load();setFeature(null);setMessage('La ampliación ya está habilitada.');return}
      if(!response.ok||!data?.init_point||!data?.purchase_id)throw new Error(data?.error||'No se pudo iniciar el pago.')
      const win=window.open(data.init_point,'comercio-lleno-upgrade','width=520,height=760,noopener,noreferrer')
      if(!win)location.href=data.init_point
      const purchaseId=String(data.purchase_id)
      const started=Date.now()
      const timer=window.setInterval(async()=>{
        if(Date.now()-started>12*60*1000){window.clearInterval(timer);setBusy(false);setMessage('El pago sigue pendiente. Podés volver a verificarlo entrando nuevamente a la ampliación.');return}
        try{
          const statusRes=await fetch(`${SUPABASE_URL}/functions/v1/feature-purchase`,{method:'POST',headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${session.token}`,'Content-Type':'application/json'},body:JSON.stringify({action:'status',feature:next,purchase_id:purchaseId})})
          const status=await statusRes.json().catch(()=>({}))
          if(status?.status==='approved'){
            window.clearInterval(timer);try{win?.close()}catch{};await load();setBusy(false);setFeature(null);setMessage(next==='products_unlimited'?'Productos ilimitados habilitados.':'Facturación ampliada hasta 2.500 comprobantes.');window.dispatchEvent(new Event('storage'))
          }
        }catch{}
      },3000)
    }catch(e){setMessage(e instanceof Error?e.message:String(e));setBusy(false)}
  }

  useEffect(()=>{void load()},[])

  useEffect(()=>{
    const check=()=>{
      const headings=Array.from(document.querySelectorAll('h1,h2'))
      setProductsView(headings.some(el=>/productos/i.test(el.textContent||'')))
      const text=document.body.innerText||''
      if(/LIMITE_PRODUCTOS_PROMO|l[ií]mite de 1[.]?000 productos/i.test(text))setFeature('products_unlimited')
      if(/l[ií]mite de (500|2[.]?500) facturas ARCA/i.test(text)&&/ampliar|4[.]?900/i.test(text))setFeature('fiscal_2500')
    }
    const observer=new MutationObserver(check);observer.observe(document.body,{childList:true,subtree:true,characterData:true});check()
    const onPaywall=(event:Event)=>{const value=(event as CustomEvent<{feature?:Feature}>).detail?.feature;if(value)setFeature(value)}
    const onRefresh=()=>void load()
    window.addEventListener('comercio:feature-paywall',onPaywall);window.addEventListener('storage',onRefresh)
    return()=>{observer.disconnect();window.removeEventListener('comercio:feature-paywall',onPaywall);window.removeEventListener('storage',onRefresh)}
  },[])

  if(!session||!limits?.managed)return null
  const productCount=Number(limits.product_count||0),productLimit=Number(limits.product_limit||1000)
  const showProductCard=productsView&&!limits.products_unlimited
  const selected=feature
  const isProducts=selected==='products_unlimited'

  return <>
    {showProductCard&&<div style={{position:'fixed',right:24,bottom:86,zIndex:90,width:280,padding:14,borderRadius:16,background:'rgba(20,18,25,.96)',color:'#fff',boxShadow:'0 12px 35px rgba(0,0,0,.22)',border:'1px solid rgba(255,255,255,.12)'}}>
      <div style={{fontSize:12,opacity:.72}}>PLAN IMPULSO · PRODUCTOS</div>
      <div style={{fontSize:18,fontWeight:800,marginTop:4}}>{productCount.toLocaleString('es-AR')} / {productLimit.toLocaleString('es-AR')}</div>
      <div style={{height:6,background:'rgba(255,255,255,.12)',borderRadius:99,overflow:'hidden',margin:'9px 0'}}><div style={{height:'100%',width:`${Math.min(100,productCount/productLimit*100)}%`,background:'#ff5a1f'}}/></div>
      {productCount>=productLimit&&<button onClick={()=>setFeature('products_unlimited')} style={{width:'100%',border:0,borderRadius:11,padding:'10px 12px',fontWeight:800,cursor:'pointer'}}>Desbloquear ilimitado · $4.900</button>}
    </div>}

    {selected&&<div style={{position:'fixed',inset:0,zIndex:10000,background:'rgba(8,7,10,.62)',display:'grid',placeItems:'center',padding:20}} onMouseDown={e=>e.target===e.currentTarget&&!busy&&setFeature(null)}>
      <div style={{width:'min(460px,100%)',background:'#fff',color:'#17131d',borderRadius:22,padding:24,boxShadow:'0 25px 70px rgba(0,0,0,.32)'}}>
        <div style={{fontSize:12,fontWeight:800,color:'#7a6c88'}}>AMPLIACIÓN DEL PLAN IMPULSO</div>
        <h3 style={{fontSize:24,margin:'7px 0 8px'}}>{isProducts?'Productos sin límite':'Más facturación ARCA'}</h3>
        <p style={{lineHeight:1.5,margin:'0 0 18px'}}>{isProducts?'Llegaste a los 1.000 productos incluidos. Con este pago habilitás la carga de productos sin límite para el comercio.':'Llegaste a las 500 facturas ARCA incluidas. Con este pago ampliás el límite hasta 2.500 comprobantes.'}</p>
        <div style={{fontSize:30,fontWeight:900,marginBottom:16}}>$4.900 <small style={{fontSize:13,fontWeight:600}}>ARS</small></div>
        {message&&<div style={{padding:10,borderRadius:10,background:'#f7f2fa',marginBottom:12,fontSize:13}}>{message}</div>}
        <button disabled={busy} onClick={()=>void buy(selected)} style={{width:'100%',border:0,borderRadius:13,padding:'13px 16px',fontWeight:900,fontSize:15,cursor:busy?'wait':'pointer',background:'#5b2ccf',color:'#fff'}}>{busy?'Esperando confirmación de Mercado Pago…':'Pagar $4.900 con Mercado Pago'}</button>
        <button disabled={busy} onClick={()=>setFeature(null)} style={{width:'100%',border:0,background:'transparent',padding:'11px',marginTop:4,cursor:'pointer'}}>Ahora no</button>
      </div>
    </div>}
  </>
}