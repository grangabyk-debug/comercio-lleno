import { readTenantSession, refreshTenantSession } from './session'

const SUPPORT_ENDPOINT='https://pejkycdttogpmmdntzuq.supabase.co/functions/v1/support-chat'

export type SupportConversation={
  id:string
  subject:string
  status:'pending'|'in_progress'|'resolved'
  priority:'low'|'normal'|'high'|'urgent'
  customerUnreadCount:number
  lastMessageAt:string
  createdAt:string
}

export type SupportMessage={
  id:string
  from:'customer'|'agent'|'bot'|'system'
  senderName:string|null
  content:string
  createdAt:string
  messageType:'text'|'audio'|'image'
  mediaUrl:string|null
  mediaMimeType:string|null
  mediaSizeBytes:number|null
  mediaDurationMs:number|null
  mediaOriginalName:string|null
  transcript:string|null
  transcriptStatus:'not_requested'|'pending'|'ready'|'failed'
}

export type SupportState={conversation:SupportConversation|null;messages:SupportMessage[]}

async function sessionToken(){
  const stored=readTenantSession()
  if(!stored)throw new Error('Iniciá sesión nuevamente para usar soporte.')
  return (await refreshTenantSession(stored)).token
}

function normalizeState(data:any):SupportState{
  return {conversation:data?.conversation||null,messages:Array.isArray(data?.messages)?data.messages:[]}
}

async function supportRequest(payload:Record<string,unknown>):Promise<SupportState>{
  const token=await sessionToken()
  const response=await fetch(SUPPORT_ENDPOINT,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(payload),cache:'no-store'})
  const data=await response.json().catch(()=>({}))
  if(!response.ok)throw new Error(String(data?.error||'No se pudo conectar con Central Llena.'))
  return normalizeState(data)
}

export function loadSupportState(){return supportRequest({action:'state'})}

export function sendSupportMessage(message:string){
  const clientMessageId=typeof crypto!=='undefined'&&'randomUUID'in crypto?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`
  return supportRequest({action:'send',message,clientMessageId})
}

export async function sendSupportMedia(file:File,mediaKind:'audio'|'image',options?:{message?:string;durationMs?:number}){
  const token=await sessionToken()
  const form=new FormData()
  form.append('action','send_media')
  form.append('mediaKind',mediaKind)
  form.append('clientMessageId',typeof crypto!=='undefined'&&'randomUUID'in crypto?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`)
  form.append('message',options?.message?.trim()||'')
  if(mediaKind==='audio')form.append('mediaDurationMs',String(Math.max(0,Math.round(options?.durationMs||0))))
  form.append('file',file,file.name)
  const response=await fetch(SUPPORT_ENDPOINT,{method:'POST',headers:{Authorization:`Bearer ${token}`},body:form,cache:'no-store'})
  const data=await response.json().catch(()=>({}))
  if(!response.ok)throw new Error(String(data?.error||'No se pudo enviar el archivo.'))
  return normalizeState(data)
}

export function closeSupportConversation(){return supportRequest({action:'close'})}
