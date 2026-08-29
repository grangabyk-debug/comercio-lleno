import {unstable_cache} from 'next/cache'
import {getFullJobCatalog,getJobCatalog,type PreviewJob} from './jobs'

const getCachedBaseJobCatalog=unstable_cache(
  getFullJobCatalog,
  ['postula-empleos-catalog-v3'],
  {revalidate:21600,tags:['postula-empleos-catalog']},
)

function recency(job:PreviewJob){
  const value=Date.parse(String(job.checkedAt||''))
  return Number.isFinite(value)?value:0
}

export async function getCachedFullJobCatalog():Promise<PreviewJob[]>{
  const [cachedFull,freshCatalog]=await Promise.all([
    getCachedBaseJobCatalog(),
    getJobCatalog(),
  ])

  // El catálogo externo es pesado y conserva el caché de 6 h, pero los avisos
  // publicados dentro de PostuláMejor deben aparecer y desaparecer en tiempo real.
  const freshNative=freshCatalog.filter(job=>Boolean(job.internalJobId))
  const cachedWithoutNative=cachedFull.filter(job=>!job.internalJobId)
  const seen=new Set<string>()

  return [...freshNative,...cachedWithoutNative]
    .filter(job=>{
      const key=job.internalJobId?`internal:${job.internalJobId}`:`slug:${job.slug}`
      if(seen.has(key))return false
      seen.add(key)
      return true
    })
    .sort((a,b)=>recency(b)-recency(a)||Number(Boolean(b.internalJobId))-Number(Boolean(a.internalJobId))||a.title.localeCompare(b.title,'es'))
}
