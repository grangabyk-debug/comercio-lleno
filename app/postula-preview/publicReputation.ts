import {createClient} from '@supabase/supabase-js'

const URL='https://pejkycdttogpmmdntzuq.supabase.co'
const KEY='sb_publishable_JmqxkVG1qNuCwWfqMeVgBg_-Nn32N2I'

export type ReputationIndicator='forming'|'favorable'|'mixed'|'unfavorable'
export type PublicReputation={count:number;average:number|null;indicator:ReputationIndicator;label:string}

const labels:Record<ReputationIndicator,string>={
 forming:'Indicador en formación',
 favorable:'Favorable',
 mixed:'Mixto',
 unfavorable:'Desfavorable',
}

function normalized(row:any):PublicReputation{
 const count=Number(row?.review_count||0)
 const average=row?.average_rating==null?null:Number(row.average_rating)
 const indicator=(['forming','favorable','mixed','unfavorable'].includes(String(row?.indicator))?row.indicator:'forming') as ReputationIndicator
 return{count,average:Number.isFinite(average as number)?average:null,indicator,label:labels[indicator]}
}

function db(){return createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false}})}

export async function getPublicCompanyReputation(companyId?:string|null){
 if(!companyId)return normalized(null)
 const {data,error}=await db().rpc('pm_public_company_reputation',{p_company_id:companyId})
 if(error)return normalized(null)
 return normalized(Array.isArray(data)?data[0]:data)
}

export async function getPublicCandidateReputation(candidateUserId?:string|null){
 if(!candidateUserId)return normalized(null)
 const {data,error}=await db().rpc('pm_public_candidate_reputation',{p_candidate_user_id:candidateUserId})
 if(error)return normalized(null)
 return normalized(Array.isArray(data)?data[0]:data)
}

export function reputationText(rep:PublicReputation){
 if(rep.count<3)return`Indicador en formación · ${rep.count}/3`
 const score=rep.average==null?'—':rep.average.toLocaleString('es-AR',{minimumFractionDigits:1,maximumFractionDigits:1})
 return`★ ${score} · ${rep.label} · ${rep.count} ${rep.count===1?'experiencia':'experiencias'}`
}
