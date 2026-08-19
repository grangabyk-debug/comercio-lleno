'use client'

import { createClient } from '@supabase/supabase-js'

export const CV_SUPABASE_URL='https://pejkycdttogpmmdntzuq.supabase.co'
export const CV_SUPABASE_KEY='sb_publishable_JmqxkVG1qNuCwFqMeVgBg_-Nn32N2I'
export const CV_API=`${CV_SUPABASE_URL}/functions/v1/cv-ai`
export const CV_PRO_API=`${CV_SUPABASE_URL}/functions/v1/cv-ai-pro-v2`
export const CV_ACCOUNT_API=`${CV_SUPABASE_URL}/functions/v1/cv-ai-account`
export const CV_CONSENT_API=`${CV_SUPABASE_URL}/functions/v1/cv-ai-consent`
export const CV_TELEMETRY_API=`${CV_SUPABASE_URL}/functions/v1/cv-ai-telemetry`
export const SESSION_KEY='cv_ai_session_token_v1'

let singleton:ReturnType<typeof createClient>|null=null
export function cvAuthClient(){
  if(!singleton)singleton=createClient(CV_SUPABASE_URL,CV_SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})
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
