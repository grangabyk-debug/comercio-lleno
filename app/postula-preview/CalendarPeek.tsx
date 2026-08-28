'use client'

import Link from 'next/link'
import {useEffect,useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'

type Item={id:string;source:'interview'|'custom';title:string;counterpart?:string;starts_at:string;status:string}
export default function CalendarPeek({audience}:{audience:'candidate'|'employer'}){
 const [items,setItems]=useState<Item[]>([]),[ready,setReady]=useState(false)
 useEffect(()=>{let alive=true;(async()=>{const {data}=await cvAuthClient().auth.getSession();const token=data.session?.access_token;if(!token){if(alive)setReady(true);return}const from=new Date(),to=new Date(Date.now()+45*86400000);try{const r=await fetch(`/api/postula/calendar?audience=${audience}&from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});const d=await r.json().catch(()=>({}));if(alive&&r.ok)setItems((d.upcoming||[]).slice(0,3))}catch{}finally{if(alive)setReady(true)}})();return()=>{alive=false}},[audience])
 const href=audience==='employer'?'/empresas/calendario':'/calendario'
 return <section className="pmcal-peek"><header><div><small>AGENDA</small><h2>Lo próximo.</h2></div><Link href={href}>Abrir calendario →</Link></header>{!ready?<p>Cargando agenda…</p>:items.length?<div>{items.map(item=><Link href={href} key={item.id}><time>{new Date(item.starts_at).toLocaleDateString('es-AR',{day:'2-digit',month:'2-digit'})}<b>{new Date(item.starts_at).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}</b></time><span><small>{item.source==='interview'?'ENTREVISTA':'TAREA'}</small><strong>{item.title}</strong>{item.counterpart&&<em>{item.counterpart}</em>}</span><i data-kind={item.source}/></Link>)}</div>:<p>No tenés pendientes próximos. Podés agregar tareas propias al calendario.</p>}</section>
}
