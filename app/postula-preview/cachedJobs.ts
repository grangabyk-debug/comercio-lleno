import {unstable_cache} from 'next/cache'
import {getFullJobCatalog} from './jobs'

export const getCachedFullJobCatalog=unstable_cache(
  getFullJobCatalog,
  ['postula-empleos-catalog-v2'],
  {revalidate:21600,tags:['postula-empleos-catalog']},
)
