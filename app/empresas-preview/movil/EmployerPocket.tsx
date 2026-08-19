'use client'

import Link from 'next/link'
import {FormEvent,useEffect,useRef,useState} from 'react'

type Msg={role:'ai'|'user';text?:string;time:string;audioUrl?:string;kind?:'text'|'audio';delivery?:{destination:string;recipient:string;count:number;status:string}}
declare global{interface Window{webkitSpeechRecognition?:any;SpeechRecognition?:any}}

const quick=['Dame los cinco mejores CV','Compará Martina y Nicolás','¿Quién tiene mejor disponibilidad?','Preparame preguntas de entrevista','Enviá esos cinco a Recursos Humanos']

export default function EmployerPocket(){
  const [messages,setMessages]=useState<Msg[]>([{role:'ai',text:'Hola, soy Nexo. Tengo resumida la búsqueda de Vendedor/a de salón: 186 postulaciones, 12 en shortlist y 4 listas para entrevista. Podés preguntarme o darme una orden.',time:'ahora',kind:'text'}])
  const [text,setText]=useState('')
  const [loading,setLoading]=useState(false)
  const [recording,setRecording]=useState(false)
  const [voiceReplies,setVoiceReplies]=useState(false)
  const [contextIds,setContextIds]=useState<string[]>([])
  const [seconds,setSeconds]=useState(0)
  const recognitionRef=useRef<any>(null)
  const mediaRef=useRef<MediaRecorder|null>(null)
  const streamRef=useRef<MediaStream|null>(null)
  const chunksRef=useRef<Blob[]>([])
  const transcriptRef=useRef('')
  const timerRef=useRef<number|null>(null)
  const objectUrls=useRef<string[]>([])

  useEffect(()=>()=>{try{recognitionRef.current?.stop()}catch{};try{mediaRef.current?.stop()}catch{};streamRef.current?.getTracks().forEach(t=>t.stop());if(timerRef.current)window.clearInterval(timerRef.current);objectUrls.current.forEach(URL.revokeObjectURL)},[])

  function speak(value:string){if(!voiceReplies||typeof window==='undefined'||!('speechSynthesis'in window))return;try{window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(value.replace(/\n/g,'. '));u.lang='es-AR';u.rate=1.03;const voices=window.speechSynthesis.getVoices();u.voice=voices.find(v=>v.lang.toLowerCase()==='es-ar')||voices.find(v=>v.lang.toLowerCase().startsWith('es'))||null;window.speechSynthesis.speak(u)}catch{}}

  async function ask(value:string,opts?:{hideUserText?:boolean;audioUrl?:string}){
    const q=value.trim();if(!q||loading)return
    if(opts?.hideUserText&&opts.audioUrl)setMessages(m=>[...m,{role:'user',audioUrl:opts.audioUrl,time:'ahora',kind:'audio'}]);else setMessages(m=>[...m,{role:'user',text:q,time:'ahora',kind:'text'}])
    setText('');setLoading(true)
    try{const r=await fetch('/api/postula/employer-assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:q,context_candidate_ids:contextIds})});const data=await r.json();const answer=String(data?.answer||data?.error||'No pude responder ahora.');if(Array.isArray(data?.selected_candidate_ids))setContextIds(data.selected_candidate_ids.map(String));setMessages(m=>[...m,{role:'ai',text:answer,time:'ahora',kind:'text',delivery:data?.delivery}]);speak(answer)}catch{const answer='No pude conectarme ahora. Probá de nuevo en unos segundos.';setMessages(m=>[...m,{role:'ai',text:answer,time:'ahora',kind:'text'}]);speak(answer)}finally{setLoading(false)}
  }
  function submit(e:FormEvent){e.preventDefault();void ask(text)}

  async function startHold(){
    if(recording||loading)return
    if(!navigator.mediaDevices?.getUserMedia){setMessages(m=>[...m,{role:'ai',text:'Este navegador no permite grabar audio desde acá. Podés escribir la consulta.',time:'ahora',kind:'text'}]);return}
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});streamRef.current=stream;chunksRef.current=[];transcriptRef.current='';
      const recorder=new MediaRecorder(stream);mediaRef.current=recorder;recorder.ondataavailable=e=>{if(e.data.size)chunksRef.current.push(e.data)};recorder.start();setRecording(true);setSeconds(0)
      timerRef.current=window.setInterval(()=>setSeconds(s=>{if(s>=44){void stopHold();return 45}return s+1}),1000)
      const Ctor=window.SpeechRecognition||window.webkitSpeechRecognition
      if(Ctor){const rec=new Ctor();recognitionRef.current=rec;rec.lang='es-AR';rec.interimResults=true;rec.continuous=true;rec.maxAlternatives=1;rec.onresult=(ev:any)=>{let total='';for(let i=0;i<ev.results.length;i++)total+=`${String(ev.results[i][0]?.transcript||'')} `;transcriptRef.current=total.trim()};try{rec.start()}catch{}}
    }catch{setRecording(false);setMessages(m=>[...m,{role:'ai',text:'No pude acceder al micrófono. Revisá el permiso del navegador o escribime la orden.',time:'ahora',kind:'text'}])}
  }
  async function stopHold(){
    if(!recording)return
    setRecording(false);if(timerRef.current){window.clearInterval(timerRef.current);timerRef.current=null}
    try{recognitionRef.current?.stop()}catch{}
    const recorder=mediaRef.current
    const blob=await new Promise<Blob>((resolve)=>{if(!recorder||recorder.state==='inactive'){resolve(new Blob(chunksRef.current,{type:'audio/webm'}));return}recorder.onstop=()=>resolve(new Blob(chunksRef.current,{type:recorder.mimeType||'audio/webm'}));try{recorder.stop()}catch{resolve(new Blob(chunksRef.current,{type:'audio/webm'}))}})
    streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null;mediaRef.current=null
    const url=URL.createObjectURL(blob);objectUrls.current.push(url)
    await new Promise(r=>setTimeout(r,180));const transcript=transcriptRef.current.trim()
    if(transcript)void ask(transcript,{hideUserText:true,audioUrl:url});else setMessages(m=>[...m,{role:'user',audioUrl:url,time:'ahora',kind:'audio'},{role:'ai',text:'Recibí el audio, pero este navegador no entregó una transcripción utilizable. Podés volver a mantener el micrófono o escribir la orden.',time:'ahora',kind:'text'}])
  }

  return <div className="pm-pocket-page"><div className="pm-pocket-shell">
    <header className="pm-pocket-top"><div className="pm-pocket-person"><span className="pm-pocket-avatar">NX</span><div><b>Nexo</b><small>Asistente de selección · Vendedor/a de salón</small></div></div><span className="pm-pocket-live"><i/>en línea</span></header>
    <div className="pm-pocket-toolbar"><Link href="/empresas-preview/panel">← Volver al panel web</Link><button type="button" data-on={voiceReplies} onClick={()=>{setVoiceReplies(v=>!v);if(voiceReplies&&typeof window!=='undefined')window.speechSynthesis?.cancel()}}>{voiceReplies?'Respuesta por voz: sí':'Respuesta por voz: no'}</button></div>
    <div className="pm-pocket-summary"><div className="pm-pocket-stat"><small>Recibidos</small><b>186</b></div><div className="pm-pocket-stat"><small>Shortlist</small><b>12</b></div><div className="pm-pocket-stat"><small>Entrevista</small><b>4</b></div></div>
    <div className="pm-pocket-context"><span>EMPRESA ACTUAL</span><b>Comercio demo · Belgrano</b><small>Nexo sólo trabaja con candidatos y equipo vinculados a esta cuenta.</small></div>
    <div className="pm-pocket-chat">{messages.map((m,i)=><div className={`pm-msg ${m.role} ${m.kind==='audio'?'audio':''}`} key={`${m.time}-${i}`}>{m.kind==='audio'&&m.audioUrl?<><div className="pm-audio-wave"><i/><i/><i/><i/><i/><i/><i/><i/></div><audio controls preload="metadata" src={m.audioUrl}/></>:<>{m.text}{m.delivery&&<div className="pm-delivery"><b>Derivación preparada</b><span>{m.delivery.count} CV · {m.delivery.recipient}</span><small>Preview: no se envió correo real.</small></div>}</>}<small>{m.time}</small></div>)}{loading&&<div className="pm-msg ai"><span className="pm-thinking"><i/><i/><i/></span> Nexo está revisando la búsqueda…<small>ahora</small></div>}</div>
    <div className="pm-quick-row">{quick.map(q=><button key={q} onClick={()=>void ask(q)} disabled={loading||recording}>{q}</button>)}</div>
    <div className="pm-voice-note"><b>Mantené apretado el micrófono para hablar.</b> Al soltar, se muestra la nota de voz y Nexo recibe la transcripción. Máximo 45 segundos. El audio queda sólo en este navegador durante la sesión.</div>
    <form className="pm-pocket-compose" onSubmit={submit}><button className="pm-mic" type="button" data-listening={recording} onPointerDown={e=>{e.currentTarget.setPointerCapture?.(e.pointerId);void startHold()}} onPointerUp={()=>void stopHold()} onPointerCancel={()=>void stopHold()} onContextMenu={e=>e.preventDefault()} aria-label="Mantener presionado para enviar audio">{recording?<span>{seconds}s</span>:<span className="pm-mic-dot"/>}</button><input value={text} onChange={e=>setText(e.target.value)} placeholder={recording?'Grabando… soltá para enviar':'Preguntá o dale una orden a Nexo…'} maxLength={900} disabled={recording}/><button className="pm-send" type="submit" disabled={!text.trim()||loading||recording} aria-label="Enviar">→</button></form>
  </div></div>
}
