'use client'

import { createClient } from '@supabase/supabase-js'

const POSTULA_SUPABASE_FALLBACK='https://pejkycdttogpmmdntzuq.supabase.co'
export const CV_SUPABASE_URL=(process.env.NEXT_PUBLIC_POSTULA_SUPABASE_URL||POSTULA_SUPABASE_FALLBACK).replace(/\/+$/,'')
export const CV_SUPABASE_KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
export const CV_API=`${CV_SUPABASE_URL}/functions/v1/cv-ai`
export const CV_PRO_API=`${CV_SUPABASE_URL}/functions/v1/cv-ai-pro-gateway`
export const CV_ACCOUNT_API=`${CV_SUPABASE_URL}/functions/v1/cv-ai-account`
export const CV_CONSENT_API=`${CV_SUPABASE_URL}/functions/v1/cv-ai-consent`
export const CV_TELEMETRY_API=`${CV_SUPABASE_URL}/functions/v1/cv-ai-telemetry`
export const SESSION_KEY='cv_ai_session_token_v1'

let singleton:ReturnType<typeof createClient>|null=null

function stabilizeSessionReads(client:ReturnType<typeof createClient>){
  const auth:any=client.auth
  const nativeGetSession=auth.getSession.bind(auth)
  let cachedSession:any=undefined
  let refreshInFlight:Promise<any>|null=null
  let resolveInitial:((value:any)=>void)|null=null
  const initialSession=new Promise<any>(resolve=>{resolveInitial=resolve})

  const publish=(session:any)=>{
    cachedSession=session??null
    if(resolveInitial){
      resolveInitial({data:{session:cachedSession},error:null})
      resolveInitial=null
    }
  }

  auth.onAuthStateChange((event:string,session:any)=>{
    if(event==='INITIAL_SESSION'||event==='SIGNED_IN'||event==='SIGNED_OUT'||event==='TOKEN_REFRESHED'||event==='USER_UPDATED'||event==='PASSWORD_RECOVERY')publish(session)
  })

  auth.getSession=()=>{
    if(cachedSession===undefined)return initialSession
    if(cachedSession===null)return Promise.resolve({data:{session:null},error:null})
    const expiresAt=Number(cachedSession?.expires_at||0)*1000
    if(!expiresAt||expiresAt>Date.now()+30_000)return Promise.resolve({data:{session:cachedSession},error:null})
    if(refreshInFlight)return refreshInFlight
    refreshInFlight=nativeGetSession().then((result:any)=>{
      if(result?.data&&Object.prototype.hasOwnProperty.call(result.data,'session'))cachedSession=result.data.session??null
      return result
    }).finally(()=>{refreshInFlight=null})
    return refreshInFlight
  }
}

export function cvAuthClient(){
  if(!singleton){
    singleton=createClient(CV_SUPABASE_URL,CV_SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})
    stabilizeSessionReads(singleton)
  }
  return singleton
}

export async function authHeaders(){
  const {data}=await cvAuthClient().auth.getSession()
  return data.session?.access_token?{Authorization:`Bearer ${data.session.access_token}`}:{ }
}

export async function postCv(url:string,body:any,withAuth=false){
  const headers:Record<string,string>={'Content-Type':'application/json'}
  if(withAuth)Object.assign(headers,await authHeaders())
  const response=await fetch(url,{method:'POST',headers,body:JSON.stringify(body)})
  const data=await response.json().catch(()=>({ok:false,error:'Respuesta inválida del servidor.'}))
  if(!response.ok||!data?.ok)throw new Error(data?.error||'No pudimos completar la operación.')
  return data
}

export async function trackCvEvent(event_name:string,metadata:Record<string,string|number|boolean>={},page?:string){
  try{
    const token=typeof window!=='undefined'?localStorage.getItem(SESSION_KEY)||'':''
    const headers:Record<string,string>={'Content-Type':'application/json',...(await authHeaders())}
    await fetch(CV_TELEMETRY_API,{method:'POST',headers,keepalive:true,body:JSON.stringify({action:'event',token,event_name,page:page||(typeof window!=='undefined'?window.location.pathname:'/'),metadata})})
  }catch{/* La telemetría nunca debe bloquear la experiencia del usuario. */}
}
