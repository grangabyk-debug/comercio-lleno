'use client'

import { FormEvent, useState } from 'react'
import styles from './legal.module.css'

type RequestType='withdrawal'|'cancellation'

type Result={ok:boolean;request_code?:string;message?:string;error?:string}

const endpoint='https://comerciolleno.supabase.co/functions/v1/legal-service-request'

export default function LegalServiceForm({initialType}:{initialType:RequestType}){
  const [type,setType]=useState<RequestType>(initialType)
  const [loading,setLoading]=useState(false)
  const [result,setResult]=useState<Result|null>(null)

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault()
    if(loading)return
    setLoading(true)
    setResult(null)
    const form=new FormData(event.currentTarget)
    try{
      const response=await fetch(endpoint,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          request_type:type,
          email:String(form.get('email')||''),
          company_name:String(form.get('company_name')||''),
          cuit:String(form.get('cuit')||''),
          details:String(form.get('details')||''),
          website:String(form.get('website')||''),
        }),
      })
      const data=await response.json().catch(()=>({ok:false,error:'invalid_response'})) as Result
      if(!response.ok||!data.ok)throw new Error(data.message||'No pudimos registrar la solicitud. Intentá nuevamente en unos minutos.')
      setResult(data)
      event.currentTarget.reset()
    }catch(error){
      setResult({ok:false,message:error instanceof Error?error.message:'No pudimos registrar la solicitud.'})
    }finally{
      setLoading(false)
    }
  }

  if(result?.ok&&result.request_code){
    return <section className={styles.success} aria-live="polite">
      <p>SOLICITUD RECIBIDA</p>
      <h2>Tu código de identificación</h2>
      <code>{result.request_code}</code>
      <span>Guardá este código como constancia. La solicitud quedó registrada con la fecha y hora de recepción.</span>
      <button type="button" onClick={()=>setResult(null)}>Realizar otra gestión</button>
    </section>
  }

  return <form className={styles.form} onSubmit={submit}>
    <div className={styles.switcher}>
      <button type="button" className={type==='withdrawal'?styles.active:''} onClick={()=>setType('withdrawal')}>Arrepentimiento</button>
      <button type="button" className={type==='cancellation'?styles.active:''} onClick={()=>setType('cancellation')}>Baja del servicio</button>
    </div>

    <div className={styles.formHead}>
      <p>{type==='withdrawal'?'BOTÓN DE ARREPENTIMIENTO':'BOTÓN DE BAJA DE SERVICIO'}</p>
      <h2>{type==='withdrawal'?'Solicitar revocación':'Solicitar baja'}</h2>
      <span>{type==='withdrawal'?'Usá esta opción para solicitar la revocación de una contratación a distancia cuando corresponda.':'Usá esta opción para pedir la finalización del servicio contratado.'}</span>
    </div>

    <label>Correo asociado o de contacto<input name="email" type="email" required autoComplete="email" placeholder="nombre@comercio.com"/></label>
    <label>Nombre del comercio <small>Opcional</small><input name="company_name" type="text" maxLength={160} autoComplete="organization" placeholder="Ej. Mi Dietética"/></label>
    <label>CUIT <small>Opcional</small><input name="cuit" type="text" inputMode="numeric" maxLength={20} placeholder="XX-XXXXXXXX-X"/></label>
    <label>Detalle <small>Opcional</small><textarea name="details" maxLength={1200} rows={4} placeholder="Podés agregar cualquier dato que nos ayude a identificar la contratación."/></label>
    <label className={styles.honeypot} aria-hidden="true">Sitio web<input name="website" type="text" tabIndex={-1} autoComplete="off"/></label>

    {result&&!result.ok&&<div className={styles.error} role="alert">{result.message}</div>}
    <button className={styles.submit} type="submit" disabled={loading}>{loading?'Enviando solicitud…':type==='withdrawal'?'Enviar arrepentimiento':'Solicitar baja del servicio'}</button>
    <small className={styles.formFoot}>No se requiere inicio de sesión ni registración previa para realizar esta gestión.</small>
  </form>
}
