'use client'

import {FormEvent,useEffect,useState} from 'react'
import {createPortal} from 'react-dom'
import {cvAuthClient} from '../cv-ia/cvAuth'

type Basics={name:string;email:string;phone:string;city:string;neighborhood:string}
const css=`
.pm42-required-basics{margin:0 0 18px;border:1px solid #dce3ea;border-radius:24px;background:#fff;padding:22px;box-shadow:0 10px 28px rgba(12,30,45,.05)}
.pm42-required-basics-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:18px}.pm42-required-basics-head span{font-size:11px;letter-spacing:.14em;font-weight:850;color:#5a67ff}.pm42-required-basics-head h2{margin:5px 0 4px;font-size:22px;color:#101923}.pm42-required-basics-head p{margin:0;color:#687888;font-size:13px;line-height:1.5}.pm42-required-basics-badge{white-space:nowrap;border-radius:999px;background:#d7ff3f;padding:8px 11px;font-size:11px;font-weight:850;color:#14202a}
.pm42-required-basics-grid{display:grid;grid-template-columns:1fr 1fr;gap:13px}.pm42-required-basics-grid label{display:flex;flex-direction:column;gap:7px;font-size:12px;font-weight:750;color:#344555}.pm42-required-basics-grid label.wide{grid-column:1/-1}.pm42-required-basics-grid input{width:100%;border:1px solid #d9e1e8;border-radius:13px;background:#f8fafc;padding:13px 14px;font:inherit;color:#13212d;outline:none}.pm42-required-basics-grid input:focus{border-color:#9ee61b;box-shadow:0 0 0 3px rgba(174,242,34,.18)}.pm42-required-basics-grid input[readonly]{color:#667684;background:#f3f6f8}.pm42-required-basics-actions{display:flex;align-items:center;gap:12px;margin-top:16px}.pm42-required-basics-actions button{border:0;border-radius:13px;background:#111d27;color:#fff;padding:12px 17px;font-weight:800;cursor:pointer}.pm42-required-basics-actions button:disabled{opacity:.6;cursor:default}.pm42-required-basics-actions span{font-size:12px;color:#5f7180}.pm42-required-basics-error{color:#b42318!important}
@media(max-width:720px){.pm42-required-basics{border-radius:18px;padding:17px}.pm42-required-basics-head{display:block}.pm42-required-basics-badge{display:inline-block;margin-top:10px}.pm42-required-basics-grid{grid-template-columns:1fr}.pm42-required-basics-grid label.wide{grid-column:auto}}
`

export default function CandidateRequiredBasics(){
 const [host,setHost]=useState<HTMLElement|null>(null),[data,setData]=useState<Basics>({name:'',email:'',phone:'',city:'',neighborhood:''}),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[ready,setReady]=useState(false)
 useEffect(()=>{void(async()=>{const {data:s}=await cvAuthClient().auth.getSession();if(!s.session)return;const headers={Authorization:`Bearer ${s.session.access_token}`};const r=await fetch('/api/postula/profile',{headers,cache:'no-store'}),d=await r.json().catch(()=>({}));if(!d?.ok)return;setData({name:String(d.profile?.display_name||s.session.user.user_metadata?.full_name||''),email:String(s.session.user.email||''),phone:String(d.candidate?.phone||''),city:String(d.candidate?.city||''),neighborhood:String(d.candidate?.neighborhood||'')});setReady(true)})()},[])
 useEffect(()=>{
  let observer:MutationObserver|null=null
  const sync=()=>{
   const workspace=document.querySelector<HTMLElement>('.pm42-workspace')
   if(!workspace||workspace.dataset.view!=='perfil'){setHost(null);return}
   const card=workspace.querySelector<HTMLElement>('.pm42-profile-card')
   if(!card?.parentElement)return
   let slot=card.parentElement.querySelector<HTMLElement>('.pm42-required-basics-slot')
   if(!slot){slot=document.createElement('div');slot.className='pm42-required-basics-slot';card.parentElement.insertBefore(slot,card)}
   setHost(slot)
  }
  const connect=()=>{const workspace=document.querySelector<HTMLElement>('.pm42-workspace');if(!workspace)return false;sync();observer=new MutationObserver(sync);observer.observe(workspace,{attributes:true,attributeFilter:['data-view'],childList:true,subtree:true});return true}
  if(!connect()){const timer=window.setInterval(()=>{if(connect())window.clearInterval(timer)},100);return()=>{window.clearInterval(timer);observer?.disconnect()}}
  return()=>observer?.disconnect()
 },[])
 async function save(e:FormEvent){
  e.preventDefault();setNotice('')
  if(!data.name.trim()||!data.email.trim()||!data.phone.trim()||!data.city.trim()){setNotice('Completá nombre y apellido, teléfono y ciudad. El email de tu cuenta también tiene que estar disponible.');return}
  setBusy(true)
  try{
   const {data:s}=await cvAuthClient().auth.getSession();if(!s.session)throw new Error('Tu sesión venció.')
   const r=await fetch('/api/postula/profile',{method:'POST',headers:{Authorization:`Bearer ${s.session.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({role:'candidate',display_name:data.name.trim(),phone:data.phone.trim(),city:data.city.trim(),neighborhood:data.neighborhood.trim(),onboarding_completed:true})})
   const d=await r.json().catch(()=>({}));if(!r.ok||!d?.ok)throw new Error(d?.error||'No pudimos guardar tus datos.')
   setNotice('Datos básicos guardados. Se van a reutilizar en tus postulaciones.')
  }catch(e){setNotice(e instanceof Error?e.message:'No pudimos guardar tus datos.')}finally{setBusy(false)}
 }
 if(!host||!ready)return <style>{css}</style>
 return <><style>{css}</style>{createPortal(<form className="pm42-required-basics" onSubmit={save}><div className="pm42-required-basics-head"><div><span>DATOS BÁSICOS</span><h2>Tu información para postularte.</h2><p>Estos datos quedan guardados en tu perfil y se completan automáticamente cuando usás Postulación rápida.</p></div><b className="pm42-required-basics-badge">OBLIGATORIOS</b></div><div className="pm42-required-basics-grid"><label>Nombre y apellido *<input value={data.name} onChange={e=>setData(v=>({...v,name:e.target.value}))} autoComplete="name"/></label><label>Email de la cuenta *<input value={data.email} readOnly type="email"/></label><label>Teléfono *<input value={data.phone} onChange={e=>setData(v=>({...v,phone:e.target.value}))} inputMode="tel" autoComplete="tel" placeholder="Ej. +54 9 11 1234 5678"/></label><label>Ciudad / localidad *<input value={data.city} onChange={e=>setData(v=>({...v,city:e.target.value}))} autoComplete="address-level2" placeholder="Ej. CABA"/></label><label className="wide">Barrio / zona <input value={data.neighborhood} onChange={e=>setData(v=>({...v,neighborhood:e.target.value}))} placeholder="Ej. Flores"/></label></div><div className="pm42-required-basics-actions"><button disabled={busy}>{busy?'Guardando…':'Guardar datos básicos'}</button>{notice&&<span className={notice.startsWith('Completá')||notice.startsWith('No pudimos')||notice.includes('venció')?'pm42-required-basics-error':''}>{notice}</span>}</div></form>,host)}</>
}
