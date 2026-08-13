'use client'

import { useEffect, useState } from 'react'
import { readTenantSession } from '@/lib/comercio/session'

export default function MobilePcNotice(){
  const[show,setShow]=useState(false)
  useEffect(()=>{const s=readTenantSession();if(!s)return;const key=`cl_mobile_pc_notice_${s.companyId}`;if(sessionStorage.getItem(key)!=='seen')setShow(true)},[])
  if(!show)return null
  function close(){const s=readTenantSession();if(s)sessionStorage.setItem(`cl_mobile_pc_notice_${s.companyId}`,'seen');setShow(false)}
  return <div style={{position:'fixed',left:12,right:12,top:10,zIndex:185,background:'#111b16',color:'#fff',border:'1px solid rgba(255,255,255,.13)',borderRadius:16,padding:'11px 12px',boxShadow:'0 14px 42px rgba(0,0,0,.28)',display:'flex',gap:10,alignItems:'flex-start'}}>
    <div style={{width:34,height:34,flex:'0 0 34px',borderRadius:11,display:'grid',placeItems:'center',background:'#168a55',fontWeight:950}}>CL</div>
    <div style={{minWidth:0,flex:1}}><b style={{display:'block',fontSize:11}}>Estás en la versión móvil simplificada</b><span style={{display:'block',fontSize:8.5,lineHeight:1.45,color:'#cbd7d1',marginTop:2}}>Para reportes completos, proveedores, configuración avanzada y todas las herramientas, abrí Comercio Lleno desde una PC.</span></div>
    <button onClick={close} aria-label="Cerrar" style={{width:28,height:28,border:'1px solid #435049',borderRadius:9,background:'#202b26',color:'#fff',fontSize:16}}>×</button>
  </div>
}
