'use client'

import {FormEvent,useMemo,useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'

type MinePost={id:string;title:string;category?:string;description?:string;location_text?:string;compensation_text?:string;scheduled_for?:string|null;status:string;created_at?:string}
type ConfirmAction={kind:'finish'|'remove';post:MinePost}|null

function statusLabel(status:string){if(status==='published')return'Activa';if(status==='closed')return'Finalizada';if(status==='removed')return'Eliminada';if(status==='paused')return'Pausada';if(status==='review')return'En revisión';return'Borrador'}
function statusHelp(status:string){if(status==='published')return'Visible en Servicios Flex';if(status==='closed')return'Ya no se muestra públicamente';if(status==='removed')return'Eliminada de la vista pública';return'No está visible públicamente'}
function dateLabel(value?:string){if(!value)return'';const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toLocaleDateString('es-AR',{day:'2-digit',month:'short',year:'numeric'})}

export default function FlexManager(){
 const[open,setOpen]=useState(false)
 const[loading,setLoading]=useState(false)
 const[busy,setBusy]=useState(false)
 const[posts,setPosts]=useState<MinePost[]>([])
 const[notice,setNotice]=useState('')
 const[editId,setEditId]=useState('')
 const[editText,setEditText]=useState('')
 const[confirm,setConfirm]=useState<ConfirmAction>(null)

 const visible=useMemo(()=>posts.filter(p=>p.status!=='removed'),[posts])
 const activeCount=useMemo(()=>posts.filter(p=>p.status==='published').length,[posts])

 async function token(){const{data}=await cvAuthClient().auth.getSession();return data.session?.access_token||''}
 async function load(){
  const t=await token();if(!t){location.assign('/login?next=/servicios-flex');return}
  setLoading(true);setNotice('')
  try{const r=await fetch('/api/postula/flex?mine=1',{headers:{Authorization:`Bearer ${t}`},cache:'no-store'});const d=await r.json().catch(()=>({}));if(!r.ok||!d?.ok)throw new Error(d?.error||'No pudimos cargar tus publicaciones.');setPosts(Array.isArray(d.posts)?d.posts:[])}catch(e){setNotice(e instanceof Error?e.message:'No pudimos cargar tus publicaciones.')}finally{setLoading(false)}
 }
 async function openManager(){setOpen(true);setEditId('');setConfirm(null);await load()}
 async function action(kind:'edit_description'|'finish'|'remove',post:MinePost,description?:string){
  if(busy)return;const t=await token();if(!t){location.assign('/login?next=/servicios-flex');return}
  setBusy(true);setNotice('')
  try{const r=await fetch('/api/postula/flex/manage',{method:'POST',headers:{Authorization:`Bearer ${t}`,'Content-Type':'application/json'},body:JSON.stringify({action:kind,post_id:post.id,description})});const d=await r.json().catch(()=>({}));if(!r.ok||!d?.ok)throw new Error(d?.error||'No pudimos actualizar la publicación.');setNotice(String(d.message||'Publicación actualizada.'));setEditId('');setConfirm(null);await load();window.setTimeout(()=>location.reload(),700)}catch(e){setNotice(e instanceof Error?e.message:'No pudimos actualizar la publicación.')}finally{setBusy(false)}
 }
 function startEdit(post:MinePost){setConfirm(null);setEditId(post.id);setEditText(String(post.description||''));setNotice('')}
 function saveEdit(e:FormEvent,post:MinePost){e.preventDefault();void action('edit_description',post,editText)}

 return <>
  <div className="pm37-launch"><div><span>TUS SERVICIOS FLEX</span><b>Administrá lo que publicaste</b><small>Podés editar solo la descripción, finalizar o eliminar una publicación. El crédito usado no se reintegra.</small></div><button type="button" onClick={()=>void openManager()}>Mis publicaciones</button></div>

  {open&&<div className="pm37-overlay" role="dialog" aria-modal="true" aria-labelledby="pm37-title"><section className="pm37-card">
   <header><div><span>GESTIÓN DE SERVICIOS FLEX</span><h2 id="pm37-title">Mis publicaciones</h2><p>{activeCount?`${activeCount} ${activeCount===1?'publicación activa':'publicaciones activas'}`:'No tenés publicaciones activas'} · los créditos consumidos no vuelven al finalizar o eliminar.</p></div><button type="button" onClick={()=>setOpen(false)} aria-label="Cerrar">×</button></header>
   {notice&&<div className="pm37-notice">{notice}</div>}
   {loading?<div className="pm37-empty"><b>Cargando publicaciones…</b></div>:visible.length===0?<div className="pm37-empty"><b>Todavía no tenés publicaciones para administrar.</b><p>Cuando publiques un Servicio Flex, va a aparecer acá.</p></div>:<div className="pm37-list">{visible.map(post=><article key={post.id} data-status={post.status}>
    <div className="pm37-post-main"><div className="pm37-post-top"><span className="pm37-status">{statusLabel(post.status)}</span><small>{dateLabel(post.created_at)}</small></div><h3>{post.title}</h3><p>{post.description||'Sin descripción'}</p><div className="pm37-meta"><span>{post.category||'Sin categoría'}</span><span>{post.location_text||'Zona a coordinar'}</span>{post.compensation_text&&<span>{post.compensation_text}</span>}</div><small className="pm37-status-help">{statusHelp(post.status)}</small></div>
    {editId===post.id?<form className="pm37-edit" onSubmit={e=>saveEdit(e,post)}><label><b>Editar descripción</b><span>Por seguridad, título, categoría, zona, fecha e importe quedan bloqueados.</span><textarea value={editText} onChange={e=>setEditText(e.target.value)} minLength={15} maxLength={1800} required/></label><div><button type="button" className="secondary" onClick={()=>setEditId('')}>Cancelar</button><button disabled={busy||editText.trim().length<15}>{busy?'Guardando…':'Guardar descripción'}</button></div></form>:<div className="pm37-actions">{post.status==='published'&&<><button type="button" className="secondary" onClick={()=>startEdit(post)}>Editar descripción</button><button type="button" className="finish" onClick={()=>setConfirm({kind:'finish',post})}>Finalizar</button><button type="button" className="danger" onClick={()=>setConfirm({kind:'remove',post})}>Eliminar</button></>}{post.status==='closed'&&<button type="button" className="danger ghost" onClick={()=>setConfirm({kind:'remove',post})}>Eliminar del listado</button>}</div>}
   </article>)}</div>}
   <footer><span>Finalizar o eliminar no devuelve el crédito Flex que se usó para publicar.</span><button type="button" onClick={()=>setOpen(false)}>Cerrar</button></footer>
  </section></div>}

  {confirm&&<div className="pm37-confirm-overlay" role="dialog" aria-modal="true"><section className="pm37-confirm"><span>{confirm.kind==='finish'?'FINALIZAR PUBLICACIÓN':'ELIMINAR PUBLICACIÓN'}</span><h3>{confirm.post.title}</h3><p>{confirm.kind==='finish'?'La publicación dejará de mostrarse en Servicios Flex y quedará marcada como finalizada.':'La publicación se ocultará de Servicios Flex y también de tu listado de gestión.'}</p><div className="pm37-credit-warning"><b>El crédito Flex se pierde.</b><small>El crédito ya fue consumido al publicar y no se reintegra aunque finalices o elimines el servicio.</small></div><div><button type="button" className="secondary" onClick={()=>setConfirm(null)}>Volver</button><button type="button" className={confirm.kind==='remove'?'danger':'finish'} disabled={busy} onClick={()=>void action(confirm.kind,confirm.post)}>{busy?'Procesando…':confirm.kind==='finish'?'Sí, finalizar':'Sí, eliminar'}</button></div></section></div>}
 </>
}
