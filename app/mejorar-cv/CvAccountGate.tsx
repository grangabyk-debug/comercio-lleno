'use client'

import Link from 'next/link'
import {useEffect,useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'

const styles=`
.pmcv-account-gate{position:fixed;inset:0;z-index:12000;display:grid;place-items:center;padding:20px;background:rgba(7,13,20,.72);backdrop-filter:blur(10px)}
.pmcv-account-card{position:relative;width:min(690px,100%);padding:38px;border-radius:30px;background:#fff;color:#111821;box-shadow:0 34px 110px rgba(0,0,0,.36)}
.pmcv-account-close{position:absolute;right:18px;top:18px;width:42px;height:42px;border:0;border-radius:50%;background:#111821;color:#fff;font-size:25px;line-height:1;cursor:pointer}
.pmcv-account-kicker{display:block;margin-bottom:10px;color:#6257ff;font-size:9px;font-weight:950;letter-spacing:.18em;text-transform:uppercase}
.pmcv-account-card h2{margin:0;padding-right:45px;font-size:clamp(34px,5vw,52px);line-height:.95;letter-spacing:-.055em}
.pmcv-account-card>p{margin:10px 0 24px;color:#5f6871;font-size:13px;line-height:1.5}
.pmcv-account-options{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.pmcv-account-option{min-height:145px;padding:22px;border-radius:24px;display:flex;flex-direction:column;justify-content:flex-end;text-decoration:none;border:1px solid rgba(17,24,33,.1);transition:transform .18s ease,box-shadow .18s ease}
.pmcv-account-option:hover{transform:translateY(-2px);box-shadow:0 18px 38px rgba(17,24,33,.12)}
.pmcv-account-option small{font-size:9px;font-weight:950;letter-spacing:.04em}.pmcv-account-option b{margin-top:8px;font-size:20px;line-height:1.05}.pmcv-account-option span{margin-top:7px;font-size:10px;line-height:1.4;opacity:.72}
.pmcv-account-login{background:#111821;color:#fff}.pmcv-account-create{background:#d8ff4f;color:#111821}
.pmcv-account-note{margin:18px 0 0!important;text-align:center;color:#7b858d!important;font-size:10px!important}
.pmcv-glass-lens,.pmcv-glass-source{-webkit-font-smoothing:antialiased!important;text-rendering:geometricPrecision!important}
.pmcv-glass-lens{transform-style:flat!important;will-change:auto!important}
@keyframes pmcvLensA{50%{transform:translate(5px,-8px) rotate(-2.5deg)}}
@keyframes pmcvLensB{50%{transform:translate(-6px,8px) rotate(1.5deg)}}
@keyframes pmcvLensC{50%{transform:translate(7px,-6px) rotate(.5deg)}}
@media(max-width:620px){.pmcv-account-card{padding:30px 18px 20px;border-radius:25px}.pmcv-account-options{grid-template-columns:1fr}.pmcv-account-option{min-height:112px;padding:18px}.pmcv-account-card h2{font-size:36px}}
`

export default function CvAccountGate(){
 const[open,setOpen]=useState(false)
 useEffect(()=>{
  const client=cvAuthClient()
  let alive=true
  const onClick=(event:MouseEvent)=>{
   const target=event.target as HTMLElement|null
   const button=target?.closest('#analisis button') as HTMLButtonElement|null
   if(!button)return
   const klass=String(button.className||'').toLowerCase()
   const text=String(button.textContent||'').toLowerCase()
   if(!klass.includes('dropzone')&&!text.includes('elegir mi cv'))return
   event.preventDefault();event.stopPropagation();event.stopImmediatePropagation()
   void client.auth.getSession().then(({data})=>{
    if(!alive)return
    if(!data.session){setOpen(true);return}
    const input=document.querySelector('#analisis input[type="file"]') as HTMLInputElement|null
    input?.click()
   })
  }
  document.addEventListener('click',onClick,true)
  return()=>{alive=false;document.removeEventListener('click',onClick,true)}
 },[])
 return <><style>{styles}</style>{open&&<div className="pmcv-account-gate" role="dialog" aria-modal="true" aria-label="Ingresar para cargar tu CV" onMouseDown={event=>{if(event.target===event.currentTarget)setOpen(false)}}><div className="pmcv-account-card"><button type="button" className="pmcv-account-close" aria-label="Cerrar" onClick={()=>setOpen(false)}>×</button><span className="pmcv-account-kicker">MEJORAR CV</span><h2>¿Ya tenés una cuenta?</h2><p>Para cargar tu CV y continuar con el análisis necesitás iniciar sesión o crear tu cuenta gratuita.</p><div className="pmcv-account-options"><Link className="pmcv-account-option pmcv-account-login" href="/login?next=%2Fmejorar-cv"><small>YA TENGO CUENTA</small><b>Iniciar sesión</b><span>Entrás y volvés directo a Mejorar CV.</span></Link><Link className="pmcv-account-option pmcv-account-create" href="/registro?next=%2Fmejorar-cv"><small>SOY NUEVO/A</small><b>Crear cuenta gratis</b><span>Una cuenta sirve para empleos, CV y Servicios Flex.</span></Link></div><p className="pmcv-account-note">La carga del currículum queda bloqueada hasta iniciar sesión.</p></div></div>}</>
}
