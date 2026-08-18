import { NextResponse } from 'next/server'

export const dynamic='force-dynamic'

export async function GET(){
  try{
    const response=await fetch('https://pejkycdttogpmmdntzuq.supabase.co/functions/v1/cv-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'health'}),cache:'no-store'})
    const data=await response.json().catch(()=>({ok:false,error:'invalid_response'}))
    return NextResponse.json(data,{status:response.status})
  }catch(error){
    return NextResponse.json({ok:false,error:error instanceof Error?error.message:String(error)},{status:502})
  }
}
