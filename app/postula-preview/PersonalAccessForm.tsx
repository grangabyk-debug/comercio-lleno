'use client'

import Link from 'next/link'
import {FormEvent,useEffect,useState} from 'react'
import {useSearchParams} from 'next/navigation'
import {CV_SUPABASE_URL,cvAuthClient} from '../cv-ia/cvAuth'
import styles from './platform.module.css'

const SIGNUP_TICKET_API=`${CV_SUPABASE_URL}/functions/v1/cv-ai-signup-ticket`
const REGISTER_API=`${CV_SUPABASE_URL}/functions/v1/cv-ai-register-verified`

function strongPassword(value:string){return value.length>=10&&/[a-z]/.test(value)&&/[A-Z]/.test(value)&&/[0-9]/.test(value)}
function safeNext(value:string|null){return value&&value.startsWith('/')&&!value.startsWith('//')?value:''}
function cleanPersonName(value:string){return value.trim().replace(/\s+/g,' ').slice(0,60)}
async function signupTicket(email:string){const r=await fetch(SIGNUP_TICKET_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});const d=await r.json().catch(()=>({}));if(!r.ok||!d?.ok)throw new Error(d?.error||'No pudimos preparar el registro.');return String(d.signup_token||'')}
async function registerVerified(email:string,password:string,signup_token:string,firstName:string,lastName:string){const r=await fetch(REGISTER_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,signup_token,first_name:firstName,last_name:lastName,role:'candidate',next:'/registro'})});const d=await r.json().catch(()=>({}));if(!r.ok||!d?.ok)throw new Error(d?.error||'No pudimos crear tu cuenta.');return d}
async function welcome(token:string){try{await fetch('/api/postula/welcome',{method:'POST',headers:{Authorization:`Bearer ${token}`}})}catch{}}
async function personalDestination(token:string){try{const r=await fetch('/api/postula/profile',{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});const d=await r.json().catch(()=>({}));if(d?.candidate&&d?.profile?.onboarding_completed)return'/mi-cuenta';return'/mi-cuenta?activar=postulante'}catch{return'/mi-cuenta?activar=postulante'}}
async function syncGoogleProfile(token:string,user:any){
 const meta=user?.user_metadata||{}
 const displayName=String(meta.full_name||meta.name||[meta.given_name,meta.family_name].filter(Boolean).join(' ')||'').trim().replace(/\s+/g,' ').slice(0,80)
 const avatar=String(meta.avatar_url||meta.picture||'').trim().slice(0,500)
 if(!displayName)return
 try{await fetch('/api/postula/profile',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({role:'candidate',display_name:displayName,...(avatar?{avatar_url:avatar}:{})})})}catch{}
}

export default function PersonalAccessForm({mode}:{mode:'signup'|'login'}){
 const params=useSearchParams()
 const reset=params.get('reset')==='1'
 const verified=params.get('verified')==='1'
 const oauth=params.get('oauth')==='google'
 const requestedNext=safeNext(params.get('next'))
 const loginHref=requestedNext?`/login?next=${encodeURIComponent(requestedNext)}`:'/login'
 const signupHref=requestedNext?`/registro?next=${encodeURIComponent(requestedNext)}`:'/registro'
 const [firstName,setFirstName]=useState(''),[lastName,setLastName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirmPassword,setConfirmPassword]=useState(''),[newPassword,setNewPassword]=useState(''),[accepted,setAccepted]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('')
 const [showPassword,setShowPassword]=useState(false),[showConfirm,setShowConfirm]=useState(false),[showNewPassword,setShowNewPassword]=useState(false)

 useEffect(()=>{if(reset)return;let cancelled=false;cvAuthClient().auth.getSession().then(async({data})=>{if(!data.session||cancelled)return;if(mode==='login'||verified||oauth){if(oauth)await syncGoogleProfile(data.session.access_token,data.session.user);if(mode==='signup')void welcome(data.session.access_token);const next=requestedNext||await personalDestination(data.session.access_token);if(!cancelled)location.replace(next)}});return()=>{cancelled=true}},[mode,reset,verified,oauth,requestedNext])

 async function googleAccess(){
  setBusy(true);setError('');setMessage('')
  try{
   if(mode==='signup'&&!accepted)throw new Error('Para continuar con Google también necesitás aceptar los Términos y la Política de Privacidad.')
   const callbackPath=mode==='signup'?'/registro':'/login'
   const callbackParams=new URLSearchParams({oauth:'google'})
   if(requestedNext)callbackParams.set('next',requestedNext)
   const redirectTo=`https://postulamejor.com${callbackPath}?${callbackParams.toString()}`
   const {error}=await cvAuthClient().auth.signInWithOAuth({provider:'google',options:{redirectTo}})
   if(error){
    if(/provider|unsupported|enabled/i.test(error.message))throw new Error('El acceso con Google no está disponible en este momento. Probá nuevamente en unos segundos.')
    throw error
   }
  }catch(e){setError(e instanceof Error?e.message:'No pudimos continuar con Google.');setBusy(false)}
 }

 async function submit(e:FormEvent){
  e.preventDefault();setBusy(true);setError('');setMessage('')
  try{
   const clean=email.trim().toLowerCase()
   if(mode==='signup'){
    const first=cleanPersonName(firstName),last=cleanPersonName(lastName)
    if(first.length<2)throw new Error('Ingresá tu nombre.')
    if(last.length<2)throw new Error('Ingresá tu apellido.')
    if(!accepted)throw new Error('Para crear la cuenta necesitás aceptar los Términos y la Política de Privacidad.')
    if(!strongPassword(password))throw new Error('Usá al menos 10 caracteres, con mayúscula, minúscula y un número.')
    if(password!==confirmPassword)throw new Error('Las contraseñas no coinciden. Revisalas e intentá nuevamente.')
    const ticket=await signupTicket(clean)
    await registerVerified(clean,password,ticket,first,last)
    setPassword('');setConfirmPassword('');setMessage(`Te enviamos un correo a ${clean}. Confirmalo para activar tu cuenta.`)
   }else{
    const {data,error}=await cvAuthClient().auth.signInWithPassword({email:clean,password})
    if(error)throw error
    if(!data.session)throw new Error('No pudimos iniciar la sesión.')
    location.assign(requestedNext||await personalDestination(data.session.access_token))
   }
  }catch(e){setError(e instanceof Error?e.message:'No pudimos completar el acceso.')}finally{setBusy(false)}
 }

 async function forgot(){
  setError('');setMessage('');const clean=email.trim().toLowerCase()
  if(!clean){setError('Escribí tu email primero.');return}
  setBusy(true)
  try{const r=await fetch('/api/postula/recovery',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:clean})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d?.error||'No pudimos enviar el recupero.');setMessage(d?.message||'Si existe una cuenta con ese email, te enviamos un enlace para recuperar tu contraseña.')}catch(e){setError(e instanceof Error?e.message:'No pudimos enviar el recupero.')}finally{setBusy(false)}
 }

 async function updatePassword(e:FormEvent){
  e.preventDefault();setBusy(true);setError('')
  try{if(!strongPassword(newPassword))throw new Error('Usá al menos 10 caracteres, con mayúscula, minúscula y un número.');const {error}=await cvAuthClient().auth.updateUser({password:newPassword});if(error)throw error;setMessage('Contraseña actualizada. Ya podés entrar a tu cuenta.');setNewPassword('')}catch(e){setError(e instanceof Error?e.message:'No pudimos cambiar la contraseña.')}finally{setBusy(false)}
 }

 if(reset)return <div className={`${styles.authCard} pm-employer-auth-card`}><span className="pm-employer-auth-kicker">POSTULÁ MEJOR</span><h2>Nueva contraseña</h2><p>Elegí una contraseña nueva para recuperar tu cuenta.</p><form className="pm-employer-auth-form" onSubmit={updatePassword}><label>Nueva contraseña<div className="pm-employer-password-wrap"><input type={showNewPassword?'text':'password'} value={newPassword} onChange={e=>setNewPassword(e.target.value)} autoComplete="new-password" required/><button type="button" className="pm-employer-password-toggle" onClick={()=>setShowNewPassword(v=>!v)}>{showNewPassword?'Ocultar':'Ver'}</button></div></label><button className={styles.buttonDark} disabled={busy}>{busy?'Guardando…':'Guardar nueva contraseña'}</button></form>{message&&<div className="pm-employer-auth-message">{message}</div>}{error&&<div className="pm-employer-auth-error">{error}</div>}</div>

 return <div className={`${styles.authCard} pm-employer-auth-card`}>
  <span className="pm-employer-auth-kicker">POSTULÁ MEJOR · PERSONAS</span>
  <h2>{mode==='signup'?'Creá tu cuenta gratis':'Volvé a tu cuenta'}</h2>
  <p>{mode==='signup'?'Usá tu nombre real para que tus postulaciones, mensajes y Servicios Flex se identifiquen correctamente.':'Ingresá con tu email. Si ese mismo usuario también administra una empresa, vas a poder activar tu perfil de postulante por separado sin crear otra contraseña.'}</p>
  <form className="pm-employer-auth-form" onSubmit={submit}>
   {mode==='signup'&&<><label>Nombre<input type="text" value={firstName} onChange={e=>setFirstName(e.target.value)} autoComplete="given-name" maxLength={60} placeholder="Tu nombre" required/></label><label>Apellido<input type="text" value={lastName} onChange={e=>setLastName(e.target.value)} autoComplete="family-name" maxLength={60} placeholder="Tu apellido" required/></label></>}
   <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" placeholder="tu@email.com" required/></label>
   <label>Contraseña<div className="pm-employer-password-wrap"><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} autoComplete={mode==='signup'?'new-password':'current-password'} placeholder={mode==='signup'?'10+ caracteres, mayúscula y número':'Tu contraseña'} required/><button type="button" className="pm-employer-password-toggle" onClick={()=>setShowPassword(v=>!v)}>{showPassword?'Ocultar':'Ver'}</button></div></label>
   {mode==='signup'&&<label>Repetir contraseña<div className="pm-employer-password-wrap"><input type={showConfirm?'text':'password'} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} autoComplete="new-password" placeholder="Volvé a escribirla" required/><button type="button" className="pm-employer-password-toggle" onClick={()=>setShowConfirm(v=>!v)}>{showConfirm?'Ocultar':'Ver'}</button></div></label>}
   {mode==='signup'&&<div className="pm-employer-password-help">10+ caracteres · una mayúscula · una minúscula · un número</div>}
   {mode==='signup'&&<label className="pm-employer-auth-consent"><input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)}/><span>Acepto los <Link href="/terminos" target="_blank">Términos y Condiciones</Link> y la <Link href="/privacidad" target="_blank">Política de Privacidad</Link>.</span></label>}
   {mode==='login'&&<button type="button" onClick={forgot} className="pm-employer-forgot" disabled={busy}>Olvidé mi contraseña</button>}
   <button className={styles.buttonDark} disabled={busy}>{busy?(mode==='signup'?'Preparando cuenta…':'Ingresando…'):(mode==='signup'?'Crear mi cuenta':'Ingresar')}</button>
   <div className="pm-employer-auth-divider"><span>o</span></div>
   <button type="button" className="pm-google-auth-button" onClick={googleAccess} disabled={busy||(mode==='signup'&&!accepted)}><span className="pm-google-g">G</span>{mode==='signup'?'Crear cuenta con Google':'Ingresar con Google'}</button>
  </form>
  {message&&<div className="pm-employer-auth-message">{message}</div>}
  {error&&<div className="pm-employer-auth-error">{error}</div>}
  <div className="pm-employer-auth-switch">{mode==='signup'?<>¿Ya tenés cuenta? <Link href={loginHref}>Iniciar sesión</Link></>:<>¿Todavía no tenés cuenta? <Link href={signupHref}>Crear cuenta gratis</Link></>}</div>
 </div>
}
