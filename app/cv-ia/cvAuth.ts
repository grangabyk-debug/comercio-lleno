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

function storedBrowserSession(){
  if(typeof window==='undefined')return null
  try{
    const host=new URL(CV_SUPABASE_URL).hostname.split('.')[0]
    const preferred=`sb-${host}-auth-token`
    const keys=[preferred]
    for(let i=0;i<window.localStorage.length;i++){
      const key=window.localStorage.key(i)
      if(key&&/^sb-.*-auth-token$/.test(key)&&!keys.includes(key))keys.push(key)
    }
    for(const key of keys){
      const raw=window.localStorage.getItem(key)
      if(!raw)continue
      const parsed=JSON.parse(raw)
      const session=parsed?.currentSession||parsed?.session||parsed
      if(!session?.access_token||!session?.user)continue
      const tokenPayload=String(session.access_token).split('.')[1]
      if(tokenPayload){
        try{
          const normalized=tokenPayload.replace(/-/g,'+').replace(/_/g,'/')
          const payload=JSON.parse(window.atob(normalized.padEnd(Math.ceil(normalized.length/4)*4,'=')))
          const issuer=String(payload?.iss||'')
          const expectedHost=new URL(POSTULA_SUPABASE_FALLBACK).hostname
          if(issuer&&issuer.includes('supabase.co')&&!issuer.includes(expectedHost))continue
        }catch{}
      }
      return session
    }
  }catch{}
  return null
}

export function cvAuthClient(){
  if(!singleton){
    singleton=createClient(CV_SUPABASE_URL,CV_SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})
    const auth:any=singleton.auth
    const nativeGetSession=auth.getSession.bind(auth)
    auth.getSession=()=>{
      const stored=storedBrowserSession()
      const expiresAt=Number(stored?.expires_at||0)*1000
      if(stored?.access_token&&(!expiresAt||expiresAt>Date.now()+10_000))return Promise.resolve({data:{session:stored},error:null})
      return Promise.race([
        nativeGetSession(),
        new Promise(resolve=>window.setTimeout(()=>resolve({data:{session:null},error:null}),2500))
      ])
    }
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
