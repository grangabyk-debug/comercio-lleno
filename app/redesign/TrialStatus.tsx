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
}

export default function TrialStatus(){
  const [subscription,setSubscription]=useState<Subscription|null>(null)
  const [loaded,setLoaded]=useState(false)
  const [now,setNow]=useState(Date.now())

  useEffect(()=>{
    const session=readTenantSession()
    if(!session){setLoaded(true);return}
    fetch(`${SUPABASE_URL}/rest/v1/company_subscriptions?company_id=eq.${encodeURIComponent(session.companyId)}&select=status,trial_ends_at,price_amount,currency,payment_method_added_at&limit=1`,{
      headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${session.token}`},cache:'no-store',
    }).then(r=>r.ok?r.json():[]).then(rows=>setSubscription(Array.isArray(rows)?rows[0]||null:null)).catch(()=>{}).finally(()=>setLoaded(true))
    const timer=window.setInterval(()=>setNow(Date.now()),60_000)
    return()=>window.clearInterval(timer)
  },[])

  const days=useMemo(()=>subscription?.trial_ends_at?Math.max(0,Math.ceil((new Date(subscription.trial_ends_at).getTime()-now)/86_400_000)):0,[subscription,now])
  if(!loaded||!subscription)return null
  if(subscription.status==='active')return null
  if(subscription.status!=='trialing'&&subscription.status!=='expired')return null

  const expired=subscription.status==='expired'||days<=0
  const warning=!expired&&days<=5
  return <div className={`${styles.pill} ${expired?styles.danger:warning?styles.warning:''}`}>
    <i className={styles.dot}/>
    {expired?<><b>Prueba finalizada</b><span>Activá el plan para seguir usando Comercio Lleno.</span><button className={styles.button} onClick={()=>alert('El cobro recurrente se habilitará al asociar el medio de pago de la suscripción.')}>Activar</button></>:<><b>Prueba gratis</b><span>{days} día{days===1?'':'s'} restante{days===1?'':'s'} · luego $9.900/mes</span></>}
  </div>
}
