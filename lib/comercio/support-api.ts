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
}

export type SupportState={conversation:SupportConversation|null;messages:SupportMessage[]}

async function supportRequest(payload:Record<string,unknown>):Promise<SupportState>{
  const stored=readTenantSession()
  if(!stored)throw new Error('Iniciá sesión nuevamente para usar soporte.')
  const session=await refreshTenantSession(stored)
  const response=await fetch(SUPPORT_ENDPOINT,{
    method:'POST',
    headers:{Authorization:`Bearer ${session.token}`,'Content-Type':'application/json'},
    body:JSON.stringify(payload),
    cache:'no-store',
  })
  const data=await response.json().catch(()=>({}))
  if(!response.ok)throw new Error(String(data?.error||'No se pudo conectar con Central Llena.'))
  return {
    conversation:data?.conversation||null,
    messages:Array.isArray(data?.messages)?data.messages:[],
  }
}

export function loadSupportState(){return supportRequest({action:'state'})}

export function sendSupportMessage(message:string){
  const clientMessageId=typeof crypto!=='undefined'&&'randomUUID'in crypto?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`
  return supportRequest({action:'send',message,clientMessageId})
}

export function closeSupportConversation(){return supportRequest({action:'close'})}
