'use client'

import {FormEvent,useEffect,useState} from 'react'
import {cvAuthClient} from '../../cv-ia/cvAuth'

type Company={id:string;name:string;legal_name?:string|null;verification_status:string;trust_score:number;industry?:string|null;city?:string|null;province?:string|null;website?:string|null;phone?:string|null;tax_id?:string|null;description?:string|null}
type Summary={company:Company;my_role:string;verification:{checks:Array<{id:string;kind:string;status:string}>}}
type FormState={name:string;legal_name:string;industry:string;city:string;province:string;website:string;phone:string;tax_id:string;description:string}

async function currentSession(){const {data}=await cvAuthClient().auth.getSession();return data.session}
function formFrom(c:Company):FormState{return{name:c.name||'',legal_name:c.legal_name||'',industry:c.industry||'',city:c.city||'',province:c.province||'',website:c.website||'',phone:c.phone||'',tax_id:c.tax_id||'',description:c.description||''}}
const checkLabel:Record<string,string>={basic_identity:'Identidad básica',work_email:'Email laboral',website:'Sitio web',tax:'Datos fiscales',phone:'Teléfono',manual:'Revisión manual'}

export default function EmployerCompanyProfile(){
 const [data,setData]=useState<Summary|null>(null),[form,setForm]=useState<FormState|null>(null),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[notice,setNotice]=useState('')
 async function load(){setLoading(true);setNotice('');try{const s=await currentSession();if(!s)throw new Error('Iniciá sesión.');const r=await fetch('/api/postula/company/account',{headers:{Authorization:`Bearer ${s.access_token}`},cache:'no-store'});const d=await r.json().catch(()=>({}));if(!r.ok||!d?.ok)throw new Error(d?.error||'No pudimos cargar la empresa.');setData(d);setForm(formFrom(d.company))}catch(e){setNotice(e instanceof Error?e.message:'No pudimos cargar la empresa.')}finally{setLoading(false)}}
 useEffect(()=>{void load()},[])
 async function save(e:FormEvent){e.preventDefault();if(!data||!form||busy)return;setBusy(true);setNotice('');try{const s=await currentSession();if(!s)throw new Error('Iniciá sesión.');const r=await fetch('/api/postula/company',{method:'PATCH',headers:{Authorization:`Bearer ${s.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({company_id:data.company.id,...form})});const d=await r.json().catch(()=>({}));if(!r.ok||!d?.ok)throw new Error(d?.error||'No pudimos guardar los datos.');setNotice('Datos de empresa guardados.');await load()}catch(e){setNotice(e instanceof Error?e.message:'No pudimos guardar los datos.')}finally{setBusy(false)}}
 if(loading)return <div className="pm51-loading">Cargando datos de empresa…</div>
 if(!data||!form)return <div className="pm51-empty">{notice||'No encontramos una empresa vinculada.'}</div>
 const canEdit=['owner','admin'].includes(data.my_role)
 return <section className="pm51-panel pm51-company-profile">
  <div className="pm51-panel-head"><div><span>DATOS DE EMPRESA</span><h2>Identidad y datos públicos.</h2><p>Acá modificás lo que identifica a tu empresa. Planes, pagos y permisos están separados para que no se mezcle todo.</p></div><div className="pm51-trust"><strong>{data.company.trust_score||0}%</strong><small>{data.company.verification_status==='verified'?'Empresa verificada':'Validación básica'}</small></div></div>
  <form className="pm51-company-form" onSubmit={save}>
   <label>Nombre de empresa<input value={form.name} disabled={!canEdit} onChange={e=>setForm(v=>v?{...v,name:e.target.value}:v)} required minLength={2}/></label>
   <label>Razón social<input value={form.legal_name} disabled={!canEdit} onChange={e=>setForm(v=>v?{...v,legal_name:e.target.value}:v)} placeholder="Opcional"/></label>
   <label>Actividad / rubro<input value={form.industry} disabled={!canEdit} onChange={e=>setForm(v=>v?{...v,industry:e.target.value}:v)}/></label>
   <label>Ciudad<input value={form.city} disabled={!canEdit} onChange={e=>setForm(v=>v?{...v,city:e.target.value}:v)}/></label>
   <label>Provincia<input value={form.province} disabled={!canEdit} onChange={e=>setForm(v=>v?{...v,province:e.target.value}:v)}/></label>
   <label>Teléfono<input value={form.phone} disabled={!canEdit} onChange={e=>setForm(v=>v?{...v,phone:e.target.value}:v)}/></label>
   <label>Web<input value={form.website} disabled={!canEdit} onChange={e=>setForm(v=>v?{...v,website:e.target.value}:v)} placeholder="https://…"/></label>
   <label>CUIT / ID fiscal<input value={form.tax_id} disabled={!canEdit} onChange={e=>setForm(v=>v?{...v,tax_id:e.target.value}:v)}/></label>
   <label className="wide">Descripción<textarea value={form.description} disabled={!canEdit} onChange={e=>setForm(v=>v?{...v,description:e.target.value}:v)} rows={4} maxLength={2000} placeholder="Contá brevemente qué hace la empresa."/></label>
   {canEdit&&<div className="pm51-form-actions"><button disabled={busy}>{busy?'Guardando…':'Guardar cambios'}</button></div>}
  </form>
  {data.verification.checks?.length>0&&<div className="pm51-checks"><b>Señales de validación</b><div>{data.verification.checks.slice(0,6).map(x=><span key={x.id} data-ok={x.status==='passed'||x.status==='verified'}>{checkLabel[x.kind]||x.kind}<i>{x.status==='passed'||x.status==='verified'?'✓':'·'}</i></span>)}</div></div>}
  {notice&&<p className="pm51-notice">{notice}</p>}
 </section>
}
