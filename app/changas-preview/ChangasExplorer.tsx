'use client'

import {useMemo,useState} from 'react'
import type {PreviewGig} from '../postula-preview/gigs'

export default function ChangasExplorer({gigs,categories}:{gigs:PreviewGig[];categories:string[]}){
 const [category,setCategory]=useState('Para hoy')
 const [saved,setSaved]=useState<string[]>([])
 const [open,setOpen]=useState<PreviewGig|null>(null)
 const [chat,setChat]=useState(false)
 const filtered=useMemo(()=>category==='Para hoy'?gigs.filter(g=>/hoy|mañana/i.test(g.when)).concat(gigs.filter(g=>!/hoy|mañana/i.test(g.when)).slice(0,2)):gigs.filter(g=>g.category===category),[category,gigs])
 function toggle(id:string){setSaved(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id])}
 return <>
  <div className="pm7-gig-cats">{categories.map(c=><button key={c} data-on={c===category} onClick={()=>setCategory(c)}>{c}</button>)}</div>
  <div className="pm7-gig-grid">{filtered.map(g=><article className="pm7-gig-card" key={g.id}>
    <div className="pm7-gig-photo" style={{backgroundImage:`url(${g.image})`}}><span>{g.when}</span><button onClick={()=>toggle(g.id)} data-saved={saved.includes(g.id)} aria-label="Guardar changa">{saved.includes(g.id)?'♥':'♡'}</button><div className="pm7-gig-price"><b>{g.pay}</b><small>{g.duration}</small></div></div>
    <div className="pm7-gig-body"><div className="pm7-gig-person"><span>{g.poster.split(/\s+/).map(x=>x[0]).join('').slice(0,2)}</span><div><b>{g.poster}</b><small>{g.posterRole} · ★ {g.rating}{g.verified?' · verificado':''}</small></div></div><h3>{g.title}</h3><p>{g.summary}</p><div className="pm7-gig-tags">{g.tags.map(t=><span key={t}>{t}</span>)}</div><div className="pm7-gig-foot"><span>{g.location}</span><button onClick={()=>setOpen(g)}>Ver tarea</button></div></div>
   </article>)}</div>
  {open&&<div className="pm7-gig-modal" role="dialog" aria-modal="true"><div className="pm7-gig-modal-card"><button className="pm7-modal-close" onClick={()=>{setOpen(null);setChat(false)}}>×</button><div className="pm7-modal-image" style={{backgroundImage:`url(${open.image})`}}/><div className="pm7-modal-content"><span className="pm7-mini-label">{open.category} · {open.when}</span><h2>{open.title}</h2><div className="pm7-modal-pay"><b>{open.pay}</b><span>{open.duration}</span></div><p>{open.summary}</p><h4>Antes de aceptar</h4><ul>{open.requirements.map(x=><li key={x}>{x}</li>)}</ul><div className="pm7-gig-person big"><span>{open.poster.split(/\s+/).map(x=>x[0]).join('').slice(0,2)}</span><div><b>{open.poster}</b><small>{open.posterRole} · ★ {open.rating} · identidad {open.verified?'verificada':'pendiente'}</small></div></div>{chat?<div className="pm7-mini-chat"><div>Hola, ¿seguís necesitando ayuda con esta tarea?</div><div className="me">Sí, todavía está disponible. ¿Podés en ese horario?</div><form onSubmit={e=>e.preventDefault()}><input placeholder="Escribí un mensaje…"/><button>→</button></form></div>:<button className="pm7-primary-wide" onClick={()=>setChat(true)}>Chatear antes de aceptar</button>}<div className="pm7-safety-line">La tarea no se confirma sin acuerdo de ambas partes. No compartas datos bancarios, claves ni documentos sensibles por chat.</div></div></div></div>}
 </>
}
