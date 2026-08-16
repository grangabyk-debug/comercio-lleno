import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getVercelOidcToken } from '@vercel/oidc'
import { commerceGuideAnswer } from './guide'

const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL??'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

async function hasValidSession(req:NextRequest){
  const token=(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'').trim()
  if(!token)return false
  try{
    const response=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${token}`},cache:'no-store'})
    if(!response.ok)return false
    const user=await response.json().catch(()=>null)
    return Boolean(user?.id)
  }catch{return false}
}

export async function POST(req: NextRequest) {
  const body=await req.clone().json().catch(()=>({}))
  const question=String(body?.message||'').trim().slice(0,2000)
  const guideAnswer=question?commerceGuideAnswer(question):null

  if(guideAnswer){
    if(!await hasValidSession(req))return NextResponse.json({ok:false,error:'La sesión no es válida o venció. Volvé a iniciar sesión.'},{status:401})
    return NextResponse.json({ok:true,answer:guideAnswer,model:'commerce-product-guide'})
  }

  if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) {
    try {
      const token = await getVercelOidcToken()
      if (token) process.env.VERCEL_OIDC_TOKEN = token
    } catch {}
  }
  const handler = await import('./handler-v2')
  return handler.POST(req)
}
