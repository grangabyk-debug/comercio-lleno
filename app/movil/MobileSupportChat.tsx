'use client'

import { FormEvent,useEffect,useRef,useState } from 'react'
import { readTenantSession } from '@/lib/comercio/session'
import { loadSupportState,sendSupportMedia,sendSupportMessage,type SupportMessage,type SupportConversation } from '@/lib/comercio/support-api'
import styles from './mobile-support.module.css'

function bestAudioMime(){if(typeof MediaRecorder==='undefined')return '';return['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg'].find(type=>MediaRecorder.isTypeSupported(type))||''}
function extensionFor(type:string){return type.includes('mp4')?'m4a':type.includes('ogg')?'ogg':'webm'}

function MessageContent({message}:{message:SupportMessage}){
  const caption=message.messageType==='text'||(message.messageType==='image'&&message.content!=='Imagen adjunta')||(message.messageType==='audio'&&message.content!=='Mensaje de voz')
  return <>
    {message.messageType==='image'?(message.mediaUrl?<a className={styles.mediaImage} href={message.mediaUrl} target="_blank" rel="noreferrer"><img src={message.mediaUrl} alt="Captura enviada a soporte"/></a>:<span className={styles.mediaMissing}>Imagen no disponible</span>):null}
    {message.messageType==='audio'?(message.mediaUrl?<div className={styles.mediaAudio}><b>Mensaje de voz</b><audio controls preload="metadata" src={message.mediaUrl}/></div>:<span className={styles.mediaMissing}>Audio no disponible</span>):null}
    {caption?<p>{message.content}</p>:null}
    {message.transcriptStatus==='ready'&&message.transcript?<details className={styles.transcript}><summary>Transcripción de IA</summary><p>{message.transcript}</p></details>:null}
  </>
}

export default function MobileSupportChat(){
  const[visible,setVisible]=useState(false),[open,setOpen]=useState(false),[conversation,setConversation]=useState<SupportConversation|null>(null),[messages,setMessages]=useState<SupportMessage[]>([])
  const[text,setText]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[recording,setRecording]=useState(false),[seconds,setSeconds]=useState(0)
  const[image,setImage]=useState<File|null>(null),[preview,setPreview]=useState('')
  const endRef=useRef<HTMLDivElement|null>(null),fileRef=useRef<HTMLInputElement|null>(null),recorderRef=useRef<MediaRecorder|null>(null),streamRef=useRef<MediaStream|null>(null),chunksRef=useRef<BlobPart[]>([]),startedRef=useRef(0),cancelRef=useRef(false)

  async function sync(){const data=await loadSupportState();setConversation(data.conversation);setMessages(data.messages)}

  useEffect(()=>{
    let timer:number|undefined
    const check=()=>{const ready=Boolean(readTenantSession()&&document.querySelector('main[class*="app"]'));setVisible(ready);if(ready&&new URLSearchParams(location.search).get('support')==='1'){setOpen(true);void sync().catch(()=>{})}}
    check();timer=window.setInterval(check,900)
    const opener=()=>{setOpen(true);setError('');void sync().catch(e=>setError(e instanceof Error?e.message:String(e)))}
    window.addEventListener('comercio:open-support',opener)
    return()=>{if(timer)window.clearInterval(timer);window.removeEventListener('comercio:open-support',opener)}
  },[])

  useEffect(()=>{if(!open)return;void sync().catch(e=>setError(e instanceof Error?e.message:String(e)));const timer=window.setInterval(()=>void sync().catch(()=>{}),5000);return()=>window.clearInterval(timer)},[open])
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth',block:'end'})},[messages.length,open])
  useEffect(()=>{if(!recording)return;const timer=window.setInterval(()=>setSeconds(Math.min(180,Math.floor((Date.now()-startedRef.current)/1000))),250);return()=>window.clearInterval(timer)},[recording])
  useEffect(()=>()=>{if(recorderRef.current?.state==='recording')recorderRef.current.stop();streamRef.current?.getTracks().forEach(track=>track.stop());if(preview)URL.revokeObjectURL(preview)},[preview])

  function clearImage(){if(preview)URL.revokeObjectURL(preview);setPreview('');setImage(null);if(fileRef.current)fileRef.current.value=''}
  function chooseImage(file:File|null){if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)){setError('Usá una imagen JPG, PNG o WebP.');return}if(file.size>10*1024*1024){setError('La imagen puede pesar hasta 10 MB.');return}clearImage();setImage(file);setPreview(URL.createObjectURL(file));setError('')}

  async function send(event:FormEvent){
    event.preventDefault();const value=text.trim();if((!value&&!image)||busy||recording)return
    setBusy(true);setError('')
    try{const data=image?await sendSupportMedia(image,'image',{message:value}):await sendSupportMessage(value);setConversation(data.conversation);setMessages(data.messages);setText('');if(image)clearImage()}
    catch(e){setError(e instanceof Error?e.message:'No se pudo enviar el mensaje.')}
    finally{setBusy(false)}
  }

  async function startAudio(){
    if(busy||recording)return
    if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined'){setError('Este navegador no permite grabar audio.');return}
    try{
      setError('');cancelRef.current=false;chunksRef.current=[]
      const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});streamRef.current=stream
      const mime=bestAudioMime(),recorder=mime?new MediaRecorder(stream,{mimeType:mime}):new MediaRecorder(stream);recorderRef.current=recorder;startedRef.current=Date.now();setSeconds(0)
      recorder.ondataavailable=e=>{if(e.data.size)chunksRef.current.push(e.data)}
      recorder.onstop=async()=>{const duration=Math.min(180000,Date.now()-startedRef.current);stream.getTracks().forEach(track=>track.stop());streamRef.current=null;recorderRef.current=null;setRecording(false);if(cancelRef.current){chunksRef.current=[];return}const type=recorder.mimeType||mime||'audio/webm',blob=new Blob(chunksRef.current,{type});chunksRef.current=[];if(!blob.size){setError('No se grabó audio.');return}setBusy(true);try{const uploadType=type.split(';')[0]||'audio/webm';const file=new File([blob],`mensaje-voz.${extensionFor(uploadType)}`,{type:uploadType});const data=await sendSupportMedia(file,'audio',{durationMs:duration});setConversation(data.conversation);setMessages(data.messages);setError('')}catch(e){setError(e instanceof Error?e.message:'No se pudo enviar el audio.')}finally{setBusy(false)}}
      recorder.start(250);setRecording(true);window.setTimeout(()=>{if(recorder.state==='recording')recorder.stop()},180000)
    }catch(e){setError(e instanceof DOMException&&e.name==='NotAllowedError'?'Dale permiso al navegador para usar el micrófono.':'No se pudo abrir el micrófono.')}
  }
  function finishAudio(){if(recorderRef.current?.state==='recording')recorderRef.current.stop()}
  function cancelAudio(){cancelRef.current=true;if(recorderRef.current?.state==='recording')recorderRef.current.stop()}

  if(!visible)return null
  return <>
    <button className={styles.helpButton} onClick={()=>{setOpen(true);setError('');void sync().catch(e=>setError(e instanceof Error?e.message:String(e)))}} aria-label="Ayuda humana"><span>?</span><b>Ayuda</b>{conversation?.customerUnreadCount?<i>{conversation.customerUnreadCount}</i>:null}</button>
    {open&&<div className={styles.backdrop} onMouseDown={e=>{if(e.target===e.currentTarget&&!recording)setOpen(false)}}>
      <section className={styles.chat}>
        <header><div><span>SOPORTE</span><h2>Ayuda humana</h2><p>Texto, audio real o captura. Hablá directamente con Central Llena.</p></div><button onClick={()=>setOpen(false)} aria-label="Cerrar" disabled={recording}>×</button></header>
        <div className={styles.status}><b>{conversation?'Conversación activa':'Nueva consulta'}</b><span>{conversation?'Todo queda guardado en el historial.':'Contanos qué está pasando y te respondemos por acá.'}</span></div>
        <div className={styles.messages}>
          {!messages.length&&<div className={styles.empty}><b>¿En qué te podemos ayudar?</b><p>Podés escribir, mandar una nota de voz o adjuntar una captura.</p></div>}
          {messages.map(message=><div key={message.id} className={message.from==='customer'?styles.mine:styles.theirs}><small>{message.from==='customer'?'Vos':message.senderName||'Central Llena'}</small><MessageContent message={message}/><time>{new Date(message.createdAt).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}</time></div>)}
          <div ref={endRef}/>
        </div>
        {error&&<div className={styles.error}>{error}</div>}
        {preview&&<div className={styles.preview}><img src={preview} alt="Captura lista para enviar"/><span><b>Captura lista</b><small>Agregá una explicación si querés.</small></span><button type="button" onClick={clearImage}>×</button></div>}
        {recording&&<div className={styles.recording}><i/><span><b>Grabando · {seconds}s</b><small>Al tocar enviar se manda el audio original.</small></span><button type="button" onClick={cancelAudio}>Cancelar</button></div>}
        <form onSubmit={send}>
          <div className={styles.tools}><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>chooseImage(e.target.files?.[0]||null)}/><button type="button" className={styles.imageButton} onClick={()=>fileRef.current?.click()} disabled={busy||recording}>Imagen</button><button type="button" className={`${styles.micButton} ${recording?styles.micLive:''}`} onClick={recording?finishAudio:()=>void startAudio()} disabled={busy}><span className={styles.micGlyph}/>{recording?'Enviar audio':'Audio'}</button></div>
          <textarea value={text} onChange={e=>setText(e.target.value)} maxLength={2000} rows={2} placeholder={image?'Explicá la captura (opcional)…':'Escribí tu mensaje…'} disabled={recording}/><button className={styles.send} disabled={busy||recording||(!text.trim()&&!image)}>{busy?'Enviando…':image?'Enviar captura':'Enviar'}</button>
        </form>
      </section>
    </div>}
  </>
}
