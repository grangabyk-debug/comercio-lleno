import {NextResponse} from 'next/server'
import {getCachedFullJobCatalog} from '../../../postula-preview/cachedJobs'

export const dynamic='force-dynamic'

export async function GET(){
  const jobs=await getCachedFullJobCatalog()
  return NextResponse.json(
    {count:jobs.length},
    {headers:{'Cache-Control':'public, s-maxage=21600, stale-while-revalidate=3600'}},
  )
}
