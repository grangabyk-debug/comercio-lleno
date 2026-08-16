'use client'

import { FormEvent, PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react'
import { loadMobileSettings,readCachedMobileSettings } from '@/lib/comercio/mobile-settings'
import { readTenantSession } from '@/lib/comercio/session'
import styles from './mobile-ai.module.css'

type Message={role:'user'|'assistant';content:string}
type Pos={x:number;y:number}
const presets=['¿Cómo vienen las ventas hoy?','¿Cuál fue el producto más vendido en los últimos 30 días?','¿Qué productos tienen stock bajo?','¿Qué puedo hacer con IA?']

export default function MobileAiAssistant(){
  const[available,setAvailable]=useState(false),[appReady,setAppReady]=useState(false),[open,setOpen]=useState(false),[text,setText]=useState(''),[busy,setBusy]=useState(false)
  const[messages,setMessages]=useState<Message[]>([{role:'assistant',content:'Hola. Puedo consultar ventas, facturación, productos y stock de tu comercio.'}])
  const[pos,setPos]=useState<Pos>({x:14,y:0})
  const drag=useRef<{id:number;startX:number;startY:number;originX:number;originY:number;moved:boolean}|null>(null)

  useEffect(()=>{
    let cancelled=false
    const sync=async()=>{
      const s=readTenantSession()
      if(!s){if(!cancelled)setAvailable(false);return}
      let cfg=readCachedMobileSettings(s.companyId)
      try{cfg=await loadMobileSettings(s)}catch{}
      if(!cancelled)setAvailable(cfg.aiEnabled)
    }
    void sync()
    const changed=()=>void sync()
    window.addEventListener('comercio:mobile-settings',changed)
    return()=>{cancelled=true;window.removeEventListener('comercio:mobile-settings',changed)}
  },[])

  useEffect(()=>{
    let timer:number|undefined
    let shown=false
    const sync=()=>{
      const ready=Boolean(document.querySelector('main[class*="app"]'))
      if(!ready){
        if(timer!==undefined)window.clearTimeout(timer)
        timer=undefined
        shown=false
        setAppReady(false)
        return
      }
      if(shown||timer!==undefined)return
      timer=window.setTimeout(()=>{
        shown=true
        timer=undefined
        setPos({x:14,y:Math.max(90,window.innerHeight-140)})
        setAppReady(true)
      },320)
    }
    sync()
    const observer=new MutationObserver(sync)
    observer.observe(document.body,{childList:true,subtree:true})
    return()=>{observer.disconnect();if(timer!==undefined)window.clearTimeout(timer)}
  },[])

  async function ask(question:string){const q=question.trim();if(!q||busy)return;const session=readTenantSession();if(!session){setAvailable(false);setOpen(false);return}const history=messages;setMessages(m=>[...m,{role:'user',content:q}]);setText('');setBusy(true);try{const r=await fetch('/api/redesign/assistant',{method:'POST',headers:{Authorization:`Bearer ${session.token}`,'Content-Type':'application/json'},body:JSON.stringify({message:q,history:history.slice(-6)}),cache:'no-store'});const data=await r.json().catch(()=>({}));if(!r.ok||!data?.answer)throw new Error(data?.error||'No pude consultar la IA.');setMessages(m=>[...m,{role:'assistant',content:String(data.answer)}])}catch(e){setMessages(m=>[...m,{role:'assistant',content:e instanceof Error?e.message:'No pude responder ahora.'}])}finally{setBusy(false)}}
  function submit(e:FormEvent){e.preventDefault();void ask(text)}
  function down(e:ReactPointerEvent<HTMLButtonElement>){e.currentTarget.setPointerCapture(e.pointerId);drag.current={id:e.pointerId,startX:e.clientX,startY:e.clientY,originX:pos.x,originY:pos.y,moved:false}}
  function move(e:ReactPointerEvent<HTMLButtonElement>){const d=drag.current;if(!d||d.id!==e.pointerId)return;const dx=e.clientX-d.startX,dy=e.clientY-d.startY;if(Math.abs(dx)+Math.abs(dy)>7)d.moved=true;const maxX=Math.max(8,window.innerWidth-76),maxY=Math.max(70,window.innerHeight-86);setPos({x:Math.min(maxX,Math.max(8,d.originX+dx)),y:Math.min(maxY,Math.max(70,d.originY+dy))})}
  function up(e:ReactPointerEvent<HTMLButtonElement>){const d=drag.current;if(!d||d.id!==e.pointerId)return;drag.current=null;if(!d.moved)setOpen(true)}
  if(!available||!appReady)return null
  return <><button className={styles.bubble} style={{left:pos.x,top:pos.y}} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={()=>{drag.current=null}} aria-label="Abrir asistente IA"><span>✦</span><b>IA</b></button>{open&&<div className={styles.backdrop} onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}><section className={styles.sheet}><header><div className={styles.avatar}>✦</div><div><span>COMERCIO LLENO</span><h2>Asistente IA</h2></div><button onClick={()=>setOpen(false)}>×</button></header><div className={styles.secure}>🔒 Sólo usa los datos del comercio y permisos de tu sesión actual.</div><div className={styles.messages}>{messages.map((m,i)=><div key={i} className={m.role==='user'?styles.user:styles.bot}>{m.content}</div>)}{busy&&<div className={styles.thinking}>Analizando…</div>}</div><div className={styles.quick}>{presets.map(q=><button key={q} disabled={busy} onClick={()=>void ask(q)}>{q}</button>)}</div><form onSubmit={submit}><input value={text} onChange={e=>setText(e.target.value)} placeholder="Preguntá por ventas, productos o stock…"/><button disabled={busy||!text.trim()}>Enviar</button></form></section></div>}</>
}
