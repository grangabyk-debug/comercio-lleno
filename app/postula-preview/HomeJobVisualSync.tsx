'use client'

import {useEffect} from 'react'
import {jobVisual} from '../empleos-preview/jobVisualCatalog'
import type {PreviewJob} from './jobs'

function text(root:Element,selector:string){
  return root.querySelector(selector)?.textContent?.trim()||''
}

function normalizeMode(value:string):PreviewJob['mode']{
  const v=value.toLowerCase()
  if(v.includes('remot'))return'Remoto'
  if(v.includes('híbr')||v.includes('hibr'))return'Híbrido'
  return'Presencial'
}

function syncHomeJobVisuals(){
  document.querySelectorAll<HTMLElement>('.pm7-social-job').forEach(card=>{
    const cover=card.querySelector<HTMLElement>('.pm7-social-job-cover')
    if(!cover)return

    const title=text(card,'.pm7-social-job-body>h3')
    const company=text(card,'.pm7-social-company b')
    const location=text(card,'.pm7-social-company small')
    const summary=text(card,'.pm7-social-job-body>p')
    const tags=Array.from(card.querySelectorAll('.pm7-social-tags span')).map(node=>node.textContent?.trim()||'').filter(Boolean)
    const area=tags[0]||''
    const schedule=tags[1]||''
    const href=card.querySelector<HTMLAnchorElement>('.pm7-social-job-foot a')?.getAttribute('href')||''
    const slug=href.split('/').filter(Boolean).pop()||title

    if(!title||!slug)return

    const job:PreviewJob={
      slug,
      title,
      company,
      location,
      mode:normalizeMode(text(card,'.pm7-social-job-cover>span')),
      schedule,
      area,
      source:'',
      sourceUrl:href,
      checkedAt:'',
      summary,
      requirements:[],
      tags,
      external:false,
    }

    cover.style.backgroundImage=`url(${jobVisual(job)})`
    cover.style.backgroundSize='cover'
    cover.style.backgroundPosition='center'
    cover.dataset.pmJobVisual='synced'
  })
}

export default function HomeJobVisualSync(){
  useEffect(()=>{
    syncHomeJobVisuals()
    const frame=requestAnimationFrame(syncHomeJobVisuals)
    return()=>cancelAnimationFrame(frame)
  },[])
  return null
}
