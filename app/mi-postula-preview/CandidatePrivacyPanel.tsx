'use client'

import {useEffect,useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'

type Visibility='discoverable'|'applications_only'|'private'
type CandidatePrivacy={profile_visibility:Visibility;public_photo:boolean;public_location:boolean;public_headline:boolean;public_skills:boolean}
const defaults:CandidatePrivacy={profile_visibility:'applications_only',public_photo:true,public_location:true,public_headline:true,public_skills:true}

export default function CandidatePrivacyPanel(){
 const [ready,setReady]=useState(false),[visible,setVisible]=useState(false),[settings,setSettings]=useState<CandidatePrivacy>(defaults),[busy,setBusy]=useState(false),[notice,setNotice]=useState('')
 useEffect(()=>{void(async()=>{const {data}=await cvAuthClient().auth.getSession();const session=data.session;if(!session){setReady(true);return}try{const r=await fetch('/api/postula/profile',{headers:{Authorization:`Bearer ${session.access_token}`},cache:'no-store'});const d=await r.json().catch(()=>({}));const c=d?.candidate||{};const meaningful=Boolean(c&&(c.city||c.headline||c.resume_name||(c.skills||[]).length));const activated=meaningful||d?.profile?.primary_role==='candidate'||Boolean((d?.consents||[]).some((x:any)=>x.consent_type==='candidate_profile_activation'&&x.accepted));setVisible(activated);if(activated)setSettings({profile_visibility:['discoverable','applications_only','private'].includes(c.profile_visibility)?c.profile_visibility:'applications_only',public_photo:c.public_photo!==false,public_location:c.public_location!==false,public_headline:c.public_headline!==false,public_skills:c.public_skills!==false})}finally{setReady(true)}})()},[])
 async function save(){setBusy(true);setNotice('');try{const {data}=await cvAuthClient().auth.getSession();const token=data.session?.access_token;if(!token)return;const r=await fetch('/api/postula/profile',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({candidate_settings:true,...settings})});const d=await r.json().catch(()=>({}));if(!r.ok||!d?.ok)throw new Error(d?.error||'No pudimos guardar la privacidad.');setNotice('Privacidad actualizada.')}catch(e){setNotice(e instanceof Error?e.message:'No pudimos guardar la privacidad.')}finally{setBusy(false)}}
 if(!ready||!visible)return null
 const publicMode=settings.profile_visibility==='discoverable'
 return <section className="pm31-privacy-wrap"><article className="pm31-privacy-card"><div className="pm31-privacy-copy"><span>PRIVACIDAD DEL PERFIL</span><h2>Vos decidís cuándo te pueden descubrir.</h2><p>Si te postulás a una oferta, la empresa de esa búsqueda puede ver los datos de tu perfil necesarios para evaluarte, aunque no tengas un perfil público.</p></div><div className="pm31-visibility-options">
  <button type="button" data-on={settings.profile_visibility==='discoverable'} onClick={()=>setSettings(v=>({...v,profile_visibility:'discoverable'}))}><b>Visible para oportunidades</b><small>Tu perfil puede aparecer en búsquedas de empresas habilitadas.</small></button>
  <button type="button" data-on={settings.profile_visibility==='applications_only'} onClick={()=>setSettings(v=>({...v,profile_visibility:'applications_only'}))}><b>Sólo cuando me postulo</b><small>No aparecés en búsquedas generales. La empresa te ve al postularte.</small></button>
  <button type="button" data-on={settings.profile_visibility==='private'} onClick={()=>setSettings(v=>({...v,profile_visibility:'private'}))}><b>Privado</b><small>Fuera de tus postulaciones y conversaciones no mostramos tu perfil.</small></button>
 </div><div className="pm31-public-fields" data-muted={!publicMode}><div><b>Si tu perfil está visible, elegí qué mostrar</b><small>Tu email, teléfono, CV completo y datos sensibles nunca se publican como parte del perfil abierto.</small></div>{[
  ['public_photo','Foto de perfil'],['public_location','Ciudad / zona'],['public_headline','Título profesional'],['public_skills','Habilidades']
 ].map(([key,label])=><label key={key}><span>{label}</span><input type="checkbox" checked={Boolean(settings[key as keyof CandidatePrivacy])} onChange={e=>setSettings(v=>({...v,[key]:e.target.checked}))}/></label>)}</div><div className="pm31-privacy-actions"><button type="button" onClick={save} disabled={busy}>{busy?'Guardando…':'Guardar privacidad'}</button><span>{notice||'La foto sigue siendo opcional. Podés usar la cuenta sin subir ninguna imagen.'}</span></div></article></section>
}
