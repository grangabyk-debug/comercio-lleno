'use client'

import Link from 'next/link'
import {useEffect,useMemo,useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'

type Item={id:string;source:'interview'|'custom';title:string;counterpart?:string;starts_at:string;status:string}
function dayKey(v:string|Date){const d=v instanceof Date?v:new Date(v);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}

export default function CalendarPeek({audience}:{audience:'candidate'|'employer'}){
 const [items,setItems]=useState<Item[]>([]),[ready,setReady]=useState(false)
 useEffect(()=>{
  let alive=true
  async function load(){
   const {data}=await cvAuthClient().auth.getSession();const token=data.session?.access_token
   if(!token){if(alive)setReady(true);return}
   const from=new Date();from.setHours(0,0,0,0)
   const to=new Date(from.getTime()+45*86400000)
   try{
    const r=await fetch(`/api/postula/calendar?audience=${audience}&from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'})
    const d=await r.json().catch(()=>({}))
    if(alive&&r.ok){
     const active=(d.events||[]).filter((x:Item)=>!['cancelled','declined','completed'].includes(String(x.status||''))).sort((a:Item,b:Item)=>new Date(a.starts_at).getTime()-new Date(b.starts_at).getTime())
     setItems(active.slice(0,8))
    }
   }catch{}finally{if(alive)setReady(true)}
  }
  void load()
  const focus=()=>void load(),timer=window.setInterval(()=>void load(),60000)
  window.addEventListener('focus',focus)
  return()=>{alive=false;window.clearInterval(timer);window.removeEventListener('focus',focus)}
 },[audience])
 const href=audience==='employer'?'/empresas/calendario':'/calendario'
 const todayKey=dayKey(new Date()),tomorrowDate=new Date(Date.now()+86400000),tomorrowKey=dayKey(tomorrowDate)
 const today=useMemo(()=>items.filter(item=>dayKey(item.starts_at)===todayKey),[items,todayKey])
 const tomorrow=useMemo(()=>items.filter(item=>dayKey(item.starts_at)===tomorrowKey),[items,tomorrowKey])
 const visible=(today.length?today:items).slice(0,3)
 const title=today.length?`Tenés ${today.length} pendiente${today.length===1?'':'s'} hoy.`:tomorrow.length?`Mañana tenés ${tomorrow.length} pendiente${tomorrow.length===1?'':'s'}.`:'Lo próximo.'
 return <section className="pmcal-peek" data-today={today.length>0}>
  <header><div><small>{today.length?'HOY':'AGENDA'}</small><h2>{title}</h2></div><Link href={href}>Abrir calendario →</Link></header>
  {!ready?<p>Cargando agenda…</p>:visible.length?<div>{visible.map(item=><Link href={href} key={item.id}><time>{dayKey(item.starts_at)===todayKey?'HOY':new Date(item.starts_at).toLocaleDateString('es-AR',{day:'2-digit',month:'2-digit'})}<b>{new Date(item.starts_at).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}</b></time><span><small>{item.source==='interview'?'ENTREVISTA':'TAREA'}</small><strong>{item.title}</strong>{item.counterpart&&<em>{item.counterpart}</em>}</span><i data-kind={item.source}/></Link>)}</div>:<p>No tenés pendientes próximos. Podés agregar tareas propias al calendario.</p>}
 </section>
}
