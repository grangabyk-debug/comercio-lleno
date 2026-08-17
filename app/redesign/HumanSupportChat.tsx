'use client'

import { FormEvent,useCallback,useEffect,useRef,useState } from 'react'
import { createPortal } from 'react-dom'
import { readTenantSession } from '@/lib/comercio/session'
import { closeSupportConversation,loadSupportState,sendSupportMedia,sendSupportMessage,type SupportMessage,type SupportState } from '@/lib/comercio/support-api'
import styles from './HumanSupportChat.module.css'

const EMPTY_STATE:SupportState={conversation:null,messages:[]}
function roleLabel(role:string){return role==='owner'?'Propietario':role==='manager'?'Encargado':role==='cashier'?'Cajero':role==='seller'?'Vendedor':role==='supervisor'?'Supervisor':role||'Usuario'}
function timeLabel(value:string){return new Date(value).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}
function bestAudioMime(){if(typeof MediaRecorder==='undefined')return '';return['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg'].find(type=>MediaRecorder.isTypeSupported(type))||''}
function extensionFor(type:string){return type.includes('mp4')?'m4a':type.includes('ogg')?'ogg':'webm'}

function MessageBody({message}:{message:SupportMessage}){
  const showCaption=message.messageType==='text'||(message.messageType==='image'&&message.content!=='Imagen adjunta')||(message.messageType==='audio'&&message.content!=='Mensaje de voz')
  return <>
    {message.messageType==='image'?message.mediaUrl?<a className={styles.imageLink} href={message.mediaUrl} target="_blank" rel="noreferrer" aria-label="Abrir imagen adjunta"><img className={styles.imageAttachment} src={message.mediaUrl} alt="Captura enviada a soporte"/></a>:<div className={styles.mediaUnavailable}>Imagen no disponible</div>:null}
    {message.messageType==='audio'?message.mediaUrl?<div className={styles.audioAttachment}><span>Mensaje de voz</span><audio controls preload="metadata" src={message.mediaUrl}/></div>:<div className={styles.mediaUnavailable}>Audio no disponible</div>:null}
    {showCaption?<p>{message.content}</p>:null}
    {message.transcriptStatus==='ready'&&message.transcript?<details className={styles.transcript}><summary>Ver transcripción de IA</summary><p>{message.transcript}</p></details>:null}
  </>
}

export default function HumanSupportChat(){
  const[tenant]=useState(()=>readTenantSession())
  const[open,setOpen]=useState(false)
  const[state,setState]=useState<SupportState>(EMPTY_STATE)
  const[draft,setDraft]=useState('')
  const[imageFile,setImageFile]=useState<File|null>(null)
  const[imagePreview,setImagePreview]=useState('')
  const[loading,setLoading]=useState(false)
  const[sending,setSending]=useState(false)
  const[recording,setRecording]=useState(false)
  const[recordSeconds,setRecordSeconds]=useState(0)
  const[error,setError]=useState('')
  const refreshing=useRef(false)
  const endRef=useRef<HTMLDivElement|null>(null)
  const launchRef=useRef<HTMLButtonElement|null>(null)
  const textareaRef=useRef<HTMLTextAreaElement|null>(null)
  const fileRef=useRef<HTMLInputElement|null>(null)
  const recorderRef=useRef<MediaRecorder|null>(null)
  const streamRef=useRef<MediaStream|null>(null)
  const chunksRef=useRef<BlobPart[]>([])
  const startedAtRef=useRef(0)
  const cancelRecordingRef=useRef(false)
  const hideChat=useCallback(()=>{setOpen(false);window.setTimeout(()=>launchRef.current?.focus(),0)},[])

  async function refresh(showLoading=false){
    if(refreshing.current)return
    refreshing.current=true
    if(showLoading)setLoading(true)
    try{setState(await loadSupportState());setError('')}
    catch(value){setError(value instanceof Error?value.message:'No se pudo cargar soporte.')}
    finally{refreshing.current=false;if(showLoading)setLoading(false)}
  }

  useEffect(()=>{
    const openFromOnboarding=()=>setOpen(true)
    window.addEventListener('comercio:open-human-support',openFromOnboarding)
    return()=>window.removeEventListener('comercio:open-human-support',openFromOnboarding)
  },[])

  useEffect(()=>{
    if(!open)return
    void refresh(true)
    const poll=()=>{if(document.visibilityState==='visible')void refresh(false)}
    const onVisibility=()=>{if(document.visibilityState==='visible')void refresh(false)}
    const timer=window.setInterval(poll,6000)
    document.addEventListener('visibilitychange',onVisibility)
    return()=>{window.clearInterval(timer);document.removeEventListener('visibilitychange',onVisibility)}
  },[open])

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth',block:'end'})},[state.messages.length,open])
  useEffect(()=>{
    if(!open)return
    const previousOverflow=document.body.style.overflow
    const closeOnEscape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&!recording)hideChat()}
    document.body.style.overflow='hidden'
    window.addEventListener('keydown',closeOnEscape)
    const focusTimer=window.setTimeout(()=>textareaRef.current?.focus(),80)
    return()=>{document.body.style.overflow=previousOverflow;window.removeEventListener('keydown',closeOnEscape);window.clearTimeout(focusTimer)}
  },[hideChat,open,recording])

  useEffect(()=>{
    if(!recording)return
    const timer=window.setInterval(()=>setRecordSeconds(Math.min(180,Math.floor((Date.now()-startedAtRef.current)/1000))),250)
    return()=>window.clearInterval(timer)
  },[recording])

  useEffect(()=>()=>{
    recorderRef.current?.state==='recording'&&recorderRef.current.stop()
    streamRef.current?.getTracks().forEach(track=>track.stop())
    if(imagePreview)URL.revokeObjectURL(imagePreview)
  },[imagePreview])

  function clearImage(){if(imagePreview)URL.revokeObjectURL(imagePreview);setImagePreview('');setImageFile(null);if(fileRef.current)fileRef.current.value=''}

  async function send(event:FormEvent){
    event.preventDefault();const content=draft.trim();if((!content&&!imageFile)||sending||recording)return
    setSending(true);setError('')
    try{
      if(imageFile){setState(await sendSupportMedia(imageFile,'image',{message:content}));clearImage()}
      else setState(await sendSupportMessage(content))
      setDraft('')
    }
    catch(value){setError(value instanceof Error?value.message:'No se pudo enviar el mensaje.')}
    finally{setSending(false)}
  }

  async function startRecording(){
    if(sending||recording)return
    if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined'){setError('Este navegador no permite grabar audios desde el chat.');return}
    try{
      setError('');cancelRecordingRef.current=false;chunksRef.current=[]
      const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}})
      streamRef.current=stream
      const mime=bestAudioMime();const recorder=mime?new MediaRecorder(stream,{mimeType:mime}):new MediaRecorder(stream)
      recorderRef.current=recorder;startedAtRef.current=Date.now();setRecordSeconds(0)
      recorder.ondataavailable=e=>{if(e.data.size)chunksRef.current.push(e.data)}
      recorder.onstop=async()=>{
        const duration=Math.min(180000,Date.now()-startedAtRef.current)
        stream.getTracks().forEach(track=>track.stop());streamRef.current=null;recorderRef.current=null;setRecording(false)
        if(cancelRecordingRef.current){chunksRef.current=[];return}
        const type=recorder.mimeType||mime||'audio/webm';const blob=new Blob(chunksRef.current,{type});chunksRef.current=[]
        if(!blob.size){setError('No se grabó audio. Probá nuevamente.');return}
        setSending(true)
        try{const uploadType=type.split(';')[0]||'audio/webm';const file=new File([blob],`mensaje-voz.${extensionFor(uploadType)}`,{type:uploadType});setState(await sendSupportMedia(file,'audio',{durationMs:duration}));setError('')}
        catch(value){setError(value instanceof Error?value.message:'No se pudo enviar el audio.')}
        finally{setSending(false)}
      }
      recorder.start(250);setRecording(true)
      window.setTimeout(()=>{if(recorder.state==='recording')recorder.stop()},180000)
    }catch(value){setError(value instanceof DOMException&&value.name==='NotAllowedError'?'Dale permiso al navegador para usar el micrófono.':'No se pudo abrir el micrófono.')}
  }

  function finishRecording(){if(recorderRef.current?.state==='recording')recorderRef.current.stop()}
  function cancelRecording(){cancelRecordingRef.current=true;if(recorderRef.current?.state==='recording')recorderRef.current.stop()}

  function pickImage(file:File|null){
    if(!file)return
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)){setError('Adjuntá una imagen JPG, PNG o WebP.');return}
    if(file.size>10*1024*1024){setError('La imagen puede pesar hasta 10 MB.');return}
    clearImage();setImageFile(file);setImagePreview(URL.createObjectURL(file));setError('');window.setTimeout(()=>textareaRef.current?.focus(),0)
  }

  async function closeConversation(){
    if(!state.conversation||sending||recording)return
    setSending(true);setError('')
    try{setState(await closeSupportConversation())}
    catch(value){setError(value instanceof Error?value.message:'No se pudo cerrar la conversación.')}
    finally{setSending(false)}
  }

  const status=!state.conversation?'Nuevo chat':state.conversation.status==='pending'?'Esperando respuesta':state.conversation.status==='in_progress'?'Soporte conectado':'Finalizado'
  const statusKind=!state.conversation?'new':state.conversation.status
  const dialog=<div className={styles.backdrop} onMouseDown={event=>{if(event.target===event.currentTarget&&!recording)hideChat()}}>
    <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="human-support-title">
      <header className={styles.modalHead}><div><span>AYUDA HUMANA · CENTRAL LLENA</span><h2 id="human-support-title">Hablemos, estamos para ayudarte</h2><p>Escribí, mandá un audio real o adjuntá una captura. Una persona te responde directamente por acá.</p></div><button type="button" className={styles.close} onClick={hideChat} aria-label="Cerrar ayuda humana" disabled={recording}>×</button></header>
      <div className={styles.chat}>
        <div className={styles.context}><div><b>{tenant?.companyName||'Tu comercio'}</b><small>{roleLabel(tenant?.role||'owner')} · Soporte humano</small></div><span data-stage={statusKind}>{status}</span></div>
        <div className={styles.messages} aria-live="polite" aria-busy={loading}>
          {loading&&!state.messages.length?<div className={styles.system}>Conectando con Central Llena…</div>:null}
          {!loading&&!state.messages.length?<div className={styles.system}>Hola. Contanos qué pasó. Podés escribir, enviar una nota de voz o adjuntar una captura.</div>:null}
          {state.messages.map(message=><div key={message.id} className={message.from==='customer'?styles.user:message.from==='agent'?styles.agent:styles.system}>{message.from==='agent'?<b>{message.senderName||'Central Llena'}</b>:null}<MessageBody message={message}/><time>{timeLabel(message.createdAt)}</time></div>)}
          <div ref={endRef}/>
        </div>
        {error?<div className={styles.error} role="alert">{error}</div>:null}
        {imagePreview?<div className={styles.attachmentPreview}><img src={imagePreview} alt="Vista previa de la captura"/><div><b>Captura lista para enviar</b><small>Podés agregar una explicación debajo.</small></div><button type="button" onClick={clearImage} aria-label="Quitar imagen">×</button></div>:null}
        {recording?<div className={styles.recordingBar}><span className={styles.recordDot}/><b>Grabando audio · {recordSeconds}s</b><small>El audio original se enviará y quedará disponible para escucharlo.</small><button type="button" onClick={cancelRecording}>Cancelar</button></div>:null}
        <form className={styles.form} onSubmit={send}>
          <div className={styles.composerTools}>
            <input ref={fileRef} className={styles.hiddenInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={event=>pickImage(event.target.files?.[0]||null)}/>
            <button type="button" className={styles.imageButton} onClick={()=>fileRef.current?.click()} disabled={sending||recording} aria-label="Adjuntar una imagen"><span className={styles.imageGlyph} aria-hidden="true"/>Imagen</button>
            <button type="button" className={`${styles.micButton} ${recording?styles.micRecording:''}`} onClick={recording?finishRecording:()=>void startRecording()} disabled={sending} aria-label={recording?'Enviar audio':'Grabar audio'}><span className={styles.micGlyph} aria-hidden="true"/>{recording?'Enviar audio':'Audio'}</button>
          </div>
          <textarea ref={textareaRef} aria-label="Mensaje para soporte" rows={3} maxLength={2000} autoComplete="off" value={draft} onChange={event=>setDraft(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.nativeEvent.isComposing&&!recording){event.preventDefault();event.currentTarget.form?.requestSubmit()}}} placeholder={imageFile?'Explicá qué vemos en la captura (opcional)…':'Escribí qué necesitás…'} disabled={recording}/>
          <button type="submit" className={styles.sendButton} disabled={sending||recording||(!draft.trim()&&!imageFile)}>{sending?'Enviando…':imageFile?'Enviar captura':'Enviar'}</button>
        </form>
        <div className={styles.actions}>{state.conversation&&state.conversation.status!=='resolved'?<button type="button" className={styles.secondary} onClick={()=>void closeConversation()} disabled={sending||recording}>Finalizar conversación</button>:null}<button type="button" className={styles.secondary} onClick={hideChat} disabled={recording}>Cerrar</button></div>
      </div>
    </section>
  </div>
  return <><div className={styles.card}><div className={styles.top}><span>SOPORTE HUMANO</span><span className={styles.liveFlag}>EN LÍNEA</span></div><h3>¿Necesitás una persona?</h3><p>Escribinos, mandanos un audio o una captura sin salir del sistema. Todo llega a Central Llena.</p><button ref={launchRef} className={styles.launch} type="button" onClick={()=>setOpen(true)}>Ayuda humana</button><small>Mensajes, audios e imágenes dentro de Comercio Lleno.</small></div>{open&&typeof document!=='undefined'?createPortal(dialog,document.body):null}</>
}
