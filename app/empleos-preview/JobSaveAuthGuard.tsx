'use client'

import {useEffect,useRef,useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'

export default function JobSaveAuthGuard(){
 const [open,setOpen]=useState(false)
 const authRef=useRef<boolean|null>(null)
 const clientRef=useRef<ReturnType<typeof cvAuthClient>|null>(null)

 useEffect(()=>{
  const client=cvAuthClient();clientRef.current=client
  let alive=true
  const clearGuestSaved=()=>{
   try{localStorage.removeItem('pm_saved_jobs')}catch{}
   window.dispatchEvent(new Event('storage'))
  }
  const sync=async()=>{
   const {data}=await client.auth.getSession()
   if(!alive)return
   authRef.current=Boolean(data.session)
   if(!data.session)clearGuestSaved()
  }
  void sync()
  const {data:sub}=client.auth.onAuthStateChange((_event,session)=>{
   authRef.current=Boolean(session)
   if(!session)clearGuestSaved()
   if(session)setOpen(false)
  })
  const onClick=(event:MouseEvent)=>{
   const target=(event.target as HTMLElement|null)?.closest('.pm-save') as HTMLButtonElement|null
   if(!target)return
   if(authRef.current===true)return
   event.preventDefault();event.stopPropagation();event.stopImmediatePropagation()
   if(authRef.current===false){setOpen(true);return}
   void client.auth.getSession().then(({data})=>{
    authRef.current=Boolean(data.session)
    if(data.session){window.setTimeout(()=>target.click(),0)}
    else{clearGuestSaved();setOpen(true)}
   }).catch(()=>{authRef.current=false;clearGuestSaved();setOpen(true)})
  }
  document.addEventListener('click',onClick,true)
  return()=>{alive=false;document.removeEventListener('click',onClick,true);sub.subscription.unsubscribe()}
 },[])

 if(!open)return null
 return <div className="pm-save-auth-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}>
  <section className="pm-save-auth-modal" role="dialog" aria-modal="true" aria-labelledby="pm-save-auth-title">
   <button type="button" className="pm-save-auth-close" onClick={()=>setOpen(false)} aria-label="Cerrar">×</button>
   <span className="pm-save-auth-icon">♡</span>
   <span className="pm-save-auth-kicker">GUARDAR OPORTUNIDAD</span>
   <h2 id="pm-save-auth-title">Iniciá sesión para guardar este empleo.</h2>
   <p>Así lo encontrás después en Favoritos desde tu cuenta y no perdés la publicación.</p>
   <div className="pm-save-auth-actions"><a href="/login?next=/empleos">Iniciar sesión</a><a href="/registro?next=/empleos" className="secondary">Crear cuenta</a></div>
  </section>
  <style>{`
   .pm-save-auth-backdrop{position:fixed;inset:0;z-index:3000;display:grid;place-items:center;padding:20px;background:rgba(11,13,20,.44);backdrop-filter:blur(10px)}
   .pm-save-auth-modal{position:relative;width:min(430px,100%);padding:30px;border:1px solid rgba(255,255,255,.72);border-radius:28px;background:linear-gradient(145deg,rgba(255,255,255,.97),rgba(247,247,255,.95));box-shadow:0 30px 90px rgba(20,22,40,.28);color:#151720}
   .pm-save-auth-close{position:absolute;right:14px;top:14px;width:36px;height:36px;border:0;border-radius:50%;background:#eef0f4;color:#30333b;font-size:23px;line-height:1;cursor:pointer}
   .pm-save-auth-icon{display:grid;place-items:center;width:48px;height:48px;border-radius:16px;background:#151720;color:#d9ff59;font-size:25px;margin-bottom:18px}
   .pm-save-auth-kicker{display:block;color:#6657ff;font-size:9px;font-weight:950;letter-spacing:.14em}
   .pm-save-auth-modal h2{margin:8px 0 10px;font-size:28px;line-height:1.02;letter-spacing:-.045em}.pm-save-auth-modal p{margin:0;color:#666b77;font-size:13px;line-height:1.55}
   .pm-save-auth-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:22px}.pm-save-auth-actions a{display:grid;place-items:center;min-height:48px;border-radius:14px;background:#151720;color:#fff;text-decoration:none;font-size:12px;font-weight:900}.pm-save-auth-actions a.secondary{background:#fff;color:#151720;border:1px solid #dfe2e8}
   @media(max-width:560px){.pm-save-auth-modal{padding:26px 22px;border-radius:24px}.pm-save-auth-modal h2{font-size:24px}.pm-save-auth-actions{grid-template-columns:1fr}}
  `}</style>
 </div>
}
