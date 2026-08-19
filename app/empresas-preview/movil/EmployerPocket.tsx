'use client'

import Link from 'next/link'
import {FormEvent,useEffect,useRef,useState} from 'react'

type Msg={role:'ai'|'user';text:string;time:string}

declare global{interface Window{webkitSpeechRecognition?:any;SpeechRecognition?:any}}

const quick=['¿A quién llamo primero?','Compará Martina y Nicolás','¿Quién tiene mejor disponibilidad?','Preparame preguntas de entrevista']

export default function EmployerPocket(){
  const [messages,setMessages]=useState<Msg[]>([{role:'ai',text:'Hola. Tengo resumida la búsqueda de Vendedor/a de salón. Hay 186 postulaciones, 12 en shortlist y 4 listas para entrevista. ¿Qué querés saber?',time:'ahora'}])
  const [text,setText]=useState('')
  const [loading,setLoading]=useState(false)
  const [listening,setListening]=useState(false)
  const recognitionRef=useRef<any>(null)
  const timerRef=useRef<any>(null)

  useEffect(()=>()=>{try{recognitionRef.current?.stop()}catch{};if(timerRef.current)clearTimeout(timerRef.current)},[])

  async function ask(value:string){const q=value.trim();if(!q||loading)return;setMessages(m=>[...m,{role:'user',text:q,time:'ahora'}]);setText('');setLoading(true);try{const r=await fetch('/api/postula/employer-assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:q})});const data=await r.json();setMessages(m=>[...m,{role:'ai',text:data?.answer||data?.error||'No pude responder ahora.',time:'ahora'}])}catch{setMessages(m=>[...m,{role:'ai',text:'No pude conectarme ahora. Probá de nuevo en unos segundos.',time:'ahora'}])}finally{setLoading(false)}}
  function submit(e:FormEvent){e.preventDefault();void ask(text)}
  function startVoice(){
    const Ctor=window.SpeechRecognition||window.webkitSpeechRecognition
    if(!Ctor){setMessages(m=>[...m,{role:'ai',text:'Este navegador no habilita dictado de voz. Podés escribir la consulta acá mismo.',time:'ahora'}]);return}
    try{const rec=new Ctor();recognitionRef.current=rec;rec.lang='es-AR';rec.interimResults=true;rec.continuous=false;rec.maxAlternatives=1;setListening(true);let final='';rec.onresult=(ev:any)=>{let interim='';for(let i=ev.resultIndex;i<ev.results.length;i++){const t=String(ev.results[i][0]?.transcript||'');if(ev.results[i].isFinal)final+=t;else interim+=t}setText((final||interim).trim())};rec.onerror=()=>setListening(false);rec.onend=()=>{setListening(false);if(final.trim())void ask(final.trim())};rec.start();timerRef.current=setTimeout(()=>{try{rec.stop()}catch{}},12000)}catch{setListening(false)}
  }

  return <div className="pm-pocket-page"><div className="pm-pocket-shell">
    <header className="pm-pocket-top"><div className="pm-pocket-person"><span className="pm-pocket-avatar">PM</span><div><b>Asistente de selección</b><small>Vendedor/a de salón · Belgrano</small></div></div><span className="pm-pocket-live"><i/>rápido</span></header>
    <div className="pm-pocket-summary"><div className="pm-pocket-stat"><small>Recibidos</small><b>186</b></div><div className="pm-pocket-stat"><small>Shortlist</small><b>12</b></div><div className="pm-pocket-stat"><small>Entrevista</small><b>4</b></div></div>
    <Link className="pm-pocket-link" href="/empresas-preview/panel">← Volver al panel completo</Link>
    <article className="pm-candidate-mini"><div className="pm-candidate-mini-top"><div><h3>Martina R. · 94% de ajuste</h3><p>Caja, retail y disponibilidad declarada. Falta validar objetivos comerciales.</p></div><span className="pm-ref-chip">92% referencias</span></div><div className="pm-trust-detail"><b>Referencia general verificada:</b> 3 experiencias. Esta señal es auxiliar, visible para la persona y no participa del descarte automático ni del ranking del match.</div></article>
    <article className="pm-candidate-mini"><div className="pm-candidate-mini-top"><div><h3>Nicolás G. · 87% de ajuste</h3><p>Atención al cliente y POS. Falta confirmar disponibilidad de sábados.</p></div><span className="pm-ref-chip">sin señal</span></div></article>
    <div className="pm-pocket-warning"><b>Referencias laborales, no “puntaje secreto”.</b> La idea tipo Uber queda limitada a señales generales de relaciones laborales verificadas, con derecho a ver y cuestionar el dato. No usamos tardanzas, opiniones o reputación para rechazar automáticamente candidatos.</div>
    <div className="pm-pocket-chat">{messages.map((m,i)=><div className={`pm-msg ${m.role}`} key={`${m.time}-${i}`}>{m.text}<small>{m.time}</small></div>)}{loading&&<div className="pm-msg ai">Estoy revisando la shortlist…<small>ahora</small></div>}</div>
    <div className="pm-quick-row">{quick.map(q=><button key={q} onClick={()=>void ask(q)} disabled={loading}>{q}</button>)}</div>
    <div className="pm-voice-note">Micrófono: dictado corto de hasta 12 segundos. No se guarda el audio en esta preview; se usa la transcripción del navegador.</div>
    <form className="pm-pocket-compose" onSubmit={submit}><button className="pm-mic" type="button" data-listening={listening} onClick={startVoice} aria-label="Dictar consulta">{listening?'■':'●'}</button><input value={text} onChange={e=>setText(e.target.value)} placeholder={listening?'Te escucho…':'Preguntá sobre candidatos…'} maxLength={600}/><button className="pm-send" type="submit" disabled={!text.trim()||loading} aria-label="Enviar">→</button></form>
  </div></div>
}
