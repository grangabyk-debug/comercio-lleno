'use client'

import { useEffect } from 'react'

export default function RedesignError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Comercio Lleno redesign error', error)
  }, [error])

  return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'#f4f7f6',fontFamily:'Inter,system-ui,sans-serif',color:'#17231d'}}>
    <section style={{width:'min(620px,100%)',background:'#fff',border:'1px solid #dfe8e3',borderRadius:18,padding:24,boxShadow:'0 18px 48px rgba(23,50,37,.12)'}}>
      <div style={{fontSize:12,fontWeight:900,color:'#b33838',marginBottom:8}}>COMERCIO LLENO · REDISEÑO V2</div>
      <h1 style={{fontSize:25,margin:'0 0 10px'}}>La pantalla encontró un error y se detuvo.</h1>
      <p style={{lineHeight:1.55,color:'#5c6d65'}}>No se borró ninguna venta ni producto. Podés intentar cargar nuevamente. Si vuelve a pasar, este mensaje reemplaza la pantalla blanca y nos permite identificar el problema.</p>
      <pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',background:'#f8faf9',border:'1px solid #e4ebe7',borderRadius:10,padding:12,fontSize:11,color:'#823b3b'}}>{error.message || 'Error desconocido'}</pre>
      <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:14}}>
        <button onClick={reset} style={{border:0,borderRadius:10,padding:'11px 15px',background:'#168a55',color:'#fff',fontWeight:900,cursor:'pointer'}}>Reintentar</button>
        <button onClick={()=>window.location.replace('/redesign/access')} style={{border:'1px solid #d8e1dc',borderRadius:10,padding:'11px 15px',background:'#fff',color:'#34473d',fontWeight:850,cursor:'pointer'}}>Volver al acceso</button>
      </div>
    </section>
  </main>
}
