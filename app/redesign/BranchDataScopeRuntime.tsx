'use client'

import { useLayoutEffect } from 'react'
import { readActiveBranchId } from '@/lib/comercio/branch-context'

const SUPABASE_HOST='wtcntclzcubkbtcsqkzc.supabase.co'
const SCOPED_TABLES=new Set(['products','sales','cash_registers','cash_movements','purchases','returns','stock_movements','suspended_sales','promotions','finance_expenses'])

function bodyWithBranch(body:BodyInit|null|undefined,branchId:string,rpc:string){
  if(typeof body!=='string')return body
  try{
    const data=JSON.parse(body)
    if(rpc==='persist_sale_atomic'&&data?.p_sale&&typeof data.p_sale==='object')return JSON.stringify({...data,p_sale:{...data.p_sale,branch_id:branchId}})
    if(rpc==='bulk_increase_product_prices')return JSON.stringify({...data,p_branch_id:branchId})
    if(Array.isArray(data))return JSON.stringify(data.map(x=>x&&typeof x==='object'?{...x,branch_id:branchId}:x))
    if(data&&typeof data==='object')return JSON.stringify({...data,branch_id:branchId})
  }catch{}
  return body
}

function isScopedCandidate(raw:string){
  if(raw.startsWith('/api/redesign/products-sheet')||raw.startsWith(`${location.origin}/api/redesign/products-sheet`))return true
  try{
    const url=new URL(raw,location.origin)
    if(url.hostname!==SUPABASE_HOST||!url.pathname.startsWith('/rest/v1/'))return false
    const resource=url.pathname.slice('/rest/v1/'.length).split('/')[0]
    if(SCOPED_TABLES.has(resource))return true
    if(resource!=='rpc')return false
    const rpc=url.pathname.slice('/rest/v1/rpc/'.length).split('/')[0]
    return rpc==='persist_sale_atomic'||rpc==='bulk_increase_product_prices'
  }catch{return false}
}

async function waitForBranch(){
  const existing=readActiveBranchId()
  if(existing)return existing
  return new Promise<string>(resolve=>{
    let finished=false
    const done=()=>{
      if(finished)return
      finished=true
      window.removeEventListener('comercio:branch-ready',done)
      clearTimeout(timer)
      resolve(readActiveBranchId())
    }
    const timer=window.setTimeout(done,4000)
    window.addEventListener('comercio:branch-ready',done,{once:true})
  })
}

export default function BranchDataScopeRuntime(){
  useLayoutEffect(()=>{
    const original=window.fetch.bind(window)
    window.fetch=(async(input:RequestInfo|URL,init?:RequestInit)=>{
      const raw=typeof input==='string'?input:input instanceof URL?input.toString():input.url
      if(!isScopedCandidate(raw))return original(input,init)
      const branchId=readActiveBranchId()||await waitForBranch()
      if(!branchId)return original(input,init)

      if(raw.startsWith('/api/redesign/products-sheet')||raw.startsWith(`${location.origin}/api/redesign/products-sheet`)){
        const headers=new Headers(init?.headers||(input instanceof Request?input.headers:undefined))
        headers.set('x-comercio-branch-id',branchId)
        return original(input,{...init,headers})
      }

      let url:URL
      try{url=new URL(raw,location.origin)}catch{return original(input,init)}
      const resource=url.pathname.slice('/rest/v1/'.length).split('/')[0]
      const isRpc=resource==='rpc'
      const rpc=isRpc?url.pathname.slice('/rest/v1/rpc/'.length).split('/')[0]:''
      const scoped=SCOPED_TABLES.has(resource)

      const method=(init?.method||(input instanceof Request?input.method:'GET')).toUpperCase()
      if(scoped&&method!=='POST'&&!url.searchParams.has('branch_id'))url.searchParams.append('branch_id',`eq.${branchId}`)
      const nextInit={...init}
      if(method!=='GET'&&method!=='HEAD')nextInit.body=bodyWithBranch(init?.body||(input instanceof Request?undefined:null),branchId,rpc)
      return original(url.toString(),nextInit)
    }) as typeof window.fetch
    return()=>{window.fetch=original as typeof window.fetch}
  },[])
  return null
}
