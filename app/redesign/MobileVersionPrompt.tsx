'use client'

import { useEffect, useState } from 'react'
import { readTenantSession } from '@/lib/comercio/session'

export default function MobileVersionPrompt(){
  const[show,setShow]=useState(false)
  useEffect(()=>{
    const timer=window.setTimeout(()=>{
      const session=readTenantSession()
      if(!session||window.innerWidth>760)return
      const key=`cl_mobile_prompt_${session.companyId}`
      if(sessionStorage.getItem(key)==='dismissed')return
      setShow(true)
    },900)
    return()=>window.clearTimeout(timer)
  },[])
  if(!show)return null
  const dismiss=()=>{const s=readTenantSession();if(s)sessionStorage.setItem(`cl_mobile_prompt_${s.companyId}`,'dismissed');setShow(false)}
  return <div style={{position:'fixed',left:12,right:12,bottom:14,zIndex:180,background:'#111b16',color:'#fff',border:'1px solid rgba(255,255,255,.12)',borderRadius:18,padding:14,boxShadow:'0 18px 55px rgba(0,0,0,.34)'}}>
    <div style={{display:'flex',gap:10,alignItems:'flex-start'}}><div style={{width:38,height:38,borderRadius:12,background:'#168a55',display:'grid',placeItems:'center',fontSize:20,flex:'0 0 auto'}}>📱</div><div style={{minWidth:0,flex:1}}><b style={{display:'block',fontSize:13}}>¿Querés usar la versión móvil simplificada?</b><span style={{display:'block',fontSize:10,lineHeight:1.45,color:'#c9d4ce',marginTop:3}}>Tiene controles más grandes, escáner con cámara y una interfaz pensada para el celular.</span></div></div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1.4fr',gap:8,marginTop:12}}><button onClick={dismiss} style={{border:'1px solid #3c4943',background:'#202b26',color:'#fff',borderRadius:11,padding:10,fontWeight:800}}>Seguir acá</button><button onClick={()=>{location.href='/movil'}} style={{border:0,background:'#168a55',color:'#fff',borderRadius:11,padding:10,fontWeight:900}}>Abrir versión móvil</button></div>
  </div>
}
