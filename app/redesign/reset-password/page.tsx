'use client'

import { FormEvent, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

function strong(value:string){return value.length>=8&&/[A-Z]/.test(value)&&/\d/.test(value)&&/[^A-Za-z0-9]/.test(value)}

export default function ResetPasswordPage(){
  const [ready,setReady]=useState(false)
  const [password,setPassword]=useState('')
  const [repeat,setRepeat]=useState('')
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const [done,setDone]=useState(false)

  useEffect(()=>{
    let active=true
    const check=async()=>{
      const {data}=await supabase.auth.getSession()
      if(active)setReady(Boolean(data.session))
    }
    void check()
    const {data:listener}=supabase.auth.onAuthStateChange((event,session)=>{
      if(event==='PASSWORD_RECOVERY'||session){if(active)setReady(true)}
    })
    const timer=window.setTimeout(()=>{void check()},900)
    return()=>{active=false;window.clearTimeout(timer);listener.subscription.unsubscribe()}
  },[])

  async function submit(event:FormEvent){
    event.preventDefault();if(busy)return
    setError('')
    if(!strong(password)){setError('Usá al menos 8 caracteres, una mayúscula, un número y un signo especial.');return}
    if(password!==repeat){setError('Las contraseñas no coinciden.');return}
    setBusy(true)
    try{
      const {error}=await supabase.auth.updateUser({password})
      if(error)throw error
      await supabase.auth.signOut()
      ;['cl_access_token','cl_refresh_token','cl_company_id','cl_company_name','cl_user_role','cl_user_permissions'].forEach(key=>localStorage.removeItem(key))
      setDone(true)
      window.setTimeout(()=>location.replace('/redesign/access'),1200)
    }catch(e){setError(e instanceof Error?e.message:'No se pudo actualizar la contraseña.')}
    finally{setBusy(false)}
  }

  return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:20,background:'#eef4f1',fontFamily:'Inter,system-ui,sans-serif',color:'#17231d'}}>
    <section style={{width:'min(480px,100%)',background:'#fff',border:'1px solid #dfe8e3',borderRadius:20,padding:26,boxShadow:'0 24px 70px rgba(15,45,30,.12)'}}>
      <div style={{fontSize:12,fontWeight:900,color:'#168a55'}}>COMERCIO LLENO · SEGURIDAD</div>
      <h1 style={{fontSize:27,lineHeight:1.15,margin:'12px 0 8px'}}>Elegí una contraseña nueva</h1>
      {!ready&&!done?<><p style={{color:'#5f7068',lineHeight:1.5}}>Estamos validando el enlace de recuperación.</p><p style={{fontSize:12,color:'#78877f'}}>Si el enlace venció o ya fue utilizado, pedí uno nuevo desde la pantalla de acceso.</p></>:done?<div style={{padding:14,borderRadius:12,background:'#eaf8f1',color:'#17613f',fontWeight:800}}>Contraseña actualizada. Volviendo al acceso…</div>:<form onSubmit={submit} style={{display:'grid',gap:14,marginTop:18}}>
        <label style={{display:'grid',gap:6,fontSize:13,fontWeight:800}}>Nueva contraseña<input type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} style={{height:44,border:'1px solid #ccd9d2',borderRadius:10,padding:'0 12px',fontSize:15}}/></label>
        <label style={{display:'grid',gap:6,fontSize:13,fontWeight:800}}>Repetir contraseña<input type="password" autoComplete="new-password" value={repeat} onChange={e=>setRepeat(e.target.value)} style={{height:44,border:'1px solid #ccd9d2',borderRadius:10,padding:'0 12px',fontSize:15}}/></label>
        <div style={{fontSize:11,color:'#708077',lineHeight:1.45}}>Mínimo 8 caracteres, con una mayúscula, un número y un signo especial.</div>
        {error&&<div style={{padding:10,borderRadius:10,background:'#fff0f0',color:'#9b3434',fontSize:12,fontWeight:750}}>{error}</div>}
        <button disabled={busy||!password||!repeat} style={{border:0,borderRadius:11,padding:'13px 15px',background:'#168a55',color:'#fff',fontWeight:900,cursor:'pointer'}}>{busy?'Guardando…':'Guardar nueva contraseña'}</button>
      </form>}
      <button onClick={()=>location.replace('/redesign/access')} style={{marginTop:14,border:0,background:'transparent',padding:0,color:'#536a5f',fontWeight:800,cursor:'pointer'}}>Volver al acceso</button>
    </section>
  </main>
}
