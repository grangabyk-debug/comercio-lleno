'use client'

import {useEffect,useRef,useState} from 'react'
import {cvAuthClient} from '../../cv-ia/cvAuth'

type Company={id:string;name:string;logo_path?:string|null}
const PUBLIC_BASE='https://pejkycdttogpmmdntzuq.supabase.co/storage/v1/object/public/postula-branding/'
function extension(file:File){return file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg'}
function firstCompany(value:any){return Array.isArray(value)?value[0]:value}

export default function CompanyBranding(){
 const input=useRef<HTMLInputElement>(null)
 const [company,setCompany]=useState<Company|null>(null),[role,setRole]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[logoFailed,setLogoFailed]=useState(false)
 async function readCompany(token:string){const r=await fetch('/api/postula/company',{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});const d=await r.json().catch(()=>({}));const member=(d?.memberships||[])[0];const c=firstCompany(member?.pm_companies);if(c){setCompany(c);setRole(String(member?.role||''));setLogoFailed(false)}return c as Company|undefined}
 useEffect(()=>{void(async()=>{const {data}=await cvAuthClient().auth.getSession();if(data.session)await readCompany(data.session.access_token)})()},[])
 async function upload(file:File){if(!company||!['owner','admin'].includes(role))return;setBusy(true);setNotice('');let uploaded='';try{if(file.size>2*1024*1024)throw new Error('El logo puede pesar hasta 2 MB.');if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Usá JPG, PNG o WEBP.');const client=cvAuthClient();const {data}=await client.auth.getSession();const token=data.session?.access_token;if(!token)throw new Error('Tu sesión venció.');uploaded=`${company.id}/logo-${Date.now()}.${extension(file)}`;const {error}=await client.storage.from('postula-branding').upload(uploaded,file,{upsert:false,contentType:file.type,cacheControl:'3600'});if(error)throw error;const r=await fetch('/api/postula/company',{method:'PATCH',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({company_id:company.id,logo_path:uploaded})});const d=await r.json().catch(()=>({}));if(!r.ok||!d?.ok)throw new Error(d?.error||'No pudimos guardar la imagen de la empresa.');const saved=await readCompany(token);if(saved?.logo_path!==uploaded)throw new Error('La imagen se subió pero no quedó asociada a la empresa. Probá nuevamente.');setNotice('Imagen de empresa guardada. Ya quedó asociada al perfil y a tus publicaciones públicas.')}catch(e){if(uploaded)await cvAuthClient().storage.from('postula-branding').remove([uploaded]).catch(()=>{});setNotice(e instanceof Error?e.message:'No pudimos subir la imagen.')}finally{setBusy(false);if(input.current)input.current.value=''}}
 if(!company)return null
 const canEdit=['owner','admin'].includes(role)
 const src=company.logo_path&&!logoFailed?`${PUBLIC_BASE}${company.logo_path}`:''
 const fallback=company.name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'PM'
 return <section className="pm31-branding-wrap"><article className="pm31-branding-card"><div className="pm31-branding-preview">{src?<img src={src} alt={`Imagen de ${company.name}`} onError={()=>setLogoFailed(true)}/>:<span>{fallback}</span>}</div><div className="pm31-branding-copy"><span>IMAGEN DE EMPRESA</span><h2>La identidad de tu empresa.</h2><p>Subí un logo o una imagen cuadrada. Se guarda en el perfil de la empresa y se usa en las publicaciones públicas cuando la búsqueda no es confidencial.</p>{notice&&<small>{notice}</small>}</div>{canEdit&&<div className="pm31-branding-actions"><button type="button" onClick={()=>input.current?.click()} disabled={busy}>{busy?'Guardando…':src?'Cambiar imagen':'Subir imagen'}</button><input ref={input} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>e.target.files?.[0]&&void upload(e.target.files[0])}/><small>JPG, PNG o WEBP · máximo 2 MB</small></div>}</article></section>
}
