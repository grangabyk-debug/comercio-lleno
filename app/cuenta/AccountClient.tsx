'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import styles from './account.module.css'
import { CV_ACCOUNT_API, SESSION_KEY, cvAuthClient, postCv } from '../cv-ia/cvAuth'

type Account={email:string;role:'member'|'owner';display_name?:string|null}

export default function AccountClient(){
  const params=useSearchParams()
  const [mode,setMode]=useState<'login'|'signup'>(params.get('modo')==='crear'?'signup':'login')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [newPassword,setNewPassword]=useState('')
  const [account,setAccount]=useState<Account|null>(null)
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')
  const reset=params.get('reset')==='1'
  const next=params.get('next')||''

  async function finishAccount(accessToken:string){
    const currentToken=localStorage.getItem(SESSION_KEY)||''
    const response=await fetch(CV_ACCOUNT_API,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${accessToken}`},body:JSON.stringify({action:'link',session_token:currentToken})})
    const data=await response.json().catch(()=>({ok:false,error:'Respuesta inválida'}))
    if(!response.ok||!data?.ok)throw new Error(data?.error||'No pudimos vincular tu cuenta.')
    if(data.session_token)localStorage.setItem(SESSION_KEY,data.session_token)
    setAccount(data.account)
    if(data.account?.role==='owner'){
      const token=localStorage.getItem(SESSION_KEY)||''
      await fetch(CV_ACCOUNT_API,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${accessToken}`},body:JSON.stringify({action:'owner_prepare',session_token:token})})
    }
    if(next)window.setTimeout(()=>location.assign(next),250)
  }

  useEffect(()=>{
    const client=cvAuthClient()
    client.auth.getSession().then(async({data})=>{
      if(data.session){
        try{await finishAccount(data.session.access_token)}catch(e){setError(e instanceof Error?e.message:'No pudimos cargar tu cuenta.')}
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  async function submit(e:FormEvent){
    e.preventDefault();setBusy(true);setError('');setMessage('')
    try{
      const client=cvAuthClient()
      if(mode==='login'){
        const {data,error}=await client.auth.signInWithPassword({email:email.trim().toLowerCase(),password})
        if(error)throw error
        if(!data.session)throw new Error('No pudimos iniciar la sesión.')
        await finishAccount(data.session.access_token)
        setMessage('Sesión iniciada correctamente.')
      }else{
        if(password.length<10)throw new Error('Usá una contraseña de al menos 10 caracteres.')
        const {data,error}=await client.auth.signUp({email:email.trim().toLowerCase(),password,options:{emailRedirectTo:'https://postulamejor.com/cuenta'}})
        if(error)throw error
        if(data.session){await finishAccount(data.session.access_token);setMessage('Cuenta creada y vinculada.')}else setMessage('Cuenta creada. Revisá tu email para confirmar la dirección y después iniciá sesión.')
      }
    }catch(e){setError(e instanceof Error?e.message:'No pudimos completar el acceso.')}finally{setBusy(false)}
  }

  async function forgot(){
    setError('');setMessage('')
    if(!email.trim()){setError('Escribí tu email primero.');return}
    try{const {error}=await cvAuthClient().auth.resetPasswordForEmail(email.trim().toLowerCase(),{redirectTo:'https://postulamejor.com/cuenta?reset=1'});if(error)throw error;setMessage('Te enviamos un enlace para recuperar el acceso. Revisá también spam.') }catch(e){setError(e instanceof Error?e.message:'No pudimos enviar el recupero.')}
  }

  async function updatePassword(e:FormEvent){
    e.preventDefault();setBusy(true);setError('')
    try{if(newPassword.length<10)throw new Error('Usá al menos 10 caracteres.');const {error}=await cvAuthClient().auth.updateUser({password:newPassword});if(error)throw error;setMessage('Contraseña actualizada. Ya podés usar tu cuenta.');setNewPassword('')}catch(e){setError(e instanceof Error?e.message:'No pudimos cambiar la contraseña.')}finally{setBusy(false)}
  }

  async function logout(){await cvAuthClient().auth.signOut();setAccount(null);setMessage('Sesión cerrada.')}

  if(account)return <div className={styles.card}><div className={styles.accountBox}><div className={styles.accountHeader}><div><h2>Tu cuenta</h2><p>{account.email}</p></div><span className={`${styles.role} ${account.role==='owner'?styles.owner:''}`}>{account.role==='owner'?'PROPIETARIO':'CUENTA ACTIVA'}</span></div>{account.role==='owner'&&<div className={styles.ownerNote}><b>Modo propietario.</b> Esta cuenta puede probar diagnósticos, CV Pro y Búsqueda Activa sin cobro. El permiso se valida en servidor y no se puede activar desde una cuenta común.</div>}<div className={styles.actions}><a href="/mi-cv">Abrir mi CV Pro</a><a href="/busqueda-activa">Abrir Búsqueda Activa</a></div><button className={styles.secondary} onClick={logout}>Cerrar sesión</button>{message&&<div className={styles.message}>{message}</div>}</div></div>

  if(reset)return <form className={`${styles.card} ${styles.form}`} onSubmit={updatePassword}><h2>Nueva contraseña</h2><p className={styles.security}>Elegí una contraseña nueva de al menos 10 caracteres. Para la cuenta de propietario conviene que sea única y no la reutilices en otros servicios.</p><label>Nueva contraseña<input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} autoComplete="new-password" required/></label><button className={styles.primary} disabled={busy}>{busy?'Guardando…':'Guardar nueva contraseña'}</button>{message&&<div className={styles.message}>{message}</div>}{error&&<div className={`${styles.message} ${styles.error}`}>{error}</div>}</form>

  return <div className={styles.card}><div className={styles.tabs}><button data-on={mode==='login'} onClick={()=>{setMode('login');setError('');setMessage('')}}>Iniciar sesión</button><button data-on={mode==='signup'} onClick={()=>{setMode('signup');setError('');setMessage('')}}>Crear cuenta</button></div><form className={styles.form} onSubmit={submit}><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required placeholder="tu@email.com"/></label><label>Contraseña<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete={mode==='login'?'current-password':'new-password'} required placeholder={mode==='signup'?'Mínimo 10 caracteres':'Tu contraseña'}/></label>{mode==='login'&&<button type="button" className={styles.forgot} onClick={forgot}>Olvidé mi contraseña</button>}<button className={styles.primary} disabled={busy}>{busy?(mode==='login'?'Ingresando…':'Creando cuenta…'):(mode==='login'?'Ingresar':'Crear mi cuenta')}</button></form>{message&&<div className={styles.message} style={{marginTop:12}}>{message}</div>}{error&&<div className={`${styles.message} ${styles.error}`} style={{marginTop:12}}>{error}</div>}<div className={styles.security}>Tu contraseña la gestiona el sistema de autenticación; Postulá Mejor no la guarda en texto legible. Búsqueda Activa usa tu cuenta para conservar el tablero y permitirte volver desde otro dispositivo.</div></div>
}
