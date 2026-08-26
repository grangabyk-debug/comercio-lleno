import {createClient} from '@supabase/supabase-js'
import type {PreviewJob} from './jobs'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'
const brandingBucket=`${URL}/storage/v1/object/public/postula-branding/`
const db=createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false}})

export type PublicCompanyProfile={
 id:string
 name:string
 website?:string|null
 city?:string|null
 province?:string|null
 description?:string|null
 verification_status?:string|null
 industry?:string|null
 logo_path?:string|null
 active_jobs?:number|null
}

export function publicCompanyNameKey(name:string){
 const slug=name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,90)
 return `nombre-${slug||'empresa'}`
}

export function publicCompanyLogo(profile:PublicCompanyProfile|null|undefined){return profile?.logo_path?`${brandingBucket}${String(profile.logo_path)}`:''}

export async function getPublicCompanyById(id:string):Promise<PublicCompanyProfile|null>{
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))return null
 try{const {data,error}=await db.rpc('pm_public_company_profile',{p_company_id:id});if(error||!Array.isArray(data)||!data[0])return null;return data[0] as PublicCompanyProfile}catch{return null}
}

export async function companyProfileHref(job:PreviewJob){
 if(job.confidential)return''
 if(job.external)return`/empresas/perfil/${publicCompanyNameKey(job.company)}`
 if(!job.internalJobId)return''
 try{const {data,error}=await db.from('pm_jobs').select('company_id').eq('id',job.internalJobId).eq('status','published').maybeSingle();if(error||!data?.company_id)return'';return`/empresas/perfil/${String(data.company_id)}`}catch{return''}
}
