'use client'

import { useEffect, useMemo, useState } from 'react'
import { readTenantSession } from '@/lib/comercio/session'
import styles from './trialStatus.module.css'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

type Subscription = {
  status:string
  trial_ends_at:string
  price_amount:number|string
  currency:string
  payment_method_added_at?:string|null
  billing_provider?:string|null
  provider_status?:string|null
}

const money = new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0})

export default function TrialStatus(){
  const [subscription,setSubscription]=useState<Subscription|null>(null)
  const [loaded,setLoaded]=useState(false)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const [now,setNow]=useState(Date.now())

  useEffect(()=>{
    const session=readTenantSession()
    if(!session){setLoaded(true);return}
    fetch(`${SUPABASE_URL}/rest/v1/company_subscriptions?company_id=eq.${encodeURIComponent(session.companyId)}&select=status,trial_ends_at,price_amount,currency,payment_method_added_at,billing_provider,provider_status&limit=1`,{
      headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${session.token}`},cache:'no-store',
    }).then(r=>r.ok?r.json():[]).then(rows=>setSubscription(Array.isArray(rows)?rows[0]||null:null)).catch(()=>{}).finally(()=>setLoaded(true))
    const timer=window.setInterval(()=>setNow(Date.now()),60_000)
    return()=>window.clearInterval(timer)
  },[])

  const days=useMemo(()=>subscription?.trial_ends_at?Math.max(0,Math.ceil((new Date(subscription.trial_ends_at).getTime()-now)/86_400_000)):0,[subscription,now])
  const price=Number(subscription?.price_amount || 14900)

  async function activate(){
    const session=readTenantSession()
    if(!session||busy)return
    setBusy(true);setError('')
    try{
      const response=await fetch(`${SUPABASE_URL}/functions/v1/mercadopago-subscription`,{
        method:'POST',
        headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${session.token}`,'Content-Type':'application/json'},
        body:JSON.stringify({action:'checkout'}),
      })
      const data=await response.json().catch(()=>({}))
      if(!response.ok||!data?.ok){
        if(data?.configured===false)throw new Error('Mercado Pago está preparado pero falta cargar la credencial de cobro antes de habilitarlo al público.')
        throw new Error(data?.error||'No se pudo iniciar la suscripción.')
      }
      if(data.active){
        setSubscription(current=>current?{...current,status:'active',provider_status:data.status,payment_method_added_at:new Date().toISOString()}:current)
        return
      }
      if(data.init_point){window.location.href=String(data.init_point);return}
      throw new Error('Mercado Pago no devolvió el enlace para asociar la tarjeta.')
    }catch(e){setError(e instanceof Error?e.message:String(e))}
    finally{setBusy(false)}
  }

  if(!loaded||!subscription)return null
  if(subscription.status==='active')return null
  if(subscription.status!=='trialing'&&subscription.status!=='expired')return null

  const expired=subscription.status==='expired'||days<=0
  const warning=!expired&&days<=5
  const hasPayment=Boolean(subscription.payment_method_added_at)||subscription.provider_status==='authorized'
  return <div className={`${styles.pill} ${expired?styles.danger:warning?styles.warning:''}`}>
    <i className={styles.dot}/>
    {expired?<><b>Prueba finalizada</b><span>Activá el plan de {money.format(price)}/mes para seguir usando Comercio Lleno.</span><button className={styles.button} disabled={busy} onClick={activate}>{busy?'Abriendo Mercado Pago…':'Activar con tarjeta'}</button></>:<><b>Prueba gratis</b><span>{days} día{days===1?'':'s'} restante{days===1?'':'s'} · luego {money.format(price)}/mes</span>{!hasPayment&&<button className={styles.button} disabled={busy} onClick={activate}>{busy?'Abriendo…':'Asociar tarjeta'}</button>}</>}
    {error&&<span title={error}> · {error}</span>}
  </div>
}
