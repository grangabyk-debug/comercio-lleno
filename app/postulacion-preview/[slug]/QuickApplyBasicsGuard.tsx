'use client'

import {FormEvent,useEffect,useState} from 'react'
import {useSearchParams} from 'next/navigation'
import {cvAuthClient} from '../../cv-ia/cvAuth'
import styles from '../../postula-preview/platform.module.css'

type Basics={name:string;email:string;phone:string;city:string;resumePath:string;resumeName:string}
const gateCss=`
.pm-quick-basics-gated>form:not(.pm-quick-basics-card){display:none!important}.pm-quick-basics-card .pm-qb-email input{background:#f2f5f8;color:#687785}.pm-quick-basics-note{margin:12px 0 18px;border:1px solid #dbe3ea;background:#f8fafc;border-radius:14px;padding:12px 14px;font-size:12px;line-height:1.5;color:#5f7080}.pm-quick-basics-error{margin:12px 0;border-radius:12px;background:#fff0f0;border:1px solid #ffcaca;padding:11px 13px;color:#a51d1d;font-size:12px;font-weight:700}
`

export default function QuickApplyBasicsGuard(){
 const search=useSearchParams(),quick=search.get('rapida')==='1'
 const [checking,setChecking]=useState(quick),[needs,setNeeds]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[file,setFile]=useState<File|null>(null),[data,setData]=useState<Basics>({name:'',email:'',phone:'',city:'',resumePath:'',resumeName:''})
 useEffect(()=>{if(!quick){setChecking(false);return}void(async()=>{const {data:s}=await cvAuthClient().auth.getSession();if(!s.session){setChecking(false);return}const r=await fetch('/api/postula/profile',{headers:{Authorization:`Bearer ${s.session.access_token}`},cache:'no-store'}),d=await r.json().catch(()=>({}));const next={name:String(d.profile?.display_name||s.session.user.user_metadata?.full_name||''),email:String(s.session.user.email||''),phone:String(d.candidate?.phone||''),city:String(d.candidate?.city||''),resumePath:String(d.candidate?.resume_path||''),resumeName:String(d.candidate?.resume_name||'')};setData(next);setNeeds(!next.name||!next.email||!next.phone||!next.city||!next.resumePath);setChecking(false)})()},[quick])
 useEffect(()=>{if(!quick)return;const flow=document.querySelector<HTMLElement>('[data-pm-apply-flow]');if(!flow)return;flow.classList.toggle('pm-quick-basics-gated',checking||needs);return()=>flow.classList.remove('pm-quick-basics-gated')},[quick,checking,needs])
 async function save(e:FormEvent){
  e.preventDefault();setError('')
  if(!data.name.trim()||!data.email.trim()||!data.phone.trim()||!data.city.trim()){setError('Completá nombre y apellido, teléfono y ciudad antes de seguir.');return}
  if(!data.resumePath&&!file){setError('Necesitás tener un CV guardado para usar Postulación rápida.');return}
  setBusy(true)
  try{
   const {data:s}=await cvAuthClient().auth.getSession();if(!s.session)throw new Error('Tu sesión venció.')
   let resumePath=data.resumePath,resumeName=data.resumeName
   if(!resumePath&&file){
    const ext=(file.name.split('.').pop()||'pdf').toLowerCase();if(!['pdf','doc','docx'].includes(ext))throw new Error('El CV tiene que ser PDF, DOC o DOCX.')
    resumePath=`${s.session.user.id}/resume-${Date.now()}.${ext}`
    const {error:upError}=await cvAuthClient().storage.from('postula-private').upload(resumePath,file,{upsert:false});if(upError)throw upError
    resumeName=file.name
   }
   const r=await fetch('/api/postula/profile',{method:'POST',headers:{Authorization:`Bearer ${s.session.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({role:'candidate',display_name:data.name.trim(),phone:data.phone.trim(),city:data.city.trim(),resume_path:resumePath,resume_name:resumeName,onboarding_completed:true})})
   const d=await r.json().catch(()=>({}));if(!r.ok||!d?.ok)throw new Error(d?.error||'No pudimos guardar tus datos básicos.')
   window.location.reload()
  }catch(e){setError(e instanceof Error?e.message:'No pudimos guardar tus datos básicos.');setBusy(false)}
 }
 if(!quick)return null
 if(checking)return <><style>{gateCss}</style><div className={`${styles.formCard} pm-quick-basics-card`}><span className={styles.miniLabel}>POSTULACIÓN RÁPIDA</span><h1>Preparando tus datos…</h1><p>Estamos revisando lo básico de tu perfil antes de continuar.</p></div></>
 if(!needs)return <style>{gateCss}</style>
 return <><style>{gateCss}</style><form className={`${styles.formCard} pm-quick-basics-card`} onSubmit={save}><span className={styles.miniLabel}>POSTULACIÓN RÁPIDA · DATOS BÁSICOS</span><h1>Completá esto una sola vez.</h1><p>Nombre, email, teléfono, ubicación y CV quedan guardados en tu perfil. Después, las próximas postulaciones rápidas los reutilizan automáticamente.</p><div className={styles.fieldRow}><div className={styles.field}><label>Nombre y apellido *</label><input value={data.name} onChange={e=>setData(v=>({...v,name:e.target.value}))} autoComplete="name"/></div><div className={`${styles.field} pm-qb-email`}><label>Email *</label><input value={data.email} readOnly type="email"/></div></div><div className={styles.fieldRow}><div className={styles.field}><label>Teléfono *</label><input value={data.phone} onChange={e=>setData(v=>({...v,phone:e.target.value}))} inputMode="tel" autoComplete="tel"/></div><div className={styles.field}><label>Ciudad / zona *</label><input value={data.city} onChange={e=>setData(v=>({...v,city:e.target.value}))} placeholder="Ej. Flores, CABA"/></div></div>{data.resumePath?<div className={styles.questionCard}><b>CV guardado:</b> {data.resumeName||'CV de tu perfil'}</div>:<div className={styles.field}><label>CV *</label><input type="file" accept=".pdf,.doc,.docx" onChange={e=>setFile(e.target.files?.[0]||null)}/></div>}<div className="pm-quick-basics-note">Al continuar no se envía todavía la postulación. Primero guardamos estos datos y después vas a ver la pantalla final para elegir disponibilidad, experiencia y autorizar el envío.</div>{error&&<div className="pm-quick-basics-error">{error}</div>}<div className={styles.heroActions}><button type="submit" className={styles.buttonDark} disabled={busy}>{busy?'Guardando…':'Guardar y continuar'}</button></div></form></>
}
