'use client'

import { FormEvent,useEffect,useRef,useState } from 'react'
import { readTenantSession } from '@/lib/comercio/session'
import styles from './simple-mode.module.css'

type Msg={role:'user'|'assistant';content:string}
function clickNav(label:string){const b=Array.from(document.querySelectorAll('button')).find(x=>(x.textContent||'').trim().includes(label)) as HTMLButtonElement|undefined;b?.click();return Boolean(b)}

export default function SimpleModeRuntime(){
  const[enabled,setEnabled]=useState(false),[home,setHome]=useState(true),[ai,setAi]=useState(false),[text,setText]=useState(''),[busy,setBusy]=useState(false)
  const[messages,setMessages]=useState<Msg[]>([{role:'assistant',content:'Hola. Estoy disponible también en Modo Simple. Podés preguntarme por ventas, productos, stock o caja.'}])
  const scan=useRef({value:'',at:0})

  useEffect(()=>{
    const enter=()=>{setEnabled(true);setHome(true);document.documentElement.dataset.simpleMode='1'}
    window.addEventListener('comercio:enter-simple',enter)
    return()=>{window.removeEventListener('comercio:enter-simple',enter);delete document.documentElement.dataset.simpleMode}
  },[])

  useEffect(()=>{
    if(!enabled||!home)return
    const key=(e:KeyboardEvent)=>{
      if((e.target as HTMLElement)?.matches('input,textarea,select'))return
      const now=Date.now();if(now-scan.current.at>120)scan.current.value='';scan.current.at=now
      if(e.key==='Enter'){
        const code=scan.current.value.replace(/\D/g,'');scan.current.value=''
        if(code.length<6)return
        e.preventDefault();openSection('Nueva venta')
        window.setTimeout(()=>{
          const input=Array.from(document.querySelectorAll('input')).find(i=>(i.getAttribute('placeholder')||'').includes('Escaneá un código')) as HTMLInputElement|undefined
          if(!input)return
          const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')?.set;setter?.call(input,code);input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true}))
        },180)
      }else if(e.key.length===1&&/[0-9]/.test(e.key))scan.current.value+=e.key
    }
    window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)
  },[enabled,home])

  function openSection(label:string){setHome(false);window.setTimeout(()=>clickNav(label),0)}
  function exit(){setEnabled(false);setHome(true);setAi(false);delete document.documentElement.dataset.simpleMode;window.setTimeout(()=>clickNav('Inicio'),0)}
  async function ask(q:string){q=q.trim();if(!q||busy)return;const s=readTenantSession();if(!s)return;const old=messages;setMessages(m=>[...m,{role:'user',content:q}]);setText('');setBusy(true);try{const r=await fetch('/api/redesign/assistant',{method:'POST',headers:{Authorization:`Bearer ${s.token}`,'Content-Type':'application/json'},body:JSON.stringify({message:q,history:old.slice(-6)}),cache:'no-store'});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d?.error||'No pude consultar la IA.');setMessages(m=>[...m,{role:'assistant',content:String(d.answer||'Sin respuesta.')}])}catch(e){setMessages(m=>[...m,{role:'assistant',content:e instanceof Error?e.message:String(e)}])}finally{setBusy(false)}}
  function submit(e:FormEvent){e.preventDefault();void ask(text)}
  if(!enabled)return null
  return <>
    <style>{`html[data-simple-mode="1"] main[class*=shell] aside[class*=sidebar]{display:none!important}html[data-simple-mode="1"] main[class*=shell] div[class*=layout]{grid-template-columns:1fr!important}html[data-simple-mode="1"] main[class*=shell] section[class*=content]{max-width:none!important;padding-top:78px!important}`}</style>
    {home&&<div className={styles.overlay}><div className={styles.top}><div><span>MODO SIMPLE</span><h1>¿Qué querés hacer?</h1><p>Operación rápida con lector de códigos listo.</p></div><button onClick={exit}>Salir del Modo Simple</button></div><div className={styles.actions}><button className={styles.sell} onClick={()=>openSection('Nueva venta')}><i>$</i><b>Cobrar</b><span>Escanear productos y cobrar</span></button><button onClick={()=>openSection('Productos')}><i>▦</i><b>Productos</b><span>Precios y stock</span></button><button onClick={()=>openSection('Caja diaria')}><i>◷</i><b>Caja diaria</b><span>Abrir, arqueo y cierre</span></button><button onClick={()=>openSection('Ventas')}><i>▤</i><b>Ventas</b><span>Últimas operaciones</span></button></div><div className={styles.scanner}>▣ <b>Scanner activo</b><span>Pasá un código de barras y se abrirá Nueva venta automáticamente.</span></div></div>}
    {!home&&<div className={styles.simpleControls}><button onClick={()=>setHome(true)}>← Inicio simple</button><button onClick={exit}>Salir del Modo Simple</button></div>}
    <button className={styles.aiBubble} onClick={()=>setAi(true)}>✦ <b>IA</b></button>
    {ai&&<div className={styles.aiBackdrop} onMouseDown={e=>e.target===e.currentTarget&&setAi(false)}><section className={styles.aiCard}><header><div><span>✦ COMERCIO LLENO</span><h2>Asistente IA</h2></div><button onClick={()=>setAi(false)}>×</button></header><div className={styles.aiMessages}>{messages.map((m,i)=><div className={m.role==='user'?styles.user:styles.bot} key={i}>{m.content}</div>)}{busy&&<div className={styles.bot}>Analizando…</div>}</div><form onSubmit={submit}><input value={text} onChange={e=>setText(e.target.value)} placeholder="Preguntá por ventas, stock, productos…"/><button disabled={busy||!text.trim()}>Enviar</button></form></section></div>}
  </>
}
