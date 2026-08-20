import type {MetadataRoute} from 'next'
import {headers} from 'next/headers'
import {solutions} from './soluciones/solutions'

export const dynamic='force-dynamic'

function isPostulaHost(host:string){const clean=host.split(':')[0].toLowerCase();return clean==='postulamejor.com'||clean==='www.postulamejor.com'}

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const h=await headers()
  const host=h.get('x-forwarded-host')||h.get('host')||''
  if(isPostulaHost(host)){
    const base='https://postulamejor.com'
    return[
      {url:base,changeFrequency:'daily',priority:1},
      {url:`${base}/empleos`,changeFrequency:'daily',priority:1},
      {url:`${base}/trabajos-flex`,changeFrequency:'daily',priority:.9},
      {url:`${base}/empresas`,changeFrequency:'weekly',priority:.9},
      {url:`${base}/mejorar-cv`,changeFrequency:'weekly',priority:.9},
      {url:`${base}/primer-cv`,changeFrequency:'monthly',priority:.75},
      {url:`${base}/test-vocacional`,changeFrequency:'monthly',priority:.75},
      {url:`${base}/plantillas`,changeFrequency:'monthly',priority:.75},
      {url:`${base}/legales`,changeFrequency:'monthly',priority:.3},
      {url:`${base}/privacidad`,changeFrequency:'monthly',priority:.3},
      {url:`${base}/terminos`,changeFrequency:'monthly',priority:.3},
    ]
  }
  const base='https://comerciolleno.com'
  const solutionPages:MetadataRoute.Sitemap=solutions.map(({slug})=>({url:`${base}/soluciones/${slug}`,changeFrequency:'monthly',priority:.8}))
  return[
    {url:base,changeFrequency:'weekly',priority:1},
    {url:`${base}/prueba-gratis`,changeFrequency:'monthly',priority:.9},
    {url:`${base}/soluciones`,changeFrequency:'monthly',priority:.85},
    ...solutionPages,
    {url:`${base}/terminos`,changeFrequency:'monthly',priority:.3},
    {url:`${base}/privacidad`,changeFrequency:'monthly',priority:.3},
  ]
}
