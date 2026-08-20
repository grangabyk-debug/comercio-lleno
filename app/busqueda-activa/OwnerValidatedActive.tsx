'use client'

import { useEffect, useState } from 'react'
import ActiveClient from './ActiveClient'
import { CV_ACCOUNT_API, cvAuthClient } from '../cv-ia/cvAuth'

type Account={email:string;role:'member'|'owner';display_name?:string|null}

async function getAccount(accessToken:string){
  const response=await fetch(CV_ACCOUNT_API,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${accessToken}`},body:JSON.stringify({action:'status'})})
  const data=await response.json().catch(()=>({ok:false}))
  if(!response.ok||!data?.ok)return null
  return data.account as Account
}

export default function OwnerValidatedActive(){
  const [account,setAccount]=useState<Account|null>(null)

  useEffect(()=>{let alive=true;(async()=>{
    try{
      const {data}=await cvAuthClient().auth.getSession()
      if(!alive||!data.session)return
      const acc=await getAccount(data.session.access_token)
      if(alive)setAccount(acc)
    }catch{}
  })();return()=>{alive=false}},[])

  return <>
    {account?.role==='owner'&&<section style={{maxWidth:760,margin:'0 auto 22px',background:'rgba(255,255,255,.92)',border:'1px solid #e1e3eb',borderRadius:24,padding:'20px 22px',boxShadow:'0 12px 38px rgba(36,28,94,.07)'}}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}>
        <div><h2 style={{margin:'0 0 5px',fontSize:24}}>Tu cuenta</h2><p style={{margin:0,color:'#5e6470',fontSize:14}}>{account.email}</p></div>
        <span style={{background:'#c8ff56',color:'#172015',borderRadius:999,padding:'8px 12px',fontWeight:950,fontSize:11,letterSpacing:'.08em'}}>PROPIETARIO</span>
      </div>
      <div style={{marginTop:16,padding:'13px 15px',borderRadius:14,background:'#f4f6f8',color:'#39404a',fontSize:12.5,lineHeight:1.55}}><b>Modo propietario.</b> Esta cuenta puede probar diagnósticos, CV Pro+ y Búsqueda Activa sin cobro. El permiso se valida en servidor y no se puede activar desde una cuenta común.</div>
    </section>}
    <ActiveClient/>
  </>
}
