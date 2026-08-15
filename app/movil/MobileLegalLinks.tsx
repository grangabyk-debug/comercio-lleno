'use client'

import { useEffect,useState } from 'react'
import { readTenantSession } from '@/lib/comercio/session'

export default function MobileLegalLinks(){
  const[logged,setLogged]=useState(true)
  useEffect(()=>{setLogged(Boolean(readTenantSession()))},[])
  if(logged)return null
  return <nav aria-label="Información legal de Comercio Lleno" style={{position:'fixed',left:'50%',bottom:10,transform:'translateX(-50%)',zIndex:80,display:'flex',gap:12,alignItems:'center',padding:'7px 12px',border:'1px solid #dce7e0',borderRadius:999,background:'rgba(255,255,255,.94)',boxShadow:'0 6px 20px rgba(20,60,40,.08)',fontFamily:'Inter,system-ui,sans-serif',fontSize:10}}>
    <a href="/privacidad" target="_blank" rel="noreferrer" style={{color:'#35634d',fontWeight:800,textDecoration:'none'}}>Privacidad</a>
    <span aria-hidden="true" style={{color:'#b3bdb7'}}>·</span>
    <a href="/eliminar-cuenta" target="_blank" rel="noreferrer" style={{color:'#35634d',fontWeight:800,textDecoration:'none'}}>Eliminar cuenta</a>
  </nav>
}
