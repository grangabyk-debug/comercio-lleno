'use client'

import {useLayoutEffect} from 'react'

const FALLBACKS:[string,unknown][]=[
 ['/api/postula/company/jobs',{ok:false,jobs:[],timeout:true}],
 ['/api/postula/applications',{ok:false,applications:[],timeout:true}],
 ['/api/postula/company/notes',{ok:false,notes:[],timeout:true}],
 ['/api/postula/company/team',{ok:false,members:[],timeout:true}],
 ['/api/postula/company/handoffs',{ok:false,handoffs:[],timeout:true}],
 ['/api/postula/messages',{ok:false,conversations:[],timeout:true}],
]

export default function EmployerDashboardLoadGuard(){
 useLayoutEffect(()=>{
  const original=window.fetch.bind(window)
  const guarded:typeof window.fetch=(input,init)=>{
   const method=String(init?.method||'GET').toUpperCase()
   const raw=typeof input==='string'?input:input instanceof URL?input.toString():input.url
   const pathname=(()=>{try{return new URL(raw,window.location.origin).pathname}catch{return raw}})()
   const fallback=method==='GET'?FALLBACKS.find(([prefix])=>pathname.startsWith(prefix))?.[1]:undefined
   if(!fallback)return original(input as RequestInfo|URL,init)
   let timer=0
   const timeout=new Promise<Response>(resolve=>{timer=window.setTimeout(()=>resolve(new Response(JSON.stringify(fallback),{status:200,headers:{'Content-Type':'application/json','X-Postula-Timeout':'1'}})),5000)})
   return Promise.race([original(input as RequestInfo|URL,init),timeout]).finally(()=>window.clearTimeout(timer))
  }
  window.fetch=guarded
  return()=>{if(window.fetch===guarded)window.fetch=original}
 },[])
 return null
}
