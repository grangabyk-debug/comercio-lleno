import {NextResponse} from 'next/server'
import {discoverPublicJobs} from '../../../postula-preview/publicJobSources'

export const runtime='nodejs'
export const dynamic='force-dynamic'

export async function GET(request:Request){
  const expected=process.env.CRON_SECRET
  const authorization=request.headers.get('authorization')||''
  const cronSchedule=request.headers.get('x-vercel-cron-schedule')
  if(expected&&authorization!==`Bearer ${expected}`)return NextResponse.json({ok:false,error:'unauthorized'},{status:401})
  if(!expected&&!cronSchedule&&process.env.VERCEL_ENV==='production')return NextResponse.json({ok:false,error:'cron_only'},{status:403})
  const jobs=await discoverPublicJobs()
  const byArea=jobs.reduce<Record<string,number>>((acc,job)=>{acc[job.area]=(acc[job.area]||0)+1;return acc},{})
  const byCompany=jobs.reduce<Record<string,number>>((acc,job)=>{acc[job.company]=(acc[job.company]||0)+1;return acc},{})
  return NextResponse.json({ok:true,checkedAt:new Date().toISOString(),total:jobs.length,buenosAires:jobs.filter(j=>/buenos aires|caba|capital federal/i.test(j.location)).length,areas:Object.keys(byArea).length,companies:Object.keys(byCompany).length,byArea})
}
