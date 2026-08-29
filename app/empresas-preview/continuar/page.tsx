'use client'

import Link from 'next/link'
import {useEffect,useState} from 'react'
import {useSearchParams} from 'next/navigation'
import {cvAuthClient} from '../../cv-ia/cvAuth'

const LABEL:{[key:string]:string}={impulso:'Impulso',seleccion:'Selección IA'}
const PRICE:{[key:string]:string}={impulso:'$18.900 / mes',seleccion:'$34.900 / mes'}

export default function ContinueEmployerPlan(){
 const params=useSearchParams(),plan=params.get('plan')||''
 const [authed,setAuthed]=useState<boolean|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const valid=plan==='impulso'||plan==='seleccion'
 useEffect(()=>{cvAuthClient().auth.getSession().then(({data})=>setAuthed(Boolean(data.session))).catch(()=>setAuthed(false))},[])
 async function pay(){
  if(!valid||busy)return
  setBusy(true);setError('')
  try{
   const {data}=await cvAuthClient().auth.getSession();if(!data.session){setAuthed(false);setBusy(false);return}
   const r=await fetch('/api/postula/billing/checkout',{method:'POST',headers:{Authorization:`Bearer ${data.session.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({plan,mode:'payment'})})
   const d=await r.json().catch(()=>({}))
   if(!r.ok||!d?.init_point)throw new Error(d?.error||'No pudimos preparar el pago.')
   location.assign(String(d.init_point))
  }catch(e){setError(e instanceof Error?e.message:'No pudimos preparar el pago.');setBusy(false)}
 }
 if(!valid)return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'#f6f7fb',fontFamily:'Inter,Arial,sans-serif'}}><section style={{maxWidth:560,padding:32,borderRadius:26,background:'#fff',boxShadow:'0 18px 60px rgba(12,24,36,.10)'}}><b>Postulá Mejor Empresas</b><h1>Plan no disponible</h1><p>Volvé a Empresas para elegir una opción vigente.</p><Link href="/empresas">Ver planes</Link></section></main>
 return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'linear-gradient(135deg,#f7f7fb,#eff5ee)',fontFamily:'Inter,Arial,sans-serif',color:'#111821'}}><section style={{width:'min(580px,100%)',padding:'36px 32px',border:'1px solid #e2e6e8',borderRadius:28,background:'#fff',boxShadow:'0 22px 70px rgba(12,24,36,.11)'}}><span style={{fontSize:11,fontWeight:900,letterSpacing:'.12em',color:'#6468ff'}}>POSTULÁ MEJOR · EMPRESAS</span><h1 style={{fontSize:40,lineHeight:1,letterSpacing:'-.04em',margin:'12px 0'}}>Continuar con {LABEL[plan]}</h1><p style={{color:'#69747d',lineHeight:1.55}}>Tu período gratuito no genera ningún cobro automático. Si querés mantener el plan, continuás recién ahora con Mercado Pago.</p><div style={{margin:'24px 0',padding:20,borderRadius:18,background:'#f5f7f7'}}><b style={{display:'block',fontSize:18}}>{LABEL[plan]}</b><strong style={{display:'block',fontSize:30,marginTop:7}}>{PRICE[plan]}</strong></div>{authed===false?<div><p>Primero iniciá sesión con la cuenta administradora de tu empresa.</p><Link href="/empresas/login" style={{display:'inline-flex',padding:'14px 18px',borderRadius:13,background:'#111821',color:'#fff',fontWeight:900,textDecoration:'none'}}>Iniciar sesión</Link></div>:<button type="button" onClick={pay} disabled={busy||authed===null} style={{width:'100%',minHeight:54,border:0,borderRadius:14,background:'#d9ff59',color:'#111821',fontSize:15,fontWeight:950,cursor:'pointer'}}>{busy?'Preparando Mercado Pago…':authed===null?'Verificando cuenta…':'Continuar y pagar con Mercado Pago'}</button>}{error&&<p style={{marginTop:16,color:'#b42318',fontWeight:700}}>{error}</p>}<p style={{fontSize:12,color:'#7b858d',marginTop:20}}>Si no continuás, tu cuenta queda en el plan Gratis. No se realiza ningún débito por haber usado los 30 días gratuitos.</p></section></main>
}
