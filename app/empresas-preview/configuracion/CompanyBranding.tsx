'use client'

import {useEffect,useRef,useState} from 'react'
import {cvAuthClient} from '../../cv-ia/cvAuth'

type Company={id:string;name:string;logo_path?:string|null}
const PUBLIC_BASE='https://pejkycdttogpmmdntzuq.supabase.co/storage/v1/object/public/postula-branding/'

export default function CompanyBranding(){
 const input=useRef<HTMLInputElement>(null)
 const [company,setCompany]=useState<Company|null>(null),[role,setRole]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState('')
 useEffect(()=>{void(async()=>{const {data}=await cvAuthClient().auth.getSession();if(!data.session)return;const r=await fetch('/api/postula/company',{headers:{Authorization:`Bearer ${data.session.access_token}`},cache:'no-store'});const d=await r.json().catch(()=>({}));const member=(d?.memberships||[])[0];const c=Array.isArray(member?.pm_companies)?member.pm_companies[0]:member?.pm_companies;if(c){setCompany(c);setRole(String(member?.role||''))}})()},[])
 async function upload(file:File){if(!company||!['owner','admin'].includes(role))return;setBusy(true);setNotice('');try{if(file.size>2*1024*1024)throw new Error('El logo puede pesar hasta 2 MB.');if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Usá JPG, PNG o WEBP.');const {data}=await cvAuthClient().auth.getSession();const token=data.session?.access_token;if(!token)throw new Error('Tu sesión venció.');const ext=(file.name.split('.').pop()||'png').toLowerCase();const path=`${company.id}/logo-${Date.now()}.${ext}`;const {error}=await cvAuthClient().storage.from('postula-branding').upload(path,file,{upsert:false,contentType:file.type});if(error)throw error;const r=await fetch('/api/postula/company',{method:'PATCH',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({company_id:company.id,logo_path:path})});const d=await r.json().catch(()=>({}));if(!r.ok||!d?.ok)throw new Error(d?.error||'No pudimos guardar el logo.');setCompany(v=>v?{...v,logo_path:path}:v);setNotice('Logo actualizado. Se usará en tus avisos públicos cuando la búsqueda no sea confidencial.')}catch(e){setNotice(e instanceof Error?e.message:'No pudimos subir el logo.')}finally{setBusy(false)}}
 if(!company)return null
 const canEdit=['owner','admin'].includes(role)
 const src=company.logo_path?`${PUBLIC_BASE}${company.logo_path}`:''
 return <section className="pm31-branding-wrap"><article className="pm31-branding-card"><div className="pm31-branding-preview">{src?<img src={src} alt={`Logo de ${company.name}`}/>:<span>{company.name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()}</span>}</div><div className="pm31-branding-copy"><span>IMAGEN DE EMPRESA</span><h2>Que tus búsquedas tengan identidad.</h2><p>Podés cargar un logo o imagen cuadrada. Es opcional: si no subís nada, Postulá Mejor muestra las iniciales de la empresa. En búsquedas confidenciales el logo no se muestra.</p>{notice&&<small>{notice}</small>}</div>{canEdit&&<div className="pm31-branding-actions"><button type="button" onClick={()=>input.current?.click()} disabled={busy}>{busy?'Subiendo…':src?'Cambiar logo':'Subir logo'}</button><input ref={input} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>e.target.files?.[0]&&void upload(e.target.files[0])}/><small>JPG, PNG o WEBP · máximo 2 MB</small></div>}</article></section>
}
