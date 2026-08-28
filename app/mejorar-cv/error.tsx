'use client'

import {useEffect} from 'react'

export default function Error({error,reset}:{error:Error&{digest?:string};reset:()=>void}){
 useEffect(()=>{console.error('Mejorar CV route error',error)},[error])
 return <main style={{minHeight:'70vh',display:'grid',placeItems:'center',background:'#fff',color:'#17191f',fontFamily:'Inter,system-ui,sans-serif',padding:24}}><section style={{width:'min(560px,100%)',padding:'30px 26px',border:'1px solid #e5e7eb',borderRadius:24,background:'#fff',boxShadow:'0 18px 48px rgba(30,24,70,.08)'}}><span style={{fontSize:11,fontWeight:900,letterSpacing:'.11em',color:'#6957ff'}}>POSTULÁ MEJOR</span><h1 style={{fontSize:28,margin:'10px 0'}}>No pudimos abrir Mejorar CV.</h1><p style={{color:'#66707c',lineHeight:1.55}}>La sesión y tus datos siguen intactos. Podés reintentar sin salir de Postulá Mejor.</p><div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:20}}><button type="button" onClick={reset} style={{border:0,borderRadius:12,padding:'12px 16px',background:'#17191f',color:'#fff',fontWeight:800,cursor:'pointer'}}>Reintentar</button><button type="button" onClick={()=>location.reload()} style={{border:'1px solid #d9dce3',borderRadius:12,padding:'12px 16px',background:'#fff',color:'#17191f',fontWeight:800,cursor:'pointer'}}>Recargar página</button></div></section></main>
}
